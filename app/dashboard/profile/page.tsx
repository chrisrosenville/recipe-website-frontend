"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/store/auth";
import { users as usersApi } from "@/lib/api";
import { toast } from "react-toastify";
import type { Recipe, User } from "@/types/api";
import RecipeGrid from "@/components/RecipeGrid";
import Modal from "@/components/ui/Modal";
import Link from "next/link";

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user) as User | null;
  const [favorites, setFavorites] = useState<Recipe[] | null>(null);
  const [myRecipes, setMyRecipes] = useState<Recipe[] | null>(null);
  const [editing, setEditing] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "" });
  const [form, setForm] = useState({
    displayName: user?.displayName ?? "",
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    email: user?.email ?? "",
  });
  // keep form in sync if user changes
  useEffect(() => {
    setForm({
      displayName: user?.displayName ?? "",
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      email: user?.email ?? "",
    });
  }, [user]);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!user) return;
      try {
        const [favRes, myRes] = await Promise.all([
          usersApi.getFavorites(user.id),
          usersApi.getRecipes(user.id),
        ]);
        if (!active) return;
        setFavorites(favRes.data);
        setMyRecipes(myRes.data);
      } catch {
        if (!active) return;
        setFavorites([]);
        setMyRecipes([]);
      }
    })();
    return () => {
      active = false;
    };
  }, [user]);

  const initials = useMemo(() => {
    if (!user) return "";
    const name = user.displayName || `${user.firstName} ${user.lastName}`;
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase())
      .join("");
  }, [user]);

  const roleBadges = (user?.roles ?? []).map((r) => (
    <span
      key={String(r)}
      className="inline-flex items-center rounded-full border border-gray-200 bg-white px-2 py-0.5 text-xs text-gray-800"
    >
      {String(r)}
    </span>
  ));

  const stats = useMemo(() => {
    const created = myRecipes?.length ?? 0;
    const liked = favorites?.length ?? 0;
    const totalFavsReceived = (myRecipes ?? []).reduce(
      (sum, r) => sum + (r.favoritesCount ?? 0),
      0
    );
    return { created, liked, totalFavsReceived };
  }, [favorites, myRecipes]);

  if (!user) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 text-gray-700">
        You need to be signed in to view your profile.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">
            Profile
          </h1>
          <p className="text-gray-700 mt-1">
            Manage your account and activity.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            onClick={() => setEditing(true)}
          >
            Edit profile
          </button>
          <button
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            onClick={() => setChangingPw(true)}
          >
            Change password
          </button>
        </div>
      </header>

      {/* Profile card */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center text-lg font-semibold text-gray-700">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-gray-900 truncate">
              {user.displayName}
            </h2>
            <p className="text-gray-700 truncate">{user.email}</p>
            <div className="mt-2 flex flex-wrap gap-2 items-center">
              {roleBadges}
              {user.canSubmitRecipes ? (
                <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">
                  can submit recipes
                </span>
              ) : null}
              <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-2 py-0.5 text-xs text-gray-800">
                member since {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        {/* Quick stats */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="text-sm text-gray-600">Recipes created</div>
            <div className="mt-1 text-2xl font-bold text-gray-900">
              {myRecipes ? stats.created : "–"}
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="text-sm text-gray-600">
              Total favorites received
            </div>
            <div className="mt-1 text-2xl font-bold text-gray-900">
              {myRecipes ? stats.totalFavsReceived : "–"}
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="text-sm text-gray-600">Recipes you like</div>
            <div className="mt-1 text-2xl font-bold text-gray-900">
              {favorites ? stats.liked : "–"}
            </div>
          </div>
        </div>
      </section>

      {/* Favorite recipes */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Your favorite recipes
          </h3>
          <Link
            href="/dashboard/profile/favorites"
            className="text-sm text-blue-600 hover:underline"
          >
            See all
          </Link>
        </div>
        {favorites === null ? (
          <div className="text-gray-500">Loading favorites…</div>
        ) : favorites.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-5 text-gray-700">
            You haven’t liked any recipes yet.
          </div>
        ) : (
          <RecipeGrid recipes={favorites} />
        )}
      </section>

      {/* Your latest recipes */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Your recent recipes
          </h3>
          <Link
            href="/dashboard/recipes"
            className="text-sm text-blue-600 hover:underline"
          >
            See all
          </Link>
        </div>
        {myRecipes === null ? (
          <div className="text-gray-500">Loading your recipes…</div>
        ) : myRecipes.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-5 text-gray-700">
            You haven’t created any recipes yet.
          </div>
        ) : (
          <RecipeGrid recipes={[...myRecipes].slice(0, 6)} />
        )}
      </section>
      <EditProfileModal
        open={editing}
        onClose={() => setEditing(false)}
        form={form}
        setForm={setForm}
        onSave={async () => {
          try {
            await usersApi.updateMe(form);
            // refresh auth store with new values
            useAuthStore.setState((s) => ({
              ...s,
              user: s.user
                ? {
                    ...s.user,
                    displayName: form.displayName,
                    firstName: form.firstName,
                    lastName: form.lastName,
                    email: form.email,
                  }
                : s.user,
            }));
            toast.success("Profile updated");
            setEditing(false);
          } catch {
            toast.error("Failed to update profile");
          }
        }}
      />
      <ChangePasswordModal
        open={changingPw}
        onClose={() => {
          setChangingPw(false);
          setPwForm({ currentPassword: "", newPassword: "" });
        }}
        form={pwForm}
        setForm={setPwForm}
        onSave={async () => {
          try {
            if (!pwForm.currentPassword || !pwForm.newPassword) {
              toast.error("Please fill out both fields");
              return;
            }
            await usersApi.changePassword(pwForm);
            toast.success("Password updated");
            setChangingPw(false);
            setPwForm({ currentPassword: "", newPassword: "" });
          } catch (e: unknown) {
            const err = e as { response?: { data?: unknown } };
            const msg = err?.response?.data ?? "Failed to update password";
            toast.error(typeof msg === "string" ? msg : "Failed to update password");
          }
        }}
      />
    </div>
  );
}

function EditProfileModal({
  open,
  onClose,
  form,
  setForm,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  form: {
    displayName: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  setForm: React.Dispatch<
    React.SetStateAction<{
      displayName: string;
      firstName: string;
      lastName: string;
      email: string;
    }>
  >;
  onSave: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit profile"
      description="Update your public profile details."
      footer={
        <>
          <button
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="rounded-md bg-amber-600 px-3 py-2 text-sm font-medium text-white"
            onClick={onSave}
          >
            Save changes
          </button>
        </>
      }
    >
      <div className="grid gap-3">
        <label className="grid gap-1 text-sm">
          <span className="text-gray-700">Display name</span>
          <input
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900"
            value={form.displayName}
            onChange={(e) =>
              setForm((f) => ({ ...f, displayName: e.target.value }))
            }
          />
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="grid gap-1 text-sm">
            <span className="text-gray-700">First name</span>
            <input
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900"
              value={form.firstName}
              onChange={(e) =>
                setForm((f) => ({ ...f, firstName: e.target.value }))
              }
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-gray-700">Last name</span>
            <input
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900"
              value={form.lastName}
              onChange={(e) =>
                setForm((f) => ({ ...f, lastName: e.target.value }))
              }
            />
          </label>
        </div>
        <label className="grid gap-1 text-sm">
          <span className="text-gray-700">Email</span>
          <input
            type="email"
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
        </label>
      </div>
    </Modal>
  );
}

function ChangePasswordModal({
  open,
  onClose,
  form,
  setForm,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  form: { currentPassword: string; newPassword: string };
  setForm: React.Dispatch<
    React.SetStateAction<{ currentPassword: string; newPassword: string }>
  >;
  onSave: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Change password"
      description="Update your account password."
      footer={
        <>
          <button
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="rounded-md bg-amber-600 px-3 py-2 text-sm font-medium text-white"
            onClick={onSave}
          >
            Update password
          </button>
        </>
      }
    >
      <div className="grid gap-3">
        <label className="grid gap-1 text-sm">
          <span className="text-gray-700">Current password</span>
          <input
            type="password"
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900"
            value={form.currentPassword}
            onChange={(e) =>
              setForm((f) => ({ ...f, currentPassword: e.target.value }))
            }
          />
        </label>
        <label className="grid gap-1 text-sm">
          <span className="text-gray-700">New password</span>
          <input
            type="password"
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900"
            value={form.newPassword}
            onChange={(e) =>
              setForm((f) => ({ ...f, newPassword: e.target.value }))
            }
          />
        </label>
      </div>
    </Modal>
  );
}
