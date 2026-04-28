export default function Home() {
  const featuredJobs = [
    {
      title: "Customer Support Associate",
      company: "BrightLink BPO",
      location: "Quezon City",
      type: "Full-time",
      fit: 86,
    },
    {
      title: "Junior Admin Assistant",
      company: "Nexa Retail",
      location: "Makati",
      type: "On-site",
      fit: 78,
    },
    {
      title: "Social Media Assistant",
      company: "LocalSpark Studio",
      location: "Remote",
      type: "Part-time",
      fit: 91,
    },
  ];

  const learningPath = [
    { title: "Workplace Communication", progress: 80 },
    { title: "Customer Service Foundations", progress: 55 },
    { title: "Google Workspace Essentials", progress: 35 },
  ];

  const applications = [
    { role: "Customer Support Associate", status: "Interview" },
    { role: "Store Operations Assistant", status: "Screening" },
    { role: "Data Entry Associate", status: "Applied" },
  ];

  const statusColor: Record<string, string> = {
    Interview: "bg-emerald-100 text-emerald-700",
    Screening: "bg-amber-100 text-amber-700",
    Applied: "bg-blue-100 text-blue-700",
  };

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-900">
      <div className="mx-auto max-w-6xl px-6 py-8 md:py-10">
        <header className="mb-8 flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-5 py-4">
          <div>
            <h1 className="text-lg font-semibold md:text-xl">PathRise PH</h1>
            <p className="text-xs text-zinc-500">AI career platform for Filipino youth</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100">
              Log in
            </button>
            <button className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700">
              Create account
            </button>
          </div>
        </header>

        <section className="mb-6 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white md:p-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-indigo-100">
            Career dashboard
          </p>
          <h2 className="mb-2 text-2xl font-semibold md:text-3xl">
            Find jobs that match your current skills.
          </h2>
          <p className="max-w-2xl text-sm text-indigo-100 md:text-base">
            PathRise helps you discover opportunities, close skill gaps, and track
            applications in one place.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50">
              Explore jobs
            </button>
            <button className="rounded-lg border border-indigo-200 px-4 py-2 text-sm font-semibold hover:bg-indigo-500">
              Continue learning path
            </button>
          </div>
        </section>

        <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <p className="text-xs text-zinc-500">Job Match Score</p>
            <p className="mt-2 text-2xl font-semibold">84%</p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <p className="text-xs text-zinc-500">Jobs Recommended</p>
            <p className="mt-2 text-2xl font-semibold">27</p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <p className="text-xs text-zinc-500">Skills Completed</p>
            <p className="mt-2 text-2xl font-semibold">12</p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <p className="text-xs text-zinc-500">Active Applications</p>
            <p className="mt-2 text-2xl font-semibold">3</p>
          </div>
        </section>

        <section className="mb-6 grid gap-4 lg:grid-cols-3">
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Featured Jobs
            </h3>
            <div className="space-y-3">
              {featuredJobs.map((job) => (
                <div key={job.title} className="rounded-xl border border-zinc-200 bg-white p-4">
                  <p className="font-semibold">{job.title}</p>
                  <p className="text-sm text-zinc-600">
                    {job.company} · {job.location}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="rounded-full bg-zinc-100 px-2 py-1 text-zinc-700">
                      {job.type}
                    </span>
                    <span className="font-semibold text-indigo-600">{job.fit}% fit</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Your Learning Path
            </h3>
            <div className="rounded-xl border border-zinc-200 bg-white p-4">
              <div className="space-y-4">
                {learningPath.map((course) => (
                  <div key={course.title}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <p className="font-medium">{course.title}</p>
                      <p className="text-zinc-500">{course.progress}%</p>
                    </div>
                    <div className="h-2 rounded-full bg-zinc-200">
                      <div
                        className="h-2 rounded-full bg-indigo-500"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Application Tracker
            </h3>
            <div className="rounded-xl border border-zinc-200 bg-white p-4">
              <div className="space-y-3">
                {applications.map((application) => (
                  <div key={application.role} className="flex items-center justify-between">
                    <p className="text-sm font-medium">{application.role}</p>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        statusColor[application.status]
                      }`}
                    >
                      {application.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
