"use client";

import { useAuthStore } from "@/store/auth";
import DashboardCard from "@/components/dashboard/DashboardCard";
import { useEffect, useState } from "react";
import { users as usersApi } from "@/lib/api";

export default function DashboardHome() {
  const user = useAuthStore((s) => s.user);
  const [favCount, setFavCount] = useState<number | null>(null);
  const [myCount, setMyCount] = useState<number | null>(null);

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
        setFavCount(favRes.data.length);
        setMyCount(myRes.data.length);
      } catch {
        if (!active) return;
        setFavCount(0);
        setMyCount(0);
      }
    })();
    return () => {
      active = false;
    };
  }, [user]);
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
          Welcome back{user ? `, ${user.displayName}` : ""}
        </h1>
        <p className="text-gray-700 mt-2">
          Here’s a quick snapshot of your activity.
        </p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <DashboardCard
          title="Favorite recipes"
          value={favCount === null ? "–" : favCount}
          hint={favCount === null ? undefined : undefined}
        />
        <DashboardCard
          title="Your recipes"
          value={myCount === null ? "–" : myCount}
          hint={undefined}
        />
        <DashboardCard title="Tips" value="✨" hint="See below" />
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
        <h2 className="text-lg font-semibold text-gray-900">Getting started</h2>
        <ul className="mt-2 list-disc pl-5 text-sm text-gray-700 space-y-1">
          <li>Add your first recipe under “Recipes”</li>
          <li>Organize with categories under “Categories”</li>
          <li>Update your profile details and preferences</li>
        </ul>
      </section>
    </div>
  );
}
