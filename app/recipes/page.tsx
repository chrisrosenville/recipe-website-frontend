"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { categories as categoriesApi, recipes as recipesApi } from "@/lib/api";
import type { Category, Recipe } from "@/types/api";
import RecipeGrid from "@/components/RecipeGrid";
import Header from "@/components/Header";

export default function RecipesPage() {
  const searchParams = useSearchParams();
  const qParam = searchParams.get("q")?.trim() || "";

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(qParam);
  const [activeCat, setActiveCat] = useState<number | "all">("all");

  useEffect(() => {
    setQuery(qParam);
  }, [qParam]);

  useEffect(() => {
    let mounted = true;
    Promise.all([recipesApi.getAll(), categoriesApi.getAll()]).then(
      ([r, c]) => {
        if (!mounted) return;
        setRecipes(r.data);
        setCategories(c.data);
        setLoading(false);
      }
    );
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const byCat =
      activeCat === "all"
        ? recipes
        : recipes.filter((r) => r.categoryId === activeCat);
    if (!query) return byCat;
    const q = query.toLowerCase();
    return byCat.filter((r) =>
      [r.name, r.description, ...(r.tags || []), ...(r.ingredients || [])]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [recipes, query, activeCat]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <div className="mx-auto max-w-6xl px-4 pt-28 sm:pt-32 pb-16 w-full">
        <header className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
            All recipes
          </h1>
          <p className="text-gray-700 mt-2">
            Search and filter community favorites.
          </p>
        </header>

        {/* Search and filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <form action="/recipes" method="get" className="w-full sm:max-w-md">
            <label className="sr-only" htmlFor="q">
              Search recipes
            </label>
            <div className="flex items-stretch rounded-xl border border-gray-200 bg-white shadow-sm focus-within:ring-2 focus-within:ring-amber-500/60">
              <input
                id="q"
                name="q"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search pasta, tacos, brownies…"
                className="flex-1 min-w-0 bg-transparent px-4 py-3 text-base outline-none text-gray-900 placeholder:text-gray-500"
              />
              <button className="px-5 py-3 bg-amber-600 text-white font-semibold rounded-r-xl hover:bg-amber-700 transition-colors">
                Search
              </button>
            </div>
          </form>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCat("all")}
              className={`px-3 py-1.5 rounded-lg border text-sm ${
                activeCat === "all"
                  ? "bg-amber-600 text-white border-amber-600"
                  : "border-gray-200 text-gray-800 hover:bg-gray-50"
              }`}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCat(c.id)}
                className={`px-3 py-1.5 rounded-lg border text-sm ${
                  activeCat === c.id
                    ? "bg-amber-600 text-white border-amber-600"
                    : "border-gray-200 text-gray-800 hover:bg-gray-50"
                }`}
                title={c.description || c.name}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center text-gray-500 py-12">
            Loading recipes…
          </div>
        ) : (
          <RecipeGrid recipes={filtered} />
        )}
      </div>
    </div>
  );
}
