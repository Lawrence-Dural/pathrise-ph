"use client";

import { useState } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { isSupabaseConfigured, signUpWithProfile, upsertProfile } from "@/lib/supabase";
import { isLoggedIn, saveSession } from "@/lib/session";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [skills, setSkills] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isLoggedIn()) {
      router.replace("/dashboard");
    }
  }, [router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isSupabaseConfigured) {
      setMessage("Add your Supabase keys in .env.local before registering.");
      return;
    }

    try {
      setIsSubmitting(true);
      setMessage("");

      const parsedSkills = skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);

      const result = await signUpWithProfile({
        email,
        password,
        fullName,
        location,
        targetRole,
        skills: parsedSkills,
      });

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

        const userId = result.user?.id as string | undefined;
        if (userId) {
          await upsertProfile({
            accessToken: result.access_token,
            id: userId,
            full_name: fullName,
            location,
            target_role: targetRole,
            skills: parsedSkills,
          });
        }

        router.replace("/dashboard");
        return;
      }

      setMessage(
        "Account created. If email confirmation is enabled, check your inbox, then log in.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell
      title="Create your PathRise account"
      subtitle="Start with a profile that captures your skills, goals, and preferred type of work so recommendations can become more accurate."
      variant="auth"
    >
      <section className="mx-auto max-w-2xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1 block text-sm font-medium">Full name</label>
            <input
              className="w-full rounded-lg border border-zinc-300 px-3 py-2"
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              required
            />
          </div>
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
            <label className="mb-1 block text-sm font-medium">Location</label>
            <input
              className="w-full rounded-lg border border-zinc-300 px-3 py-2"
              type="text"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Target role</label>
            <input
              className="w-full rounded-lg border border-zinc-300 px-3 py-2"
              type="text"
              value={targetRole}
              onChange={(event) => setTargetRole(event.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium">Current skills</label>
            <textarea
              className="min-h-28 w-full rounded-lg border border-zinc-300 px-3 py-2"
              placeholder="Example: communication, Google Docs, customer service"
              value={skills}
              onChange={(event) => setSkills(event.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium">Password</label>
            <input
              className="w-full rounded-lg border border-zinc-300 px-3 py-2"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>
          <div className="md:col-span-2">
            <button
              className="w-full rounded-lg bg-[var(--brand-royal)] px-4 py-3 text-sm font-medium text-white disabled:opacity-60"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating account..." : "Create account"}
            </button>
          </div>
        </form>
        {message ? <p className="mt-4 text-sm text-zinc-500">{message}</p> : null}
      </section>
    </AppShell>
  );
}
