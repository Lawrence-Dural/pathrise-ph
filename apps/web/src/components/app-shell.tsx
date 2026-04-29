"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

import { navItems } from "@/lib/mvp-data";
import { clearSession, getSession } from "@/lib/session";
import { fetchProfile, isSupabaseConfigured } from "@/lib/supabase";

type AppShellProps = {
  children: ReactNode;
  title: string;
  subtitle: string;
  variant?: "app" | "auth";
};

function getFallbackName() {
  const session = getSession();
  const email =
    (session?.user as { email?: string } | undefined)?.email ??
    (session?.user as { user_metadata?: { email?: string } } | undefined)?.user_metadata?.email;
  return email ? email.split("@")[0] : "there";
}

export function AppShell({ children, title, subtitle, variant = "app" }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [userName, setUserName] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const isAuthVariant = variant === "auth";

  useEffect(() => {
    if (isAuthVariant) return;
    const session = getSession();
    const token = session?.access_token;
    setLoggedIn(Boolean(token));
    if (!token) return;

    const run = async () => {
      const session = getSession();
      const token = session?.access_token;
      const userId = (session?.user as { id?: string } | undefined)?.id;

      const metaName =
        (session?.user as { user_metadata?: { full_name?: string } } | undefined)?.user_metadata
          ?.full_name ?? null;
      if (metaName) setUserName(metaName);

      if (!token || !userId || !isSupabaseConfigured) {
        setUserName((current) => current ?? getFallbackName());
        return;
      }

      const profileResult = await fetchProfile(token, userId);
      const profile = profileResult.data?.[0];
      const name = profile?.full_name?.trim();
      setUserName(name && name.length > 0 ? name : getFallbackName());
    };

    void run();
  }, [isAuthVariant]);

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-900">
      <div className="mx-auto max-w-6xl px-6 py-8 md:py-10">
        <header className="mb-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <Link href="/dashboard" className="text-xl font-semibold">
                PathRise PH
              </Link>
              <p className="text-sm text-zinc-500">
                Career guidance for Filipino youth and fresh graduates
              </p>
            </div>
            {!isAuthVariant && loggedIn ? (
              <div className="flex flex-col items-start gap-2 md:items-end">
                <p className="text-sm text-zinc-600">
                  Hello, <span className="font-semibold text-zinc-900">{userName ?? "..."}</span>
                </p>
                <button
                  className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100"
                  onClick={() => {
                    clearSession();
                    router.replace("/auth/login");
                  }}
                >
                  Logout
                </button>
              </div>
            ) : null}
          </div>
          {!isAuthVariant ? (
            <nav className="mt-4 flex flex-wrap gap-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-full px-4 py-2 text-sm font-medium ${
                      isActive
                        ? "bg-zinc-900 text-white"
                        : "border border-zinc-300 bg-white text-zinc-700"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          ) : null}
        </header>

        <section className="mb-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-100">
            PathRise MVP
          </p>
          <h1 className="mt-2 text-3xl font-semibold">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-indigo-100 md:text-base">{subtitle}</p>
        </section>

        {children}
      </div>
    </main>
  );
}
