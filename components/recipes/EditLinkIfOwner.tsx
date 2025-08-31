"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/auth";

export default function EditLinkIfOwner({
  recipeUserId,
  recipeId,
}: {
  recipeUserId: number;
  recipeId: number;
}) {
  const user = useAuthStore((s) => s.user);
  if (!user || user.id !== recipeUserId) return null;
  return (
    <Link
      href={`/dashboard/recipes/${recipeId}/edit`}
      className="px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
    >
      Edit this recipe
    </Link>
  );
}
