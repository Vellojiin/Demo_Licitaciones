import { ApiCall } from "@/src/shared/utils/api-client";
import type { UserRole } from "@/src/modules/auth/domain/entities/auth-user.entity";

interface LoginRequest {
    email: string;
    password: string;
}

interface LoginResponse {
    user: {
        id: string;
        name: string;
        email: string;
        role: UserRole;
    };
}

export async function authenticateUser({ email, password }: LoginRequest): Promise<LoginResponse> {
    return ApiCall<LoginResponse>("/api/auth", {
        method: "POST",
        body: { email, password },
        credentials: "include",
    });
}
