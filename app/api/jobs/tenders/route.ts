import { NextResponse } from "next/server";

import { ProcessTenderJobsUseCase } from "@/src/modules/jobs/application/use-cases/process-tender-jobs.use-case";
import { PrismaTenderRepository } from "@/src/modules/tenders/infrastructure/repos/prisma-tender.repository";

function authorizeCron(request: Request): boolean {
    const expectedSecret = process.env.CRON_SECRET || process.env.JOBS_CRON_SECRET;
    if (!expectedSecret) {
        return false;
    }

    const authHeader = request.headers.get("authorization");
    const customHeader = request.headers.get("x-cron-secret");

    if (authHeader === `Bearer ${expectedSecret}`) {
        return true;
    }

    if (customHeader === expectedSecret) {
        return true;
    }

    return false;
}

async function runJobs(request: Request) {
    if (!authorizeCron(request)) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const systemUserId = process.env.JOBS_SYSTEM_USER_ID;
    if (!systemUserId) {
        return NextResponse.json({ message: "JOBS_SYSTEM_USER_ID is not configured" }, { status: 500 });
    }

    const repository = new PrismaTenderRepository();
    const useCase = new ProcessTenderJobsUseCase(repository);
    const result = await useCase.execute({
        systemUserId,
        reminderWindowHours: 48,
    });

    return NextResponse.json(result, { status: 200 });
}

export async function GET(request: Request) {
    return runJobs(request);
}

export async function POST(request: Request) {
    return runJobs(request);
}