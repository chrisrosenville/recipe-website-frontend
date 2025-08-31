"use client";

import { ReactNode, useEffect, useState } from "react";
import { auth } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

export default function AuthProvider({ children }: { children: ReactNode }) {
  const loginStore = useAuthStore((s) => s.login);
  const logoutStore = useAuthStore((s) => s.logout);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;
    auth
      .me()
      .then((res) => {
        if (!mounted) return;
        if (res.data) loginStore(res.data);
      })
      .catch(() => {
        if (!mounted) return;
        logoutStore();
      })
      .finally(() => {
        if (!mounted) return;
        setHydrated(true);
      });
    return () => {
      mounted = false;
    };
  }, [loginStore, logoutStore]);

  if (!hydrated) {
    return null;
  }
  return <>{children}</>;
}
