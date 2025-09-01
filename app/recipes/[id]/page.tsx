"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useRecipe } from "@/lib/hooks";
import Header from "@/components/Header";
import EditLinkIfOwner from "../../../components/recipes/EditLinkIfOwner";
import { Calendar, Clock, Tag as TagIcon, ChefHat } from "lucide-react";
import FavoriteButton from "@/components/recipes/FavoriteButton";

export default function RecipeDetailPage() {
  const params = useParams();
  const id = Number(params.id);

  const { data: recipe, isLoading, error } = useRecipe(id);

  if (isLoading) {
    return (
      <div>
        <Header />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-24">
          <div className="text-center text-gray-500 py-12">
            Loading recipe...
          </div>
        </main>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div>
        <Header />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-24">
          <div className="text-center text-red-600 py-12">
            Recipe not found or error loading recipe.
          </div>
        </main>
      </div>
    );
  }

  // Ensure recipe has all required properties
  const {
    id: recipeId,
    name,
    description,
    image,
    category,
    user,
    ingredients = [],
    instructions = [],
    tags = [],
    cookingTimeHours = 0,
    cookingTimeMinutes = 0,
    favoritesCount = 0,
    createdAt,
    updatedAt,
    userId: recipeUserId,
  } = recipe;

  return (
    <div>
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-24">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm">
          <ol className="flex items-center gap-2 text-gray-500">
            <li>
              <Link href="/recipes" className="hover:text-gray-900">
                Recipes
              </Link>
            </li>
            <li className="text-gray-300">/</li>
            <li className="text-gray-700 truncate max-w-[60ch]">Details</li>
          </ol>
        </nav>

        <article className="space-y-5">
          <div className="rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm">
            <div className="relative w-full h-64 sm:h-80">
              <Image
                src={image || "/recipe-placeholder.png"}
                alt={name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 800px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              <div className="absolute top-3 right-3">
                <FavoriteButton
                  recipeId={recipeId}
                  initialCount={favoritesCount}
                />
              </div>
            </div>
            <div className="p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-2 py-0.5 text-xs text-gray-800">
                  {category?.name || "Uncategorized"}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
                {name}
              </h1>
              <p className="text-gray-700 mt-2">{description}</p>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600">
                <span className="inline-flex items-center gap-1.5">
                  <ChefHat size={16} />
                  {user?.displayName ||
                    `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
                    "Unknown User"}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Calendar size={16} />
                  {createdAt
                    ? new Date(createdAt).toLocaleDateString()
                    : "Unknown date"}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock size={16} />
                  {cookingTimeHours > 0 ? `${cookingTimeHours}h ` : ""}
                  {cookingTimeMinutes}m
                </span>
              </div>
              {tags && tags.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {tags.map((t, i) => (
                    <span
                      key={`${t}-${i}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-2 py-0.5 text-xs text-gray-800"
                    >
                      <TagIcon size={14} /> #{t}
                    </span>
                  ))}
                </div>
              ) : null}
              <div className="mt-3">
                <EditLinkIfOwner
                  recipeUserId={recipeUserId}
                  recipeId={recipeId}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Sidebar */}
            <aside className="lg:col-span-1 space-y-5 lg:sticky lg:top-28 h-fit">
              <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900">Details</h2>
                <ul className="mt-2 text-sm text-gray-700 space-y-1.5">
                  <li className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-2 text-gray-600">
                      <ChefHat size={16} /> Category
                    </span>
                    <span className="text-gray-900">
                      {category?.name || "Uncategorized"}
                    </span>
                  </li>

                  <li className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-2 text-gray-600">
                      <Clock size={16} /> Cook time
                    </span>
                    <span className="text-gray-900">
                      {cookingTimeHours > 0 ? `${cookingTimeHours}h ` : ""}
                      {cookingTimeMinutes}m
                    </span>
                  </li>

                  <li className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-2 text-gray-600">
                      <Calendar size={16} /> Created
                    </span>
                    <span className="text-gray-900">
                      {createdAt
                        ? new Date(createdAt).toLocaleDateString()
                        : "Unknown date"}
                    </span>
                  </li>
                  <li className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-2 text-gray-600">
                      <Calendar size={16} /> Updated
                    </span>
                    <span className="text-gray-900">
                      {updatedAt
                        ? new Date(updatedAt).toLocaleDateString()
                        : "Unknown date"}
                    </span>
                  </li>
                </ul>
              </section>

              <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900">
                  Ingredients
                </h2>
                <ul className="mt-2 list-disc list-inside text-gray-800 space-y-1 marker:text-gray-400">
                  {ingredients && ingredients.length > 0 ? (
                    ingredients.map((ing, i) => <li key={i}>{ing}</li>)
                  ) : (
                    <li>No ingredients listed.</li>
                  )}
                </ul>
              </section>
            </aside>

            {/* Main content */}
            <section className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">
                Instructions
              </h2>
              <ol className="mt-2 list-decimal list-inside text-gray-800 space-y-1.5">
                {instructions && instructions.length > 0 ? (
                  instructions.map((step, i) => <li key={i}>{step}</li>)
                ) : (
                  <li>No instructions provided.</li>
                )}
              </ol>
            </section>
          </div>
        </article>
      </main>
    </div>
  );
}
