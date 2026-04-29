"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { AppShell } from "@/components/app-shell";
import { fetchProfile, isSupabaseConfigured, signInWithPassword, upsertProfile } from "@/lib/supabase";
import { clearSession, getSession, isLoggedIn, saveSession } from "@/lib/session";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const run = async () => {
      if (!isLoggedIn()) return;

      // If session exists but is invalid, clear it so login page is reachable.
      const token = getSession()?.access_token;
      if (!token) return;

      if (isSupabaseConfigured) {
        const { user } = await (await import("@/lib/supabase")).fetchAuthUser(token);
        if (!user) {
          clearSession();
          return;
        }
      }

      router.replace("/dashboard");
    };

    void run();
  }, [router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isSupabaseConfigured) {
      setMessage("Add your Supabase keys in .env.local before logging in.");
      return;
    }

    try {
      setIsSubmitting(true);
      setMessage("");

      const result = await signInWithPassword(email, password);

      if (result.error_description || result.msg || result.error) {
        setMessage(result.error_description || result.msg || result.error);
        return;
      }

      if (result.access_token) {
        saveSession({
          access_token: result.access_token,
          refresh_token: result.refresh_token,
          token_type: result.token_type,
          expires_in: result.expires_in,
          user: result.user,
        });

        // Ensure a matching public.profiles row exists for this auth user.
        const userId = result.user?.id as string | undefined;
        if (userId) {
          const profileResult = await fetchProfile(result.access_token, userId);
          const hasProfile = Boolean(profileResult.data?.[0]?.id);

          if (!hasProfile) {
            const meta = (result.user?.user_metadata ?? {}) as Record<string, unknown>;
            const fallbackName =
              (typeof meta.full_name === "string" && meta.full_name) ||
              email.split("@")[0] ||
              "New user";

            await upsertProfile({
              accessToken: result.access_token,
              id: userId,
              full_name: fallbackName,
              location: (typeof meta.location === "string" && meta.location) || "",
              target_role: (typeof meta.target_role === "string" && meta.target_role) || "",
              skills: Array.isArray(meta.skills) ? (meta.skills as string[]) : [],
            });
          }
        }
      }

      const next =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("next") || "/dashboard"
          : "/dashboard";
      router.replace(next);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell
      title="Log in to continue your job search"
      subtitle="Access your dashboard, saved matches, learning roadmap, and application history."
      variant="auth"
    >
      <section className="mx-auto max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input
              className="w-full rounded-lg border border-zinc-300 px-3 py-2"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Password</label>
            <input
              className="w-full rounded-lg border border-zinc-300 px-3 py-2"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>
          <button
            className="w-full rounded-lg bg-zinc-900 px-4 py-3 text-sm font-medium text-white disabled:opacity-60"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Logging in..." : "Log in"}
          </button>
        </form>
        {message ? <p className="mt-4 text-sm text-zinc-500">{message}</p> : null}
        <p className="mt-4 text-sm text-zinc-500">
          New here?{" "}
          <Link href="/auth/register" className="font-medium text-indigo-600">
            Create an account
          </Link>
        </p>
      </section>
    </AppShell>
  );
}
