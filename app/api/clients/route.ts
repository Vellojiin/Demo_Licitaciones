import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAuth } from "@/src/modules/auth/infrastructure/http/require-auth";
import { CreateClientUseCase } from "@/src/modules/clients/application/use-cases/create-client.use-case";
import { PrismaClientRepository } from "@/src/modules/clients/infrastructure/repos/prisma-client.repository";

export const dynamic = "force-dynamic";

const createClientSchema = z.object({
  companyName: z.string().trim().min(1, "companyName is required"),
  contactName: z.string().trim().optional(),
  email: z.string().trim().email("Invalid email"),
});

export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const data = createClientSchema.parse(body);

    const repository = new PrismaClientRepository();
    const useCase = new CreateClientUseCase(repository);

    const client = await useCase.execute({
      companyName: data.companyName,
      contactName: data.contactName,
      email: data.email,
      userId: session.userId,
    });

    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ issues: error.issues }, { status: 422 });
    }

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    await requireAuth();

    const repository = new PrismaClientRepository();
    const clients = await repository.findAll();

    return NextResponse.json(clients, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}