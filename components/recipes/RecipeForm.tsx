"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import CategorySelect from "./CategorySelect";
import type { CreateRecipeDto } from "@/types/dto";

const schema = z.object({
  name: z.string().min(3, "Name is too short"),
  description: z.string().min(10, "Please add a longer description"),
  categoryId: z.number().int(),
  ingredients: z.string().min(3, "Add at least one ingredient"),
  instructions: z.string().min(3, "Add at least one instruction"),
  image: z
    .string()
    .url("Provide a valid image URL")
    .optional()
    .or(z.literal("")),
  tags: z.string().optional().or(z.literal("")),
  cookingTimeHours: z.number().int().min(0).max(48),
  cookingTimeMinutes: z.number().int().min(0).max(59),
});

export type RecipeFormValues = z.infer<typeof schema>;

interface Props {
  defaultValues?: Partial<RecipeFormValues>;
  submitLabel?: string;
  onSubmit: (data: CreateRecipeDto) => Promise<void> | void;
}

export default function RecipeForm({
  defaultValues,
  submitLabel = "Save recipe",
  onSubmit,
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    setValue,
    getValues,
  } = useForm<RecipeFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      categoryId: undefined as unknown as number,
      ingredients: "",
      instructions: "",
      image: "",
      tags: "",
      cookingTimeHours: 0,
      cookingTimeMinutes: 0,
      ...defaultValues,
    },
  });

  const categoryId = getValues("categoryId");

  const submit = (values: RecipeFormValues) => {
    const payload: CreateRecipeDto = {
      name: values.name.trim(),
      description: values.description.trim(),
      categoryId: values.categoryId,
      ingredients: values.ingredients
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      instructions: values.instructions
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      image: values.image?.trim() || "/recipe-placeholder.png",
      tags: values.tags
        ? values.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
      cookingTimeHours: values.cookingTimeHours || 0,
      cookingTimeMinutes: values.cookingTimeMinutes || 0,
    };
    return onSubmit(payload);
  };

  // warn on unsaved changes
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    if (isDirty) {
      window.addEventListener("beforeunload", handler);
    } else {
      window.removeEventListener("beforeunload", handler);
    }
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  return (
    <form
      onSubmit={handleSubmit(submit)}
      className="space-y-4"
      onReset={(e) => {
        e.preventDefault();
      }}
    >
      <div>
        <label className="block text-sm font-medium text-gray-900">Name</label>
        <input
          {...register("name")}
          className="mt-1 block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-900"
          placeholder="e.g., Creamy Tomato Pasta"
        />
        {errors.name && (
          <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900">
          Description
        </label>
        <textarea
          {...register("description")}
          rows={4}
          className="mt-1 block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-900"
          placeholder="Short, inviting description of your recipe"
        />
        {errors.description && (
          <p className="text-sm text-red-600 mt-1">
            {errors.description.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900">
          Category
        </label>
        <div className="mt-1">
          <CategorySelect
            value={categoryId ?? ""}
            onChange={(v) => setValue("categoryId", v)}
          />
        </div>
        {errors.categoryId && (
          <p className="text-sm text-red-600 mt-1">Category is required</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-900">
            Ingredients
          </label>
          <textarea
            {...register("ingredients")}
            rows={6}
            className="mt-1 block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-900"
            placeholder={"One per line\n2 cups flour\n1 tsp salt"}
          />
          {errors.ingredients && (
            <p className="text-sm text-red-600 mt-1">
              {errors.ingredients.message}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900">
            Instructions
          </label>
          <textarea
            {...register("instructions")}
            rows={6}
            className="mt-1 block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-900"
            placeholder={"Step-by-step, one per line"}
          />
          {errors.instructions && (
            <p className="text-sm text-red-600 mt-1">
              {errors.instructions.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-900">
            Image URL
          </label>
          <input
            {...register("image")}
            className="mt-1 block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-900"
            placeholder="https://..."
          />
          {errors.image && (
            <p className="text-sm text-red-600 mt-1">{errors.image.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900">
            Tags
          </label>
          <input
            {...register("tags")}
            className="mt-1 block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-900"
            placeholder="comma,separated,tags"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-900">
            Hours
          </label>
          <input
            type="number"
            min={0}
            max={48}
            {...register("cookingTimeHours", { valueAsNumber: true })}
            className="mt-1 block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900">
            Minutes
          </label>
          <input
            type="number"
            min={0}
            max={59}
            {...register("cookingTimeMinutes", { valueAsNumber: true })}
            className="mt-1 block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-900"
          />
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-amber-600 text-white px-4 py-2 font-semibold hover:bg-amber-700 disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
