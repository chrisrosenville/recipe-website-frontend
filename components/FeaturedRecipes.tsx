"use client";
import { useEffect, useState } from "react";
import { recipes as recipesApi } from "@/lib/api";
import type { Recipe } from "@/types/api";
import RecipeGrid from "./RecipeGrid";

export default function FeaturedRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    recipesApi.getAll().then((res) => {
      setRecipes(res.data);
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
      ) : (
        <RecipeGrid recipes={recipes} limit={6} />
      )}
    </section>
  );
}
