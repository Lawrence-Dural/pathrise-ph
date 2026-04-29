"use client";

import { useEffect, type ReactNode, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { clearSession, getSession } from "@/lib/session";
import { fetchAuthUser, isSupabaseConfigured } from "@/lib/supabase";

export function AuthGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const run = async () => {
      const session = getSession();
      const token = session?.access_token;

      if (!token) {
        router.replace(`/auth/login?next=${encodeURIComponent(pathname)}`);
        return;
      }

      if (isSupabaseConfigured) {
        const result = await fetchAuthUser(token);
        if (!result.user) {
          clearSession();
          router.replace(`/auth/login?next=${encodeURIComponent(pathname)}`);
          return;
        }
      }

      setReady(true);
    };

    void run();
  }, [router, pathname]);

  if (!ready) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 shadow-sm">
        Loading your account...
      </div>
    );
  }

  return <>{children}</>;
}

