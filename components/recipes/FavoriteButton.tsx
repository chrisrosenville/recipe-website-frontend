"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { useToggleFavorite } from "@/lib/hooks";
import { useAuthStore } from "@/store/auth";

export default function FavoriteButton({
  recipeId,
  initialCount,
  initiallyFavorited = false,
}: {
  recipeId: number;
  initialCount: number;
  initiallyFavorited?: boolean;
}) {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const [favorited, setFavorited] = useState(initiallyFavorited);
  const [count, setCount] = useState(initialCount);

  const toggleFavorite = useToggleFavorite();

  const toggle = () => {
    if (!isLoggedIn || toggleFavorite.isPending) return;

    const newFavorited = !favorited;
    const newCount = newFavorited ? count + 1 : Math.max(0, count - 1);

    // Optimistic update
    setFavorited(newFavorited);
    setCount(newCount);

    toggleFavorite.mutate(
      { id: recipeId, isFavorited: favorited },
      {
        onError: () => {
          // Revert on error
          setFavorited(favorited);
          setCount(count);
        },
      }
    );
  };

  return (
    <button
      onClick={toggle}
      disabled={!isLoggedIn || toggleFavorite.isPending}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm shadow-md backdrop-blur-sm ${
        favorited
          ? "bg-rose-50/95 border-rose-200 text-rose-700"
          : "bg-white/95 border-gray-200 text-gray-800"
      } ${toggleFavorite.isPending ? "opacity-60" : ""}`}
      style={{ touchAction: "manipulation" }}
      aria-pressed={favorited}
      aria-label={favorited ? "Unfavorite" : "Favorite"}
      title={favorited ? "Unfavorite" : "Favorite"}
    >
      <Heart
        size={18}
        className={favorited ? "fill-rose-500 text-rose-500" : "text-rose-500"}
      />
      <span className="min-w-4 text-center tabular-nums">{count}</span>
    </button>
  );
}
