"use client";

import Link from "next/link";
import MobileNav from "@/components/MobileNav";
import { useState } from "react";
import { User } from "lucide-react";
import { auth } from "@/lib/api";
import { Playfair_Display } from "next/font/google";
import { useAuthStore } from "@/store/auth";

const brandFont = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700"],
});

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const logoutStore = useAuthStore((s) => s.logout);

  const handleSignOut = async () => {
    try {
      await auth.logout();
    } catch {}
    logoutStore();
    setMenuOpen(false);
    // refresh to reflect state
    window.location.reload();
  };

  return (
    <header className="w-full px-4 py-6 flex items-center justify-between bg-white/90 shadow-sm fixed top-0 left-0 z-20 backdrop-blur-md text-gray-900">
      <div className="flex items-center">
        <span
          className={`${brandFont.className} font-semibold text-xl tracking-tight`}
        >
          Recipe Hub
        </span>
      </div>
      <nav className="hidden sm:flex gap-6 text-base font-medium items-center text-gray-900">
        <Link href="/" className="hover:text-blue-600 transition-colors">
          Home
        </Link>
        <Link href="/recipes" className="hover:text-blue-600 transition-colors">
          Recipes
        </Link>
        <div className="relative">
          <button
            aria-label="Account"
            onClick={() => setMenuOpen((v) => !v)}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <User size={22} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-44 rounded-xl border border-gray-200 bg-white shadow-lg py-2 z-50">
              {!isLoggedIn ? (
                <>
                  <Link
                    href="/login"
                    className="block px-4 py-2 hover:bg-gray-50"
                    onClick={() => setMenuOpen(false)}
                  >
                    Log in
                  </Link>
                  <Link
                    href="/register"
                    className="block px-4 py-2 hover:bg-gray-50"
                    onClick={() => setMenuOpen(false)}
                  >
                    Sign up
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/dashboard"
                    className="block px-4 py-2 hover:bg-gray-50"
                    onClick={() => setMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    className="block w-full text-left px-4 py-2 hover:bg-gray-50"
                    onClick={handleSignOut}
                  >
                    Sign out
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </nav>
      <MobileNav />
    </header>
  );
}
