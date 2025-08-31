"use client";

import { useEffect, useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { recipes as recipesApi } from "@/lib/api";
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
  const [isPending, startTransition] = useTransition();
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await recipesApi.getFavoriteInfo(recipeId);
        if (!active) return;
        setFavorited(res.data.isFavorited);
        setCount(res.data.count);
      } catch {
        // ignore
      }
    })();
    return () => {
      active = false;
    };
  }, [recipeId]);

  const toggle = () => {
    if (!isLoggedIn || isPending) return;
    startTransition(async () => {
      try {
        if (favorited) {
          await recipesApi.unfavorite(recipeId);
          setFavorited(false);
          setCount((c) => Math.max(0, c - 1));
        } else {
          await recipesApi.favorite(recipeId);
          setFavorited(true);
          setCount((c) => c + 1);
        }
      } catch {
        // no-op: keep previous state on failure
      }
    });
  };

  return (
    <button
      onClick={toggle}
      disabled={!isLoggedIn}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm shadow-md backdrop-blur-sm ${
        favorited
          ? "bg-rose-50/95 border-rose-200 text-rose-700"
          : "bg-white/95 border-gray-200 text-gray-800"
      } ${isPending ? "opacity-60" : ""}`}
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
