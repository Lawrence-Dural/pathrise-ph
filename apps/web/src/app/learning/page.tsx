"use client";

import { useEffect, useMemo, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { AuthGate } from "@/components/auth-gate";
import { createLearningPath, fetchLearningPaths, updateLearningProgress } from "@/lib/supabase";
import { getSession } from "@/lib/session";

export default function LearningPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [learningPath, setLearningPath] = useState<
    Array<{
      id: string;
      title: string;
      level: string;
      duration: string;
      progress: number;
      outcome: string;
    }>
  >([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const selectedCourse =
    (selectedCourseId ? learningPath.find((course) => course.id === selectedCourseId) : null) ??
    learningPath[0] ??
    null;

  const averageProgress = useMemo(() => {
    if (learningPath.length === 0) return 0;
    return Math.round(
      learningPath.reduce((total, course) => total + (course.progress || 0), 0) /
        learningPath.length,
    );
  }, [learningPath]);

  const refresh = async () => {
    const session = getSession();
    const accessToken = session?.access_token;
    const userId = (session?.user as { id?: string } | undefined)?.id;

    if (!accessToken || !userId) {
      setLearningPath([]);
      return;
    }

    const result = await fetchLearningPaths(accessToken, userId);
    if (result.error) {
      setError(result.error);
      setLearningPath([]);
      return;
    }

    setLearningPath(result.data ?? []);
    setSelectedCourseId((current) => current ?? result.data?.[0]?.id ?? null);
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

  const handleCreatePath = async () => {
    const session = getSession();
    const accessToken = session?.access_token;
    const userId = (session?.user as { id?: string } | undefined)?.id;
    if (!accessToken || !userId) return;

    try {
      setIsCreating(true);
      setError(null);

      const result = await createLearningPath({
        accessToken,
        profileId: userId,
        items: [
          {
            title: "Workplace Communication",
            level: "Beginner",
            duration: "2 weeks",
            outcome: "Improve interviews and customer-facing confidence.",
          },
          {
            title: "Google Workspace Essentials",
            level: "Starter",
            duration: "1 week",
            outcome: "Use docs, sheets, and collaboration tools for entry-level roles.",
          },
          {
            title: "Digital Task Management",
            level: "Starter",
            duration: "1 week",
            outcome: "Organize tasks and meet deadlines consistently.",
          },
        ],
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      await refresh();
    } finally {
      setIsCreating(false);
    }
  };

  const handleProgress = async (amount: number) => {
    const session = getSession();
    const accessToken = session?.access_token;
    if (!accessToken || !selectedCourse) return;

    const nextProgress = Math.min(100, (selectedCourse.progress || 0) + amount);
    setLearningPath((current) =>
      current.map((course) =>
        course.id === selectedCourse.id ? { ...course, progress: nextProgress } : course,
      ),
    );

    await updateLearningProgress(accessToken, selectedCourse.id, nextProgress);
  };

  return (
    <AuthGate>
      <AppShell
        title="A learning path tied to real outcomes"
        subtitle="Each course exists to improve a job match, not just to collect lessons. Advance your roadmap and see what unlocks next."
      >
        <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                  Personalized roadmap
                </p>
                <p className="text-sm text-zinc-500">
                  New users start empty. Create your first learning path when ready.
                </p>
              </div>
              <div className="rounded-xl bg-indigo-50 px-4 py-3 text-right">
                <p className="text-xs text-indigo-600">Overall progress</p>
                <p className="text-2xl font-semibold text-indigo-700">{averageProgress}%</p>
              </div>
            </div>

            {error ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                Couldn’t load learning path. {error}
              </div>
            ) : null}

            {isLoading ? (
              <div className="rounded-xl border border-zinc-200 p-4 text-sm text-zinc-500">
                Loading...
              </div>
            ) : learningPath.length === 0 ? (
              <div className="rounded-xl border border-dashed border-zinc-300 p-6">
                <p className="text-sm font-medium">No learning path yet</p>
                <p className="mt-1 text-sm text-zinc-600">
                  Create your first learning path and we’ll track progress per course.
                </p>
                <button
                  onClick={handleCreatePath}
                  disabled={isCreating}
                  className="mt-4 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                >
                  {isCreating ? "Creating..." : "Create my learning path"}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {learningPath.map((course) => (
                  <button
                    key={course.id}
                    onClick={() => setSelectedCourseId(course.id)}
                    className={`w-full rounded-xl border p-4 text-left ${
                      selectedCourse?.id === course.id
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-zinc-200 hover:border-zinc-300"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold">{course.title}</p>
                        <p className="text-sm text-zinc-500">
                          {course.level} · {course.duration}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-indigo-600">{course.progress}%</p>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-zinc-200">
                      <div
                        className="h-2 rounded-full bg-indigo-500"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                Course details
              </p>
              {selectedCourse ? (
                <>
                  <h2 className="mt-3 text-2xl font-semibold">{selectedCourse.title}</h2>
                  <p className="mt-1 text-sm text-zinc-500">
                    {selectedCourse.level} · {selectedCourse.duration}
                  </p>
                  <p className="mt-4 text-sm text-zinc-600">{selectedCourse.outcome}</p>
                  <div className="mt-5 flex gap-3">
                    <button
                      onClick={() => handleProgress(15)}
                      className="flex-1 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-medium text-white hover:bg-indigo-500"
                    >
                      Continue
                    </button>
                    <button
                      onClick={() => handleProgress(100)}
                      className="rounded-lg border border-zinc-300 px-4 py-3 text-sm font-medium hover:bg-zinc-50"
                    >
                      Mark done
                    </button>
                  </div>
                </>
              ) : (
                <p className="mt-3 text-sm text-zinc-600">
                  Create a learning path to view course details.
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                Milestones
              </p>
              <div className="mt-4 space-y-3 text-sm text-zinc-600">
                <p>
                  Milestones will activate as you create and complete your courses.
                </p>
              </div>
            </div>
          </div>
        </section>
      </AppShell>
    </AuthGate>
  );
}
