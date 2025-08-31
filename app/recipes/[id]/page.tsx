import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import type { Recipe } from "@/types/api";
import { RecipeStatus } from "@/types/api";
import EditLinkIfOwner from "../../../components/recipes/EditLinkIfOwner";
import type { Metadata } from "next";
import { Calendar, Clock, Tag as TagIcon, ChefHat } from "lucide-react";
import FavoriteButton from "@/components/recipes/FavoriteButton";

async function getRecipe(id: number) {
  const base =
    process.env.NEXT_INTERNAL_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8080/api";
  try {
    const res = await fetch(`${base}/recipe/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as Recipe;
    return data;
  } catch {
    return null;
  }
}

export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numId = Number(id);
  if (!numId) return notFound();
  const recipe = await getRecipe(numId);
  if (!recipe) return notFound();

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

        {/* status banner removed per request */}

        <article className="space-y-5">
          <div className="rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm">
            <div className="relative w-full h-64 sm:h-80">
              <Image
                src={recipe.image || "/recipe-placeholder.png"}
                alt={recipe.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 800px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              <div className="absolute top-3 right-3">
                <FavoriteButton
                  recipeId={recipe.id}
                  initialCount={recipe.favoritesCount ?? 0}
                />
              </div>
            </div>
            <div className="p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-2 py-0.5 text-xs text-gray-800">
                  {recipe.category?.name}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
                {recipe.name}
              </h1>
              <p className="text-gray-700 mt-2">{recipe.description}</p>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600">
                <span className="inline-flex items-center gap-1.5">
                  <ChefHat size={16} />
                  {recipe.user?.displayName ||
                    `${recipe.user?.firstName} ${recipe.user?.lastName}`}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Calendar size={16} />
                  {new Date(recipe.createdAt).toLocaleDateString()}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock size={16} />
                  {recipe.cookingTimeHours
                    ? `${recipe.cookingTimeHours}h `
                    : ""}
                  {recipe.cookingTimeMinutes}m
                </span>
                {/* Favorites are shown in the image overlay via FavoriteButton */}
              </div>
              {recipe.tags?.length ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {recipe.tags.map((t, i) => (
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
                  recipeUserId={recipe.userId}
                  recipeId={recipe.id}
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
                      {recipe.category?.name}
                    </span>
                  </li>

                  <li className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-2 text-gray-600">
                      <Clock size={16} /> Cook time
                    </span>
                    <span className="text-gray-900">
                      {recipe.cookingTimeHours
                        ? `${recipe.cookingTimeHours}h `
                        : ""}
                      {recipe.cookingTimeMinutes}m
                    </span>
                  </li>

                  <li className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-2 text-gray-600">
                      <Calendar size={16} /> Created
                    </span>
                    <span className="text-gray-900">
                      {new Date(recipe.createdAt).toLocaleDateString()}
                    </span>
                  </li>
                  <li className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-2 text-gray-600">
                      <Calendar size={16} /> Updated
                    </span>
                    <span className="text-gray-900">
                      {new Date(recipe.updatedAt).toLocaleDateString()}
                    </span>
                  </li>
                </ul>
              </section>

              <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900">
                  Ingredients
                </h2>
                <ul className="mt-2 list-disc list-inside text-gray-800 space-y-1 marker:text-gray-400">
                  {recipe.ingredients?.length ? (
                    recipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>)
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
                {recipe.instructions?.length ? (
                  recipe.instructions.map((step, i) => <li key={i}>{step}</li>)
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const recipe = await getRecipe(Number(id));
  const title = recipe ? `${recipe.name} – Recipe Hub` : "Recipe – Recipe Hub";
  const description = recipe?.description?.slice(0, 160);
  return {
    title,
    description,
  };
}
