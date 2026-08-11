import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function getRequiredEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`${name} is not defined in environment variables.`);
    }

    return value;
}

function getStorageClient(): SupabaseClient {
    return createClient(
        getRequiredEnv("SUPABASE_URL"),
        getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY")
    );
}

function getStorageBucket(): string {
    return getRequiredEnv("SUPABASE_STORAGE_BUCKET");
}

export async function uploadTenderProposalFile(file: File, tenderId: string): Promise<string> {
    const storageClient = getStorageClient();
    const bucket = getStorageBucket();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = `tenders/${tenderId}/proposal-${Date.now()}-${sanitizedName}`;

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const { error: uploadError } = await storageClient.storage
        .from(bucket)
        .upload(filePath, fileBuffer, {
            contentType: file.type || "application/octet-stream",
            upsert: true,
        });

    if (uploadError) {
        throw uploadError;
    }

    const { data } = storageClient.storage.from(bucket).getPublicUrl(filePath);

    if (!data?.publicUrl) {
        throw new Error("UNABLE_TO_RESOLVE_PUBLIC_URL");
    }

    return data.publicUrl;
}
