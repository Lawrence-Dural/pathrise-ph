import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { applications, courses, jobs } from "@/lib/mvp-data";

export default function Home() {
  const averageProgress = Math.round(
    courses.reduce((total, course) => total + course.progress, 0) / courses.length,
  );

  return (
    <AppShell
      title="A clearer path from skills to jobs"
      subtitle="PathRise turns job matching into daily actions: learn the next skill, apply to realistic roles, and track progress until placement."
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Job Match Score" value="84%" />
        <SummaryCard label="Jobs Recommended" value={String(jobs.length)} />
        <SummaryCard label="Learning Progress" value={`${averageProgress}%`} />
        <SummaryCard label="Active Applications" value={String(applications.length)} />
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                Top matches today
              </p>
              <p className="text-sm text-zinc-500">Start with the roles you can realistically get now.</p>
            </div>
            <Link href="/jobs" className="text-sm font-medium text-indigo-600">
              View all jobs
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {jobs.map((job) => (
              <div key={job.id} className="rounded-xl border border-zinc-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{job.title}</p>
                    <p className="text-sm text-zinc-500">
                      {job.company} · {job.location}
                    </p>
                  </div>
                  <span className="rounded-full bg-indigo-100 px-2 py-1 text-xs font-semibold text-indigo-700">
                    {job.fit}% fit
                  </span>
                </div>
                <p className="mt-2 text-sm text-zinc-600">{job.summary}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <ActionCard
            title="Complete one course"
            body="Finish Google Workspace Essentials to unlock stronger admin role matches."
            href="/learning"
            cta="Open learning path"
          />
          <ActionCard
            title="Track your applications"
            body="Keep follow-ups, interview stages, and next steps in one place."
            href="/applications"
            cta="Open tracker"
          />
        </div>
      </section>
    </AppShell>
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
