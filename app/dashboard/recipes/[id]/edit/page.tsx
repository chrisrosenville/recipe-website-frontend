"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import RecipeForm, {
  type RecipeFormValues,
} from "@/components/recipes/RecipeForm";
import { recipes as recipesApi } from "@/lib/api";
import type { Recipe } from "@/types/api";
import { RecipeStatus } from "@/types/api";
import type { CreateRecipeDto } from "@/types/dto";
import { toast } from "react-toastify";

export default function EditRecipePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const id = Number(params.id);
    if (!id) return;
    recipesApi
      .getById(id)
      .then((res) => {
        if (!mounted) return;
        setRecipe(res.data);
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [params.id]);

  const handleUpdate = async (data: CreateRecipeDto) => {
    if (!recipe) return;
    try {
      await recipesApi.update(recipe.id, { ...recipe, ...data });
      toast.success("Recipe updated");
      router.push("/dashboard/recipes");
    } catch {
      toast.error("Failed to update recipe");
    }
  };

  if (loading) {
    return <p className="text-gray-600">Loading…</p>;
  }
  if (!recipe) {
    return <p className="text-gray-600">Recipe not found.</p>;
  }

  const defaults: Partial<RecipeFormValues> = {
    name: recipe.name,
    description: recipe.description,
    categoryId: recipe.categoryId,
    ingredients: recipe.ingredients.join("\n"),
    instructions: recipe.instructions.join("\n"),
    image: recipe.image,
    tags: recipe.tags.join(", "),
    cookingTimeHours: recipe.cookingTimeHours,
    cookingTimeMinutes: recipe.cookingTimeMinutes,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">
          Edit recipe
        </h1>
        <p className="text-gray-700 mt-1">
          Update details and save your changes.
        </p>
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 space-y-4">
        <RecipeForm
          defaultValues={defaults}
          submitLabel="Save changes"
          onSubmit={handleUpdate}
        />
        {recipe.currentStatus === RecipeStatus.Draft && (
          <div className="pt-2">
            <button
              onClick={async () => {
                try {
                  await recipesApi.update(recipe.id, {
                    currentStatus: RecipeStatus.Pending,
                  });
                  toast.success("Submitted for review");
                  router.push("/dashboard/recipes");
                } catch {
                  toast.error("Failed to submit for review");
                }
              }}
              className="rounded-lg border border-amber-200 bg-amber-50 text-amber-900 px-4 py-2 font-semibold hover:bg-amber-100"
            >
              Submit for review
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
