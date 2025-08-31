"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { UserRole } from "@/types/api";

export default function DashboardSidebar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const roleMap = [UserRole.Admin, UserRole.Author, UserRole.User];
  const rolesNormalized = (user?.roles ?? []).map((r: unknown) => {
    if (typeof r === "number") return roleMap[r] ?? "";
    if (typeof r === "string") return r.toLowerCase();
    return "";
  });
  const isAdmin = rolesNormalized.includes(UserRole.Admin);
  const links = [
    { href: "/dashboard", label: "Overview" },
    { href: "/dashboard/recipes", label: "Recipes" },
    // Categories visible only for Admins
    ...(isAdmin
      ? [
          { href: "/dashboard/categories", label: "Categories" },
          { href: "/dashboard/users", label: "Users" },
        ]
      : []),
    { href: "/dashboard/profile", label: "Profile" },
  ];
  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col gap-1 p-4 border-r border-gray-100">
      {links.map((l) => {
        const active = pathname === l.href;
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`rounded-lg px-3 py-2 text-sm ${
              active
                ? "bg-gray-100 text-gray-900"
                : "hover:bg-gray-50 text-gray-700"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </aside>
  );
}
