"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/store/auth";
import { users as usersApi } from "@/lib/api";
import type { Recipe, User } from "@/types/api";
import RecipeGrid from "@/components/RecipeGrid";

export default function ProfileFavoritesPage() {
  const user = useAuthStore((s) => s.user) as User | null;
  const [recipes, setRecipes] = useState<Recipe[] | null>(null);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<
    "newest" | "oldest" | "most_favorited" | "a_to_z" | "z_to_a"
  >("newest");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!user) return;
      setLoading(true);
      try {
        const res = await usersApi.getFavorites(user.id);
        if (!active) return;
        setRecipes(res.data);
      } catch {
        if (!active) return;
        setRecipes([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [user]);

  const filtered = useMemo(() => {
    if (!recipes) return null;
    const s = q.trim().toLowerCase();
    const base = s
      ? recipes.filter(
          (r) =>
            r.name.toLowerCase().includes(s) ||
            r.description.toLowerCase().includes(s) ||
            r.category?.name?.toLowerCase().includes(s)
        )
      : recipes;

    const sorted = [...base];
    sorted.sort((a, b) => {
      switch (sort) {
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "most_favorited":
          return (b.favoritesCount ?? 0) - (a.favoritesCount ?? 0);
        case "a_to_z":
          return a.name.localeCompare(b.name);
        case "z_to_a":
          return b.name.localeCompare(a.name);
        case "newest":
        default:
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }
    });
    return sorted;
  }, [recipes, q, sort]);

  if (!user) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 text-gray-700">
        You need to be signed in to view your favorites.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">
            Your favorite recipes
          </h1>
          <p className="text-gray-700 mt-1">
            Browse and manage all recipes you liked.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search favorites"
            className="w-full sm:w-64 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="rounded-md border border-gray-300 bg-white px-2 py-2 text-sm focus:border-gray-400 focus:outline-none"
            aria-label="Sort favorites"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="most_favorited">Most favorited</option>
            <option value="a_to_z">A → Z</option>
            <option value="z_to_a">Z → A</option>
          </select>
        </div>
      </header>

      {loading ? (
        <div className="text-gray-500">Loading favorites…</div>
      ) : !filtered || filtered.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-5 text-gray-700">
          {q ? "No matching favorites." : "You haven’t liked any recipes yet."}
        </div>
      ) : (
        <RecipeGrid recipes={filtered} />
      )}
    </div>
  );
}
