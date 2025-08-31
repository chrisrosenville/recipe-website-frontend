"use client";

import RecipeForm from "@/components/recipes/RecipeForm";
import { recipes as recipesApi } from "@/lib/api";
import type { CreateRecipeDto } from "@/types/dto";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function NewRecipePage() {
  const router = useRouter();

  const handleCreate = async (data: CreateRecipeDto) => {
    try {
      await recipesApi.create(data);
      toast.success("Recipe created");
      router.push("/dashboard/recipes");
    } catch {
      toast.error("Failed to create recipe");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">
          New recipe
        </h1>
        <p className="text-gray-700 mt-1">
          Share something delicious. Drafts can be submitted later.
        </p>
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6">
        <RecipeForm submitLabel="Create recipe" onSubmit={handleCreate} />
      </div>
    </div>
  );
}
