import { cookies } from "next/headers";
import { verifyAuthToken } from "@/src/modules/auth/jwt";

export async function requireAuth() {
    const token = (await cookies()).get("access_token")?.value;
    if (!token) {
        throw new Error("UNAUTHORIZED");
    }

    try {
        return verifyAuthToken(token);
    } catch {
        throw new Error("UNAUTHORIZED");
    }
}