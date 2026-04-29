"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { clearSession, getSession } from "@/lib/session";
import { fetchProfile, isSupabaseConfigured } from "@/lib/supabase";

type AppShellProps = {
  children: ReactNode;
  title: string;
  subtitle: string;
  variant?: "app" | "auth";
};

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/jobs", label: "Jobs" },
  { href: "/learning", label: "Learning" },
  { href: "/applications", label: "Applications" },
];

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
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="mx-auto max-w-6xl px-6 py-8 md:py-10">
        <header className="mb-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <Link href="/dashboard" className="text-2xl font-semibold text-[var(--text-strong)]">
                PathRise PH
              </Link>
              <p className="text-sm text-[var(--muted)]">
                Career guidance for Filipino youth and fresh graduates
              </p>
            </div>
            {!isAuthVariant && loggedIn ? (
              <div className="flex flex-col items-start gap-2 md:items-end">
                <p className="text-sm text-[var(--muted)]">
                  Hello,{" "}
                  <span className="font-semibold text-[var(--text-strong)]">{userName ?? "..."}</span>
                </p>
                <button
                  className="rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:opacity-90"
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
                      ? "bg-[var(--brand-royal)] text-white"
                      : "border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--muted)] hover:border-[var(--brand-royal)] hover:text-[var(--brand-light)]"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          ) : null}
        </header>

        <section
          className="mb-6 rounded-2xl p-6 text-white shadow-md"
          style={{
            background: "linear-gradient(96deg, var(--brand-navy) 0%, var(--brand-royal) 100%)",
          }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-100/90">
            PathRise MVP
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-white">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-blue-100 md:text-base">{subtitle}</p>
        </section>

        {children}
      </div>
    </main>
  );
}
