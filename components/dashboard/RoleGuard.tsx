"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import type { UserRole } from "@/types/api";

export default function RoleGuard({
  children,
  roles,
}: {
  children: ReactNode;
  roles?: UserRole[];
}) {
  const router = useRouter();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const user = useAuthStore((s) => s.user);
  const roleMap: UserRole[] = [
    "admin",
    "author",
    "user",
  ] as unknown as UserRole[];
  const rolesNormalized = (user?.roles ?? []).map((r: unknown) => {
    if (typeof r === "number") return roleMap[r] ?? ("" as UserRole);
    if (typeof r === "string") return r.toLowerCase() as UserRole;
    return "" as UserRole;
  });

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/login");
      return;
    }
    if (roles && roles.length > 0) {
      const hasRole = rolesNormalized.some((r) => roles.includes(r));
      if (!hasRole) router.replace("/dashboard");
    }
  }, [isLoggedIn, roles, router, rolesNormalized]);

  if (!isLoggedIn) return null;
  if (roles && roles.length > 0) {
    const hasRole = rolesNormalized.some((r) => roles.includes(r));
    if (!hasRole) return null;
  }
  return <>{children}</>;
}
