import { Prisma } from "@prisma/client";

import { prisma } from "@/src/infrastructure/prisma/prisma";
import { UserAlreadyExistsError } from "@/src/modules/auth/domain/errors/user-already-exists.error";
import { AuthUser } from "@/src/modules/auth/domain/entities/auth-user.entity";
import { AuthUserRepository } from "@/src/modules/auth/domain/repos/auth-user.repository";

export class PrismaAuthUserRepository implements AuthUserRepository {
  async create(user: AuthUser): Promise<AuthUser> {
    let createdUser;
    try {
      createdUser = await prisma.user.create({
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          passwordHash: user.passwordHash,
          role: user.role,
        },
        select: {
          id: true,
          name: true,
          email: true,
          passwordHash: true,
          role: true,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new UserAlreadyExistsError();
      }
      throw error;
    }

    return {
      id: createdUser.id,
      name: createdUser.name,
      email: createdUser.email,
      passwordHash: createdUser.passwordHash,
      role: createdUser.role,
    };
  }

  async findByEmail(email: string): Promise<AuthUser | null> {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
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
      name: user.name,
      email: user.email,
      passwordHash: user.passwordHash,
      role: user.role,
    };
  }
}