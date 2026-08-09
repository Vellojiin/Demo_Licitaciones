import { cookies } from "next/headers";
import { verifyAuthToken } from "../../jwt";

export async function requireAuth() {
    const token = (await cookies()).get("access_token")?.value;
    if (!token) {
        throw new Error("Access token is missing.");
    }

    try {
        return verifyAuthToken(token);
    } catch {
        throw new Error("Invalid or expired access token.");
    }
}