import { ApiCall } from "@/src/shared/utils/api-client";

export interface UserListItem {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "USER";
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: "ADMIN" | "USER";
}

export async function listUsers(): Promise<UserListItem[]> {
  return ApiCall<UserListItem[]>("/api/users", {
    method: "GET",
    credentials: "include",
  });
}

export async function createUser(input: CreateUserInput): Promise<UserListItem> {
  return ApiCall<UserListItem>("/api/users", {
    method: "POST",
    credentials: "include",
    body: {
      name: input.name,
      email: input.email,
      password: input.password,
      role: input.role,
    },
  });
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  password?: string;
  role?: "ADMIN" | "USER";
}

export async function updateUser(
  id: string,
  input: UpdateUserInput
): Promise<UserListItem> {
  return ApiCall<UserListItem>(`/api/users/${id}`, {
    method: "PATCH",
    credentials: "include",
    body: {
      name: input.name?.trim() || undefined,
      email: input.email,
      password: input.password || undefined,
      role: input.role,
    },
  });
}