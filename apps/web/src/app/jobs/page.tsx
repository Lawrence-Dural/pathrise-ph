"use client";

import { useEffect, useMemo, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { AuthGate } from "@/components/auth-gate";
import { fetchProfile, fetchPublicJobs } from "@/lib/supabase";
import { getSession } from "@/lib/session";

type JobRow = {
  id: string;
  title: string;
  company: string;
  location: string;
  work_type: string;
  salary_range: string;
  fit_score: number;
  summary: string;
  required_skills: string[];
};

export default function JobsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [profileSkills, setProfileSkills] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        setError(null);
        setIsLoading(true);

        const session = getSession();
        const accessToken = session?.access_token;
        const userId = (session?.user as { id?: string } | undefined)?.id;
        if (!accessToken || !userId) {
          setJobs([]);
          setProfileSkills([]);
          return;
        }

        const [profileResult, jobsResult] = await Promise.all([
          fetchProfile(accessToken, userId),
          fetchPublicJobs(),
        ]);

        if (profileResult.error) setError(profileResult.error);
        if (jobsResult.error) setError(jobsResult.error);

        const profile = profileResult.data?.[0];
        setProfileSkills(profile?.skills ?? []);
        setJobs(jobsResult.data ?? []);
      } finally {
        setIsLoading(false);
      }
    };

    void run();
  }, []);

  const filteredJobs = useMemo(() => {
    const query = search.toLowerCase();
    const base = jobs.filter(
      (job) =>
        job.title.toLowerCase().includes(query) ||
        job.company.toLowerCase().includes(query) ||
        job.location.toLowerCase().includes(query),
    );

    // User-dependent: no skills → no recommendations yet.
    if (profileSkills.length === 0) return [];

    // Simple match: how many required skills the user already has.
    const skillSet = new Set(profileSkills.map((skill) => skill.toLowerCase()));
    return base
      .map((job) => {
        const required = (job.required_skills ?? []).map((skill) => skill.toLowerCase());
        const matched = required.filter((skill) => skillSet.has(skill)).length;
        const fit = required.length === 0 ? 0 : Math.round((matched / required.length) * 100);
        return { ...job, fit_score: Number.isFinite(fit) ? fit : 0 };
      })
      .sort((a, b) => (b.fit_score ?? 0) - (a.fit_score ?? 0));
  }, [search]);

  const selectedJob =
    (selectedJobId ? filteredJobs.find((job) => job.id === selectedJobId) : null) ??
    filteredJobs[0] ??
    null;

  return (
    <AuthGate>
      <AppShell
        title="Jobs you can actually target"
        subtitle="Your job list should depend on your profile. If you have no skills set yet, you'll see an empty state until you complete your profile."
      >
        <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                Job matches
              </p>
              <p className="text-sm text-zinc-500">Search by role, company, or location.</p>
            </div>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search jobs"
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-3">
            {error ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                Couldn’t load your data yet. Check your Supabase policies/keys.
              </div>
            ) : null}

            {isLoading ? (
              <div className="rounded-xl border border-zinc-200 p-4 text-sm text-zinc-500">
                Loading...
              </div>
            ) : profileSkills.length === 0 ? (
              <div className="rounded-xl border border-dashed border-zinc-300 p-6 text-sm text-zinc-600">
                No job recommendations yet because your profile has no skills saved.
                <div className="mt-2 text-xs text-zinc-500">
                  Tip: register again with skills filled in, or we can add a Profile page next.
                </div>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="rounded-xl border border-dashed border-zinc-300 p-6 text-sm text-zinc-600">
                No matches yet.
                <div className="mt-2 text-xs text-zinc-500">
                  This can happen if your `jobs` table has no rows yet.
                </div>
              </div>
            ) : (
              filteredJobs.map((job) => (
                <button
                  key={job.id}
                  onClick={() => setSelectedJobId(job.id)}
                  className={`w-full rounded-xl border p-4 text-left ${
                    selectedJob?.id === job.id
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-zinc-200 hover:border-zinc-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{job.title}</p>
                      <p className="text-sm text-zinc-500">
                        {job.company} · {job.location}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-indigo-600">
                      {job.fit_score ?? 0}% fit
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-zinc-600">{job.summary}</p>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Match details</p>
          {selectedJob ? (
            <>
              <h2 className="mt-3 text-2xl font-semibold">{selectedJob.title}</h2>
              <p className="text-sm text-zinc-500">
                {selectedJob.company} · {selectedJob.location} · {selectedJob.work_type}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-indigo-100 px-2 py-1 text-xs font-semibold text-indigo-700">
                  {selectedJob.fit_score ?? 0}% match
                </span>
                {selectedJob.salary_range ? (
                  <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs font-semibold text-zinc-700">
                    {selectedJob.salary_range}
                  </span>
                ) : null}
              </div>
              <p className="mt-4 text-sm text-zinc-600">{selectedJob.summary}</p>
              <div className="mt-4">
                <p className="text-sm font-medium">Required skills</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(selectedJob.required_skills ?? []).map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-zinc-200 px-2 py-1 text-xs text-zinc-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <button
                className="mt-6 w-full rounded-lg bg-zinc-900 px-4 py-3 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60"
                disabled
              >
                Apply (next step)
              </button>
              <p className="mt-2 text-xs text-zinc-500">
                Next step: wire applications creation from this job.
              </p>
            </>
          ) : (
            <div className="mt-3 rounded-xl border border-dashed border-zinc-300 p-6 text-sm text-zinc-600">
              No job selected yet.
            </div>
          )}
        </div>
        </section>
      </AppShell>
    </AuthGate>
  );
}
