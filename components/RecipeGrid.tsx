import RecipeCard from "./RecipeCard";
import type { Recipe } from "@/types/api";

export default function RecipeGrid({
  recipes,
  limit,
}: {
  recipes: Recipe[];
  limit?: number;
}) {
  if (!recipes.length) {
    return <div className="text-center text-gray-500">No recipes found.</div>;
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
      {(limit ? recipes.slice(0, limit) : recipes).map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} />
      ))}
    </div>
  );
}
