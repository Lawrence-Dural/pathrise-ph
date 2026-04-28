"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { AuthGate } from "@/components/auth-gate";
import { fetchApplications, fetchLearningPaths, fetchPublicJobs } from "@/lib/supabase";
import { getSession } from "@/lib/session";

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [jobs, setJobs] = useState<
    Array<{
      id: string;
      title: string;
      company: string;
      location: string;
      work_type: string;
      salary_range: string;
      fit_score: number;
      summary: string;
      required_skills: string[];
    }>
  >([]);
  const [learningPath, setLearningPath] = useState<Array<{ progress: number }>>([]);
  const [applications, setApplications] = useState<Array<unknown>>([]);
  const [error, setError] = useState<string | null>(null);

  const learningProgress = useMemo(() => {
    if (learningPath.length === 0) return 0;
    return Math.round(
      learningPath.reduce((total, course) => total + (course.progress || 0), 0) /
        learningPath.length,
    );
  }, [learningPath]);

  useEffect(() => {
    const run = async () => {
      try {
        setError(null);
        setIsLoading(true);

        const session = getSession();
        const accessToken = session?.access_token;
        const userId = (session?.user as { id?: string } | undefined)?.id;

        const jobsResult = await fetchPublicJobs();
        if (jobsResult.error) {
          setError(jobsResult.error);
        } else if (jobsResult.data) {
          setJobs(jobsResult.data);
        }

        if (accessToken && userId) {
          const [lpResult, appResult] = await Promise.all([
            fetchLearningPaths(accessToken, userId),
            fetchApplications(accessToken, userId),
          ]);

          if (!lpResult.error && lpResult.data) setLearningPath(lpResult.data);
          if (!appResult.error && appResult.data) setApplications(appResult.data);
        } else {
          setLearningPath([]);
          setApplications([]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    void run();
  }, []);

  return (
    <AuthGate>
      <AppShell
        title="Your dashboard"
        subtitle="See your best job matches, keep learning progress moving, and track applications end-to-end."
      >
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard label="Job Match Score" value={learningPath.length ? "84%" : "0%"} />
          <SummaryCard label="Jobs Recommended" value={String(jobs.length)} />
          <SummaryCard label="Learning Progress" value={`${learningProgress}%`} />
          <SummaryCard label="Active Applications" value={String(applications.length)} />
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                  Top matches today
                </p>
                <p className="text-sm text-zinc-500">
                  Start with roles you can realistically get now.
                </p>
              </div>
              <Link href="/jobs" className="text-sm font-medium text-indigo-600">
                View jobs
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {error ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                  Couldn’t load live data yet. Showing limited demo state.
                </div>
              ) : null}

              {isLoading ? (
                <div className="rounded-xl border border-zinc-200 p-4 text-sm text-zinc-500">
                  Loading matches...
                </div>
              ) : jobs.length === 0 ? (
                <div className="rounded-xl border border-dashed border-zinc-300 p-6 text-sm text-zinc-500">
                  No jobs found yet. Seed your `jobs` table in Supabase to populate matches.
                </div>
              ) : (
                jobs.slice(0, 3).map((job) => (
                  <div key={job.id} className="rounded-xl border border-zinc-200 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{job.title}</p>
                        <p className="text-sm text-zinc-500">
                          {job.company} · {job.location}
                        </p>
                      </div>
                      <span className="rounded-full bg-indigo-100 px-2 py-1 text-xs font-semibold text-indigo-700">
                        {job.fit_score ?? 0}% fit
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-zinc-600">{job.summary}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-4">
            <ActionCard
              title="Continue learning"
              body="Finish one module today to improve your match score."
              href="/learning"
              cta="Open learning path"
            />
            <ActionCard
              title="Track applications"
              body="Follow up and keep your pipeline moving."
              href="/applications"
              cta="Open tracker"
            />
          </div>
        </section>
      </AppShell>
    </AuthGate>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}

function ActionCard({
  title,
  body,
  href,
  cta,
}: {
  title: string;
  body: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <p className="text-lg font-semibold">{title}</p>
      <p className="mt-2 text-sm text-zinc-600">{body}</p>
      <Link
        href={href}
        className="mt-4 inline-flex rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
      >
        {cta}
      </Link>
    </div>
  );
}

