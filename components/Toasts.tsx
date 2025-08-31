"use client";

import { useToastStore } from "@/store/toast";

export default function Toasts() {
  const { toasts, dismiss } = useToastStore();
  return (
    <div className="fixed inset-x-0 top-3 z-50 flex flex-col items-center gap-2 px-3">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto w-full max-w-md rounded-xl border px-4 py-3 shadow-sm bg-white ${
            t.type === "success"
              ? "border-emerald-200 text-emerald-900"
              : t.type === "error"
              ? "border-red-200 text-red-900"
              : "border-gray-200 text-gray-900"
          }`}
          role="status"
        >
          <div className="flex items-start gap-3">
            <div className="flex-1 text-sm">{t.message}</div>
            <button
              onClick={() => dismiss(t.id)}
              className="text-sm text-gray-500 hover:text-gray-900"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
