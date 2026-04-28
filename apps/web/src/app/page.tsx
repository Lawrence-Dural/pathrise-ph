"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { isLoggedIn } from "@/lib/session";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace(isLoggedIn() ? "/dashboard" : "/auth/login");
  }, [router]);

  return null;
}
