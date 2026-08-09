import { prisma } from "@/src/infrastructure/prisma/prisma";
import { AuthUser } from "@/src/modules/auth/domain/entities/auth-user.entity";
import { AuthUserRepository } from "@/src/modules/auth/domain/repos/auth-user.repository";

export class PrismaAuthUserRepository implements AuthUserRepository {
  async findByEmail(email: string): Promise<AuthUser | null> {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        role: true,
      },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      role: user.role,
    };
  }
}