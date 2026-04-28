"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { navItems } from "@/lib/mvp-data";

type AppShellProps = {
  children: ReactNode;
  title: string;
  subtitle: string;
};

export function AppShell({ children, title, subtitle }: AppShellProps) {
  const pathname = usePathname();

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
            <div className="flex gap-2">
              <Link
                href="/auth/login"
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100"
              >
                Log in
              </Link>
              <Link
                href="/auth/register"
                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
              >
                Create account
              </Link>
            </div>
          </div>
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
