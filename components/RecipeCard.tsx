import Image from "next/image";
import Link from "next/link";
import type { Recipe } from "@/types/api";

export default function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <Link
      href={`/recipes/${recipe.id}`}
      className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col hover:scale-[1.02] transition-transform border border-gray-100"
      aria-label={`View ${recipe.name}`}
    >
      <div className="h-52 w-full bg-gray-100 flex items-center justify-center">
        <Image
          src={recipe.image || "/recipe-placeholder.png"}
          alt={recipe.name}
          width={640}
          height={208}
          className="object-cover w-full h-full"
        />
      </div>
      <div className="p-5 flex flex-col gap-2 flex-1">
        <h3 className="font-semibold text-lg text-gray-900 truncate">
          {recipe.name}
        </h3>
        <p className="text-gray-600 text-sm line-clamp-2">
          {recipe.description}
        </p>
        <div className="flex gap-2 flex-wrap mt-auto">
          <span className="bg-blue-100 text-blue-700 rounded px-2 py-0.5 text-xs">
            {recipe.category?.name}
          </span>
          <span className="bg-emerald-100 text-emerald-700 rounded px-2 py-0.5 text-xs">
            {recipe.cookingTimeMinutes} min
          </span>
        </div>
      </div>
    </Link>
  );
}
