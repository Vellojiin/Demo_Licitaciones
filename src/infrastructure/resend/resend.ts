import { Resend } from "resend";

import { TenderActivationEmailData } from "@/src/modules/tenders/domain/entities/tender.entity";

function getRequiredEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`${name} is not defined in environment variables.`);
    }

    return value;
}

function getResendClient(): Resend {
    return new Resend(getRequiredEnv("RESEND_API_KEY"));
}

function getFromAddress(): string {
    return getRequiredEnv("RESEND_FROM_EMAIL");
}

function formatMoney(value: number): string {
    return new Intl.NumberFormat("es-PA", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    }).format(value);
}

function buildProductsSummary(products: TenderActivationEmailData["products"]): string {
    return products
        .map((product) => `- ${product.name} x${product.quantity} (${formatMoney(product.unitPrice)})`)
        .join("<br />");
}

async function downloadAttachment(url: string): Promise<{ content: Buffer; filename: string; contentType: string }> {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("UNABLE_TO_DOWNLOAD_PROPOSAL_DOCUMENT");
    }

    const contentType = response.headers.get("content-type") || "application/octet-stream";
    const contentDisposition = response.headers.get("content-disposition") || "";
    const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/i);
    const filename = filenameMatch?.[1] || "proposal-document";
    const content = Buffer.from(await response.arrayBuffer());

    return { content, filename, contentType };
}

export async function sendTenderActivationEmail(data: TenderActivationEmailData): Promise<void> {
    if (!data.tender.proposalDocumentUrl) {
        throw new Error("PROPOSAL_DOCUMENT_REQUIRED");
    }

    const attachment = await downloadAttachment(data.tender.proposalDocumentUrl);
    const productsText = buildProductsSummary(data.products);

    await getResendClient().emails.send({
        from: getFromAddress(),
        to: "delivered@resend.dev", //data.client.email,
        subject: `Licitación activada: ${data.tender.title}`,
        html: `
            <h2>Licitación activada</h2>
            <p>Hola ${data.client.companyName},</p>
            <p>Tu licitación fue activada con este resumen:</p>
            <p><strong>Título:</strong> ${data.tender.title}</p>
            <p><strong>Fecha límite:</strong> ${data.tender.deadline.toLocaleString("es-CO")}</p>
            <p><strong>Presupuesto máximo:</strong> ${formatMoney(data.tender.maxBudget)}</p>
            <p><strong>Productos:</strong><br />${productsText || "Sin productos registrados"}</p>
        `,
        attachments: [
            {
                filename: attachment.filename,
                content: attachment.content,
                contentType: attachment.contentType,
            },
        ],
    });
}

export async function sendTenderReminderEmail(data: TenderActivationEmailData): Promise<void> {
    const productsText = buildProductsSummary(data.products);

    await getResendClient().emails.send({
        from: getFromAddress(),
        to: data.client.email,
        subject: `Recordatorio de licitación: ${data.tender.title}`,
        html: `
            <h2>Recordatorio de licitación</h2>
            <p>Hola ${data.client.companyName},</p>
            <p>Tu licitación sigue activa y está próxima a vencer.</p>
            <p><strong>Título:</strong> ${data.tender.title}</p>
            <p><strong>Fecha límite:</strong> ${data.tender.deadline.toLocaleString("es-CO")}</p>
            <p><strong>Presupuesto máximo:</strong> ${formatMoney(data.tender.maxBudget)}</p>
            <p><strong>Documento de propuesta:</strong> ${
                data.tender.proposalDocumentUrl || "No disponible"
            }</p>
            <p><strong>Productos:</strong><br />${productsText || "Sin productos registrados"}</p>
        `,
    });
}
