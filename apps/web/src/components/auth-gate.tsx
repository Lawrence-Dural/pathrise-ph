"use client";

import { useEffect, type ReactNode, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { isLoggedIn } from "@/lib/session";

export function AuthGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const loggedIn = isLoggedIn();
    if (!loggedIn) {
      router.replace(`/auth/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    setReady(true);
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

