"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  return (
    <div className="sm:hidden text-gray-900">
      <button
        aria-label="Open menu"
        className="p-2 rounded-md hover:bg-gray-100"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X size={24} /> : <Menu size={24} />}
      </button>
      {open && (
        <div className="absolute top-16 right-4 bg-white text-gray-900 shadow-lg rounded-xl py-4 px-6 flex flex-col gap-4 z-50 border border-gray-100 animate-fade-in">
          <Link
            href="/"
            className="hover:text-blue-600 transition-colors"
            onClick={() => setOpen(false)}
          >
            Home
          </Link>
          <Link
            href="/recipes"
            className="hover:text-blue-600 transition-colors"
            onClick={() => setOpen(false)}
          >
            Recipes
          </Link>
          <Link
            href="/dashboard"
            className="hover:text-blue-600 transition-colors"
            onClick={() => setOpen(false)}
          >
            Dashboard
          </Link>
          <Link
            href="/login"
            className="hover:text-blue-600 transition-colors"
            onClick={() => setOpen(false)}
          >
            Login
          </Link>
          <Link
            href="/register"
            className="hover:text-blue-600 transition-colors"
            onClick={() => setOpen(false)}
          >
            Sign Up
          </Link>
        </div>
      )}
    </div>
  );
}
