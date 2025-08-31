"use client";

import RoleGuard from "@/components/dashboard/RoleGuard";
import { users as userApi } from "@/lib/api";
import { AdminUser, UserRole } from "@/types/api";
import { useAuthStore } from "@/store/auth";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { Search, ChevronLeft, ChevronRight, Trash } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

export default function UsersPage() {
  const me = useAuthStore((s) => s.user);
  const [items, setItems] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [pendingDelete, setPendingDelete] = useState<AdminUser | null>(null);

  const load = async (query?: string, p = page) => {
    setLoading(true);
    try {
      const res = await userApi.search(query, p, pageSize);
      setItems(res.data.items);
      setTotal(res.data.total);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter(
      (u) =>
        u.displayName.toLowerCase().includes(s) ||
        u.email.toLowerCase().includes(s) ||
        u.firstName.toLowerCase().includes(s) ||
        u.lastName.toLowerCase().includes(s)
    );
  }, [items, q]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const hasRole = (u: AdminUser, role: UserRole) =>
    (u.roles ?? []).includes(role);

  const toggleRole = async (u: AdminUser, role: UserRole) => {
    // prevent self-demotion for Admin
    if (me?.id === u.id && role === UserRole.Admin && hasRole(u, role)) {
      toast.info("You cannot remove your own admin role here.");
      return;
    }
    const current = new Set(
      (u.roles ?? []).map((r) => r.toString().toLowerCase())
    ) as Set<UserRole | string>;
    const next = new Set(current) as Set<UserRole | string>;
    if (current.has(role)) next.delete(role);
    else next.add(role);
    next.add(UserRole.User);
    const nextArr = Array.from(next) as UserRole[];

    const prev = items;
    setItems((s) =>
      s.map((x) => (x.id === u.id ? { ...x, roles: nextArr } : x))
    );
    setSavingId(u.id);
    try {
      await userApi.updateRoles(u.id, nextArr);
      toast.success("Roles updated");
    } catch (err: unknown) {
      setItems(prev);
      const status = (err as { response?: { status?: number } })?.response
        ?.status;
      if (status === 409) toast.error("Cannot remove the last admin.");
      else toast.error("Failed to update roles");
    } finally {
      setSavingId(null);
    }
  };

  const toggleSubmit = async (u: AdminUser) => {
    const prev = items;
    const nextVal = !u.canSubmitRecipes;
    setItems((s) =>
      s.map((x) => (x.id === u.id ? { ...x, canSubmitRecipes: nextVal } : x))
    );
    setSavingId(u.id);
    try {
      await userApi.updatePermissions(u.id, { canSubmitRecipes: nextVal });
      toast.success("Permissions updated");
    } catch {
      setItems(prev);
      toast.error("Failed to update permissions");
    } finally {
      setSavingId(null);
    }
  };

  const onDelete = async (u: AdminUser) => {
    setPendingDelete(null);
    try {
      await userApi.delete(u.id);
      toast.success("User deleted");
      // If last item on page removed, adjust page
      const remaining = total - 1;
      const newTotalPages = Math.max(1, Math.ceil(remaining / pageSize));
      if (page > newTotalPages) setPage(newTotalPages);
      else await load(q, page);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response
        ?.status;
      if (status === 409)
        toast.error("Cannot delete this user (last admin or self).");
      else toast.error("Failed to delete user");
    }
  };

  return (
    <RoleGuard roles={[UserRole.Admin]}>
      <div className="max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h1 className="text-xl font-semibold text-gray-900">Users</h1>
          <div className="flex items-center gap-2">
            <div className="relative w-72 max-w-full">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by name or email"
                className="w-full rounded-md border border-gray-300 bg-white pl-8 pr-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-3 py-2">User</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Roles</th>
                <th className="px-3 py-2">Can submit</th>
                <th className="px-3 py-2">Stats</th>
                <th className="px-3 py-2 w-28">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-3 py-6 text-gray-500" colSpan={6}>
                    Loading users...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td className="px-3 py-6 text-gray-500" colSpan={6}>
                    No users found.
                  </td>
                </tr>
              ) : (
                filtered.map((u) => {
                  const isAdmin = hasRole(u, UserRole.Admin);
                  const isAuthor = hasRole(u, UserRole.Author);
                  const selfRow = me?.id === u.id;
                  return (
                    <tr key={u.id} className="border-t border-gray-100">
                      <td className="px-3 py-2 align-top">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">
                            {u.displayName}
                          </span>
                          <span className="text-xs text-gray-500">
                            {u.firstName} {u.lastName}
                          </span>
                          <span className="text-[11px] text-gray-400">
                            Member since{" "}
                            {new Date(u.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2 align-top">
                        <span className="text-gray-700">{u.email}</span>
                      </td>
                      <td className="px-3 py-2 align-top">
                        <div className="flex items-center gap-3">
                          <label className="inline-flex items-center gap-2 text-xs">
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-gray-300"
                              checked={isAdmin}
                              onChange={() => toggleRole(u, UserRole.Admin)}
                              disabled={savingId === u.id || selfRow}
                            />
                            <span className="text-gray-800">Admin</span>
                          </label>
                          <label className="inline-flex items-center gap-2 text-xs">
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-gray-300"
                              checked={isAuthor}
                              onChange={() => toggleRole(u, UserRole.Author)}
                              disabled={savingId === u.id}
                            />
                            <span className="text-gray-800">Author</span>
                          </label>
                        </div>
                      </td>
                      <td className="px-3 py-2 align-top">
                        <label className="inline-flex items-center gap-2 text-xs">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300"
                            checked={u.canSubmitRecipes}
                            onChange={() => toggleSubmit(u)}
                            disabled={savingId === u.id}
                          />
                          <span className="text-gray-800">Allowed</span>
                        </label>
                      </td>
                      <td className="px-3 py-2 align-top">
                        <div className="flex flex-col text-xs text-gray-700">
                          <span>
                            <span className="text-gray-500">Recipes:</span>{" "}
                            {u.recipesCount}
                          </span>
                          <span>
                            <span className="text-gray-500">
                              Favorites received:
                            </span>{" "}
                            {u.favoritesReceived}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2 align-top">
                        <button
                          className="inline-flex items-center gap-2 rounded-md border border-red-200 text-red-700 px-2 py-1 text-xs font-medium hover:bg-red-50 disabled:opacity-50"
                          onClick={() => setPendingDelete(u)}
                          disabled={selfRow}
                          title={
                            selfRow
                              ? "You cannot delete your own account"
                              : "Delete user"
                          }
                        >
                          <Trash className="h-4 w-4" /> Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-3 text-sm text-gray-600">
          <span>
            Page {page} of {totalPages} • {total} users
          </span>
          <div className="flex items-center gap-2">
            <button
              className="inline-flex items-center gap-1 rounded-md border border-gray-300 px-2 py-1 hover:bg-gray-50 disabled:opacity-50"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" /> Prev
            </button>
            <button
              className="inline-flex items-center gap-1 rounded-md border border-gray-300 px-2 py-1 hover:bg-gray-50 disabled:opacity-50"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <ConfirmDialog
          open={!!pendingDelete}
          title="Delete user"
          description={
            pendingDelete
              ? `Are you sure you want to delete ${pendingDelete.displayName}? This action cannot be undone.`
              : undefined
          }
          confirmText="Delete"
          confirmVariant="danger"
          onCancel={() => setPendingDelete(null)}
          onConfirm={async () => {
            if (pendingDelete) {
              await onDelete(pendingDelete);
            }
          }}
        />
      </div>
    </RoleGuard>
  );
}
