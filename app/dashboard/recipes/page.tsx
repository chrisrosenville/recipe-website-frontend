"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth";
import { users as usersApi, recipes as recipesApi } from "@/lib/api";
import type { Recipe } from "@/types/api";
import { RecipeStatus } from "@/types/api";
import { toast } from "react-toastify";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

export default function UserRecipesPage() {
  const user = useAuthStore((s) => s.user);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"all" | RecipeStatus>("all");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  const hasRole = (target: "admin" | "author" | "user") => {
    const roles = user?.roles ?? [];
    return roles.some((role) => {
      const v = typeof role === "string" ? role.toLowerCase() : role;
      return v === target;
    });
  };
  const canAuthorActions = hasRole("author") || hasRole("admin");

  useEffect(() => {
    let mounted = true;
    if (!user) return;
    usersApi
      .getRecipes(user.id)
      .then((res) => {
        if (!mounted) return;
        setRecipes(res.data);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [user]);

  const updateLocal = (id: number, patch: Partial<Recipe>) => {
    setRecipes((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...patch } : r))
    );
  };

  const handleSubmitForReview = async (r: Recipe) => {
    setBusyId(r.id);
    try {
      await recipesApi.update(r.id, { currentStatus: RecipeStatus.Pending });
      updateLocal(r.id, { currentStatus: RecipeStatus.Pending });
      toast.success("Submitted for review");
    } finally {
      setBusyId(null);
    }
  };

  const handleRevertToDraft = async (r: Recipe) => {
    setBusyId(r.id);
    try {
      await recipesApi.update(r.id, { currentStatus: RecipeStatus.Draft });
      updateLocal(r.id, { currentStatus: RecipeStatus.Draft });
      toast.success("Reverted to draft");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = (r: Recipe) => {
    setPendingDeleteId(r.id);
  };

  const filteredSorted = useMemo(() => {
    const filtered =
      status === "all"
        ? recipes
        : recipes.filter((r) => r.currentStatus === status);
    const sorted = [...filtered].sort((a, b) => {
      const dA = new Date(a.createdAt).getTime();
      const dB = new Date(b.createdAt).getTime();
      return sort === "newest" ? dB - dA : dA - dB;
    });
    return sorted;
  }, [recipes, status, sort]);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">
            Your recipes
          </h1>
          <p className="text-gray-700 mt-1">
            Create, manage, and edit your submissions.
          </p>
        </div>
        <Link
          href="/dashboard/recipes/new"
          className="rounded-lg bg-amber-600 text-white px-4 py-2 font-semibold hover:bg-amber-700"
        >
          New recipe
        </Link>
      </header>

      {/* Filters and sorting */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatus("all")}
            className={`px-3 py-1.5 rounded-lg border text-sm ${
              status === "all"
                ? "bg-amber-600 text-white border-amber-600"
                : "border-gray-200 text-gray-800 hover:bg-gray-50"
            }`}
          >
            All
          </button>
          {[
            RecipeStatus.Draft,
            RecipeStatus.Pending,
            RecipeStatus.Approved,
          ].map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-3 py-1.5 rounded-lg border text-sm ${
                status === s
                  ? "bg-amber-600 text-white border-amber-600"
                  : "border-gray-200 text-gray-800 hover:bg-gray-50"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="sm:ml-auto">
          <label className="sr-only" htmlFor="sort">
            Sort
          </label>
          <select
            id="sort"
            value={sort}
            onChange={(e) =>
              setSort(e.target.value === "newest" ? "newest" : "oldest")
            }
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-gray-500">Loading…</div>
      ) : recipes.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-gray-700">
          You haven’t added any recipes yet. Start by creating one.
        </div>
      ) : (
        <ul className="divide-y divide-gray-100 rounded-2xl border border-gray-200 bg-white">
          {filteredSorted.map((r) => (
            <li
              key={r.id}
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {r.name}
                  </h3>
                  <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-2 py-0.5 text-xs text-gray-800">
                    {r.currentStatus}
                  </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {r.description}
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  Created {new Date(r.createdAt).toLocaleDateString()}
                </p>
                <div className="mt-1 text-xs text-gray-500">
                  In {r.category?.name} • {r.cookingTimeMinutes} min
                </div>
              </div>
              <div className="flex items-center gap-2 sm:justify-end">
                <Link
                  href={`/recipes/${r.id}`}
                  className="px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                >
                  View
                </Link>
                <Link
                  href={`/dashboard/recipes/${r.id}/edit`}
                  className="px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                >
                  Edit
                </Link>
                {canAuthorActions && r.currentStatus === RecipeStatus.Draft && (
                  <button
                    onClick={() => handleSubmitForReview(r)}
                    disabled={busyId === r.id}
                    className="px-3 py-2 text-sm rounded-lg border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 disabled:opacity-50"
                  >
                    Submit for review
                  </button>
                )}
                {canAuthorActions &&
                  r.currentStatus === RecipeStatus.Pending && (
                    <button
                      onClick={() => handleRevertToDraft(r)}
                      disabled={busyId === r.id}
                      className="px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Revert to draft
                    </button>
                  )}
                {canAuthorActions && (
                  <button
                    onClick={() => handleDelete(r)}
                    disabled={busyId === r.id}
                    className="px-3 py-2 text-sm rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50"
                  >
                    Delete
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={pendingDeleteId !== null}
        title="Delete recipe"
        description={(() => {
          const recipe = recipes.find((x) => x.id === pendingDeleteId);
          return recipe
            ? `Are you sure you want to delete "${recipe.name}"? This action cannot be undone.`
            : undefined;
        })()}
        confirmText="Delete"
        confirmVariant="danger"
        onCancel={() => setPendingDeleteId(null)}
        onConfirm={async () => {
          const id = pendingDeleteId;
          setPendingDeleteId(null);
          if (id == null) return;
          setBusyId(id);
          try {
            await recipesApi.delete(id);
            setRecipes((prev) => prev.filter((x) => x.id !== id));
            toast.success("Recipe deleted");
          } finally {
            setBusyId(null);
          }
        }}
      />
    </div>
  );
}
