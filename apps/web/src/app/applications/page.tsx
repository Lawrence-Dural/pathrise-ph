"use client";

import { useEffect, useMemo, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { AuthGate } from "@/components/auth-gate";
import { createApplication, fetchApplications } from "@/lib/supabase";
import { getSession } from "@/lib/session";

const statusColor: Record<string, string> = {
  Interview: "bg-emerald-100 text-emerald-700",
  Screening: "bg-amber-100 text-amber-700",
  Applied: "bg-blue-100 text-[var(--brand-royal)]",
};

export default function ApplicationsPage() {
  const [filter, setFilter] = useState("All");
  const [items, setItems] = useState<
    Array<{
      id: string;
      role: string;
      company: string;
      status: string;
      next_step: string;
    }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState<"Applied" | "Screening" | "Interview">("Applied");
  const [nextStep, setNextStep] = useState("");

  const refresh = async () => {
    const session = getSession();
    const accessToken = session?.access_token;
    const userId = (session?.user as { id?: string } | undefined)?.id;
    if (!accessToken || !userId) {
      setItems([]);
      return;
    }

    const result = await fetchApplications(accessToken, userId);
    if (result.error) {
      setError(result.error);
      setItems([]);
      return;
    }

    setItems(result.data ?? []);
  };

  useEffect(() => {
    const run = async () => {
      try {
        setError(null);
        setIsLoading(true);
        await refresh();
      } finally {
        setIsLoading(false);
      }
    };
    void run();
  }, []);

  const filteredApplications = useMemo(() => {
    if (filter === "All") return items;
    return items.filter((application) => application.status === filter);
  }, [filter, items]);

  const handleAdd = async () => {
    const session = getSession();
    const accessToken = session?.access_token;
    const userId = (session?.user as { id?: string } | undefined)?.id;
    if (!accessToken || !userId) return;

    try {
      setIsAdding(true);
      setError(null);

      const result = await createApplication({
        accessToken,
        profileId: userId,
        role,
        company,
        status,
        next_step: nextStep,
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      setRole("");
      setCompany("");
      setNextStep("");
      setStatus("Applied");
      await refresh();
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <AuthGate>
      <AppShell
        title="Stay on top of every application"
        subtitle="Track what you applied to, where you are in the hiring process, and what action to take next."
      >
        <section className="rounded-2xl border border-blue-200/70 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[var(--text-slate)]">
              Application pipeline
            </p>
            <p className="text-sm text-[var(--text-slate)]">Filter by stage and follow the next step.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {["All", "Applied", "Screening", "Interview"].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`rounded-full px-3 py-1.5 text-sm ${
                  filter === status
                    ? "bg-[var(--brand-navy)] text-white"
                    : "border border-blue-200 bg-white text-[var(--text-slate)]"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4 rounded-xl border border-blue-200/70 bg-blue-50/60 p-4">
          <p className="text-sm font-medium text-[var(--brand-navy)]">Add application</p>
          <p className="mt-1 text-xs text-[var(--text-slate)]">
            Keep this updated for UAT so hiring stage transitions can be tested.
          </p>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <input
              className="rounded-lg border border-blue-200 px-3 py-2 text-sm"
              placeholder="Role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
            <input
              className="rounded-lg border border-blue-200 px-3 py-2 text-sm"
              placeholder="Company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
            <select
              className="rounded-lg border border-blue-200 px-3 py-2 text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
            >
              <option value="Applied">Applied</option>
              <option value="Screening">Screening</option>
              <option value="Interview">Interview</option>
            </select>
            <input
              className="rounded-lg border border-blue-200 px-3 py-2 text-sm"
              placeholder="Next step (optional)"
              value={nextStep}
              onChange={(e) => setNextStep(e.target.value)}
            />
          </div>
          <button
            onClick={handleAdd}
            disabled={isAdding || !role || !company}
            className="mt-3 rounded-lg bg-[var(--brand-royal)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {isAdding ? "Adding..." : "Add application"}
          </button>
        </div>

        <div className="space-y-3">
          {error ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              Couldn’t load applications. {error}
            </div>
          ) : null}

          {isLoading ? (
            <div className="rounded-xl border border-zinc-200 p-4 text-sm text-zinc-500">
              Loading...
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-300 p-6">
              <p className="text-sm font-medium">No applications yet</p>
              <p className="mt-1 text-sm text-zinc-600">
                Add your first application and it will appear only for your account.
              </p>
            </div>
          ) : (
            filteredApplications.map((application) => (
            <div
              key={`${application.role}-${application.company}`}
              className="rounded-xl border border-zinc-200 p-4"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="font-semibold">{application.role}</p>
                  <p className="text-sm text-zinc-500">{application.company}</p>
                  <p className="mt-2 text-sm text-zinc-600">{application.next_step}</p>
                </div>
                <span
                  className={`w-fit rounded-full px-2 py-1 text-xs font-semibold ${
                    statusColor[application.status]
                  }`}
                >
                  {application.status}
                </span>
              </div>
            </div>
            ))
          )}
        </div>
      </section>
      </AppShell>
    </AuthGate>
  );
}
