"use client";
import { useEffect, useState } from "react";
import { recipes as recipesApi } from "@/lib/api";
import type { Recipe } from "@/types/api";
import RecipeGrid from "./RecipeGrid";

export default function FeaturedRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    recipesApi
      .getAll(1, 6)
      .then((res) => {
        setRecipes(res.data.items);
        setLoading(false);
      })
      .catch((err) => {
        console.error("FeaturedRecipes: API error:", err);
        setError(err.message || "Failed to load recipes");
        setLoading(false);
      });
  }, []);

  return (
    <section className="w-full max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-left text-gray-900">
        Featured Recipes
      </h2>
      {loading ? (
        <div className="text-center text-gray-500">Loading recipes...</div>
      ) : error ? (
        <div className="text-center text-red-500">Error: {error}</div>
      ) : recipes.length === 0 ? (
        <div className="text-center text-gray-500">No recipes found</div>
      ) : (
        <>
          <div className="text-sm text-gray-600 mb-4">
            Found {recipes.length} recipes
          </div>
          <RecipeGrid recipes={recipes} limit={6} />
        </>
      )}
    </section>
  );
}
