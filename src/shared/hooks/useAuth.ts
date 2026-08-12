import { useSyncExternalStore, useState } from "react";
import { useRouter } from "next/navigation";
import type { UserRole } from "@/src/modules/auth/domain/entities/auth-user.entity";

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

function normalizeStoredUser(savedUser: string): AuthenticatedUser | null {
  const parsedUser: unknown = JSON.parse(savedUser);

  if (!parsedUser || typeof parsedUser !== "object") {
    return null;
  }

  const { id, email, name, role } = parsedUser as {
    id?: unknown;
    email?: unknown;
    name?: unknown;
    role?: unknown;
  };

  if (
    typeof id !== "string" ||
    typeof email !== "string" ||
    (role !== "ADMIN" && role !== "USER")
  ) {
    return null;
  }

  return {
    id,
    email,
    name: typeof name === "string" && name.trim() ? name : email,
    role,
  };
}

function getStoredUser(): AuthenticatedUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  const savedUser = localStorage.getItem("user");
  if (!savedUser) {
    return null;
  }

  try {
    return normalizeStoredUser(savedUser);
  } catch (error) {
    console.error("Error parsing saved user:", error);
    localStorage.removeItem("user");
    return null;
  }
}

function subscribeToHydration(): () => void {
  return () => undefined;
}

export function useAuth() {
  const router = useRouter();
  const hasHydrated = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false
  );
  const [user, setUser] = useState<AuthenticatedUser | null>(() => getStoredUser());
  const isLoading = !hasHydrated;

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    router.push("/login");
  };

  const login = (newUser: AuthenticatedUser) => {
    setUser(newUser);
    localStorage.setItem("user", JSON.stringify(newUser));
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout,
    login,
  };
}
