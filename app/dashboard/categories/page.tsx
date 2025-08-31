"use client";

import RoleGuard from "@/components/dashboard/RoleGuard";
import { UserRole } from "@/types/api";
import { useEffect, useMemo, useState } from "react";
import { categories } from "@/lib/api";
import type { Category } from "@/types/api";
import { toast } from "react-toastify";
import { Plus, Pencil, Check, X, Trash } from "lucide-react";
import { CreateCategoryDto } from "@/types/dto";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

export default function CategoriesPage() {
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newCat, setNewCat] = useState<CreateCategoryDto>({
    name: "",
    description: "",
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<{
    name: string;
    description?: string;
  }>({ name: "" });
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    categories
      .getAll()
      .then((res) => mounted && setItems(res.data))
      .catch(() => toast.error("Failed to load categories"))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const canCreate = useMemo(() => newCat.name.trim().length > 0, [newCat.name]);

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditDraft({ name: cat.name, description: cat.description });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft({ name: "" });
  };

  const saveEdit = async (id: number) => {
    if (!editDraft.name.trim()) {
      toast.info("Name is required");
      return;
    }
    const prev = items;
    const next = prev.map((c) => (c.id === id ? { ...c, ...editDraft } : c));
    setItems(next);
    setEditingId(null);
    try {
      await categories.update(id, editDraft);
      toast.success("Category updated");
    } catch {
      setItems(prev);
      toast.error("Failed to update category");
    }
  };

  const remove = async (id: number) => {
    const prev = items;
    setItems((s) => s.filter((c) => c.id !== id));
    try {
      await categories.delete(id);
      toast.success("Category deleted");
    } catch (err: unknown) {
      setItems(prev);
      const status = (err as { response?: { status?: number } })?.response
        ?.status;
      if (status === 409) {
        toast.error("Cannot delete a category that has recipes.");
      } else {
        toast.error("Failed to delete category");
      }
    }
  };

  const create = async () => {
    if (!canCreate) return;
    setCreating(true);
    try {
      const res = await categories.create({
        name: newCat.name.trim(),
        description: newCat.description?.trim() || undefined,
      });
      setItems((s) =>
        [...s, res.data].sort((a, b) => a.name.localeCompare(b.name))
      );
      setNewCat({ name: "", description: "" });
      toast.success("Category created");
    } catch {
      toast.error("Failed to create category");
    } finally {
      setCreating(false);
    }
  };

  return (
    <RoleGuard roles={[UserRole.Admin]}>
      <div className="max-w-4xl">
        <h1 className="text-xl font-semibold text-gray-900 mb-4">Categories</h1>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-600">
                Name
              </label>
              <input
                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
                placeholder="e.g. Breakfast"
                value={newCat.name}
                onChange={(e) =>
                  setNewCat((s) => ({ ...s, name: e.target.value }))
                }
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-600">
                Description
              </label>
              <input
                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
                placeholder="Optional description"
                value={newCat.description ?? ""}
                onChange={(e) =>
                  setNewCat((s) => ({ ...s, description: e.target.value }))
                }
              />
            </div>
            <button
              onClick={create}
              disabled={!canCreate || creating}
              className="inline-flex items-center gap-2 rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
          </div>

          <div className="overflow-hidden rounded-md border border-gray-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Description</th>
                  <th className="px-3 py-2 w-28">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className="px-3 py-6 text-gray-500" colSpan={3}>
                      Loading categories...
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td className="px-3 py-6 text-gray-500" colSpan={3}>
                      No categories yet.
                    </td>
                  </tr>
                ) : (
                  items.map((c) => {
                    const isEditing = editingId === c.id;
                    return (
                      <tr key={c.id} className="border-t border-gray-100">
                        <td className="px-3 py-2 align-top">
                          {isEditing ? (
                            <input
                              className="w-full rounded-md border border-gray-300 bg-white px-2 py-1 text-sm focus:border-gray-400 focus:outline-none"
                              value={editDraft.name}
                              onChange={(e) =>
                                setEditDraft((s) => ({
                                  ...s,
                                  name: e.target.value,
                                }))
                              }
                            />
                          ) : (
                            <span className="font-medium text-gray-900">
                              {c.name}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 align-top">
                          {isEditing ? (
                            <input
                              className="w-full rounded-md border border-gray-300 bg-white px-2 py-1 text-sm focus:border-gray-400 focus:outline-none"
                              value={editDraft.description ?? ""}
                              onChange={(e) =>
                                setEditDraft((s) => ({
                                  ...s,
                                  description: e.target.value,
                                }))
                              }
                            />
                          ) : (
                            <span className="text-gray-700">
                              {c.description || "—"}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <button
                                className="inline-flex items-center rounded-md bg-green-600 px-2 py-1 text-xs font-medium text-white"
                                onClick={() => saveEdit(c.id)}
                              >
                                <Check className="h-4 w-4" />
                              </button>
                              <button
                                className="inline-flex items-center rounded-md bg-gray-200 px-2 py-1 text-xs font-medium text-gray-800"
                                onClick={cancelEdit}
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <button
                                className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-2 py-1 text-xs font-medium text-gray-800 hover:bg-gray-50"
                                onClick={() => startEdit(c)}
                              >
                                <Pencil className="h-4 w-4" /> Edit
                              </button>
                              <button
                                className="inline-flex items-center gap-2 rounded-md border border-red-200 text-red-700 px-2 py-1 text-xs font-medium hover:bg-red-50"
                                onClick={() => setPendingDeleteId(c.id)}
                              >
                                <Trash className="h-4 w-4" /> Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <ConfirmDialog
          open={pendingDeleteId !== null}
          title="Delete category"
          description={(() => {
            const cat = items.find((c) => c.id === pendingDeleteId);
            return cat
              ? `Are you sure you want to delete "${cat.name}"? This action cannot be undone.`
              : undefined;
          })()}
          confirmText="Delete"
          confirmVariant="danger"
          onCancel={() => setPendingDeleteId(null)}
          onConfirm={() => {
            const id = pendingDeleteId;
            setPendingDeleteId(null);
            if (id != null) void remove(id);
          }}
        />
      </div>
    </RoleGuard>
  );
}
