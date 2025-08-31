"use client";

import { useMemo, useState } from "react";
import Header from "@/components/Header";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loginStore = useAuthStore((s) => s.login);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const strength = useMemo(() => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score; // 0-5
  }, [password]);
  const strengthLabel =
    ["Very weak", "Weak", "Okay", "Good", "Strong", "Excellent"][strength] ||
    "Very weak";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!firstName || !lastName || !displayName || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await auth.register({
        firstName,
        lastName,
        displayName,
        email,
        password,
      });
      // Try to auto-login for a smooth experience
      try {
        const res = await auth.login({ email, password });
        if (res.data) loginStore(res.data);
        router.push("/dashboard");
        return;
      } catch {}
      // Fallback: go to login with a hint
      router.push("/login");
    } catch (err: unknown) {
      const anyErr = err as { response?: { data?: unknown } };
      const msg = anyErr.response?.data;
      setError(
        typeof msg === "string" ? msg : "Registration failed. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-md px-4 pt-28 sm:pt-32 pb-16">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            Sign up
          </h1>
          <p className="text-gray-700 mt-2">
            Create your account to save and share recipes.
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-800"
                >
                  First name
                </label>
                <input
                  id="firstName"
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm outline-none placeholder:text-gray-500 focus:ring-2 focus:ring-amber-500/60 text-gray-900"
                  placeholder="Jane"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-800"
                >
                  Last name
                </label>
                <input
                  id="lastName"
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm outline-none placeholder:text-gray-500 focus:ring-2 focus:ring-amber-500/60 text-gray-900"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="displayName"
                className="block text-sm font-medium text-gray-800"
              >
                Display name
              </label>
              <input
                id="displayName"
                className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm outline-none placeholder:text-gray-500 focus:ring-2 focus:ring-amber-500/60 text-gray-900"
                placeholder="Chef Jane"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-800"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm outline-none placeholder:text-gray-500 focus:ring-2 focus:ring-amber-500/60 text-gray-900"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-800"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 pr-12 py-3 shadow-sm outline-none placeholder:text-gray-500 focus:ring-2 focus:ring-amber-500/60 text-gray-900"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-700 hover:text-gray-900"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
              <div>
                <label
                  htmlFor="confirm"
                  className="block text-sm font-medium text-gray-800"
                >
                  Confirm password
                </label>
                <div className="relative">
                  <input
                    id="confirm"
                    type={showConfirm ? "text" : "password"}
                    autoComplete="new-password"
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 pr-12 py-3 shadow-sm outline-none placeholder:text-gray-500 focus:ring-2 focus:ring-amber-500/60 text-gray-900"
                    placeholder="••••••••"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-700 hover:text-gray-900"
                    onClick={() => setShowConfirm((v) => !v)}
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                  >
                    {showConfirm ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    strength <= 1
                      ? "bg-red-400 w-1/6"
                      : strength === 2
                      ? "bg-orange-400 w-2/6"
                      : strength === 3
                      ? "bg-yellow-400 w-3/6"
                      : strength === 4
                      ? "bg-emerald-400 w-5/6"
                      : "bg-green-500 w-full"
                  }`}
                />
              </div>
              <p className="text-xs text-gray-600">
                Password strength: {strengthLabel}
              </p>
              <ul className="text-xs text-gray-600 list-disc pl-5">
                <li>Use at least 8 characters</li>
                <li>Include uppercase and lowercase letters</li>
                <li>Add numbers and a symbol for a stronger password</li>
              </ul>
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-amber-600 text-white font-semibold py-3 hover:bg-amber-700 transition-colors disabled:opacity-60"
            >
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className="mt-4 text-sm text-gray-700">
            Already have an account? {""}
            <Link
              href="/login"
              className="font-medium text-amber-700 hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
