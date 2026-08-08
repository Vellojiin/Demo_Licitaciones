import { NextResponse } from "next/server";

import { CreateClientUseCase } from "@/src/modules/clients/application/use-case/create-client.use-case";
import { PrismaClientRepository } from "@/src/modules/clients/infrastructure/repos/prisma-client.repository";

export async function POST(request: Request) {
    const body = await request.json();

    const repository = new PrismaClientRepository();

    const useCase = new CreateClientUseCase(repository);

    const client = await useCase.execute({
        companyName: body.companyName,
        contactName: body.contactName,
        email: body.email,
        userId: body.userId,
    });

    return NextResponse.json(client, { status: 201 });
}