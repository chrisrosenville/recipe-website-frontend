"use client";

import { useEffect, useState } from "react";
import { categories as categoriesApi } from "@/lib/api";
import type { Category } from "@/types/api";

interface Props {
  value?: number | "";
  onChange: (value: number) => void;
}

export default function CategorySelect({ value = "", onChange }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    let mounted = true;
    categoriesApi.getAll().then((res) => {
      if (!mounted) return;
      setCategories(res.data);
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <select
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 w-full"
      required
    >
      <option value="" disabled>
        Select category
      </option>
      {categories.map((c) => (
        <option key={c.id} value={c.id}>
          {c.name}
        </option>
      ))}
    </select>
  );
}
