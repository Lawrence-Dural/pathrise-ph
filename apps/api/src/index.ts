import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { fetchSupabaseTable, isSupabaseConfigured } from "./supabase";

dotenv.config();

const app = express();
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.NEXT_PUBLIC_APP_URL,
].filter(Boolean) as string[];

app.use(
  cors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : true,
  }),
);
app.use(express.json());

const jobs = [
  {
    id: 1,
    title: "Customer Support Associate",
    company: "BrightLink BPO",
    location: "Quezon City",
    type: "Full-time",
    fit: 86,
    salary: "PHP 18k - 22k",
    skills: ["Communication", "CRM", "Email support"],
    summary: "Entry-level support role for candidates with strong communication and service skills.",
  },
  {
    id: 2,
    title: "Junior Admin Assistant",
    company: "Nexa Retail",
    location: "Makati",
    type: "On-site",
    fit: 78,
    salary: "PHP 16k - 20k",
    skills: ["Scheduling", "Docs", "Coordination"],
    summary: "Support daily admin operations, documentation, and scheduling for a growing retail team.",
  },
  {
    id: 3,
    title: "Social Media Assistant",
    company: "LocalSpark Studio",
    location: "Remote",
    type: "Part-time",
    fit: 91,
    salary: "PHP 20k - 25k",
    skills: ["Canva", "Content writing", "Analytics"],
    summary: "Create and schedule content, assist reporting, and support small business campaigns.",
  },
];

const learningPath = [
  {
    id: 1,
    title: "Workplace Communication",
    progress: 80,
    duration: "2 weeks",
    level: "Beginner",
    outcome: "Improve interviews and customer-facing confidence.",
  },
  {
    id: 2,
    title: "Customer Service Foundations",
    progress: 55,
    duration: "3 weeks",
    level: "Beginner",
    outcome: "Handle support workflows and service scenarios.",
  },
  {
    id: 3,
    title: "Google Workspace Essentials",
    progress: 35,
    duration: "1 week",
    level: "Starter",
    outcome: "Use docs, sheets, and shared collaboration tools.",
  },
  {
    id: 4,
    title: "Digital Task Management",
    progress: 10,
    duration: "1 week",
    level: "Starter",
    outcome: "Organize tasks and meet deadlines consistently.",
  },
];

const applications = [
  {
    role: "Customer Support Associate",
    company: "BrightLink BPO",
    status: "Interview",
    nextStep: "Prepare for your Thursday interview.",
  },
  {
    role: "Store Operations Assistant",
    company: "Urban Basket",
    status: "Screening",
    nextStep: "Wait for HR callback within 2 days.",
  },
  {
    role: "Data Entry Associate",
    company: "CoreStack Services",
    status: "Applied",
    nextStep: "Follow up with recruiter after 3 days.",
  },
];

type SupabaseJobRow = {
  id: string;
  title: string;
  company: string;
  location: string;
  work_type: string;
  fit_score: number;
  salary_range: string;
  required_skills: string[];
  summary: string;
};

type SupabaseLearningPathRow = {
  id: string;
  title: string;
  progress: number;
  duration: string;
  level: string;
  outcome: string;
};

type SupabaseApplicationRow = {
  role: string;
  company: string;
  status: string;
  next_step: string;
};

async function getJobs() {
  if (!isSupabaseConfigured) {
    return jobs;
  }

  const data = await fetchSupabaseTable<SupabaseJobRow>(
    "jobs",
    "?select=*&order=created_at.desc",
  );
  if (!data) {
    return jobs;
  }

  return data.map((job) => ({
    id: job.id,
    title: job.title,
    company: job.company,
    location: job.location,
    type: job.work_type,
    fit: job.fit_score,
    salary: job.salary_range,
    skills: job.required_skills ?? [],
    summary: job.summary,
  }));
}

async function getLearningPath(profileId?: string) {
  if (!isSupabaseConfigured) {
    return learningPath;
  }

  if (!profileId) {
    return [];
  }

  const data = await fetchSupabaseTable<SupabaseLearningPathRow>(
    "learning_paths",
    `?select=*&profile_id=eq.${profileId}&order=created_at.asc`,
  );
  if (!data || data.length === 0) {
    return [];
  }

  return data;
}

async function getApplications(profileId?: string) {
  if (!isSupabaseConfigured) {
    return applications;
  }

  if (!profileId) {
    return [];
  }

  const data = await fetchSupabaseTable<SupabaseApplicationRow>(
    "applications",
    `?select=*&profile_id=eq.${profileId}&order=created_at.desc`,
  );
  if (!data || data.length === 0) {
    return [];
  }

  return data.map((application) => ({
    role: application.role,
    company: application.company,
    status: application.status,
    nextStep: application.next_step,
  }));
}

app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "PathRise API",
    environment: process.env.NODE_ENV || "development",
  });
});

app.get("/", (_req: Request, res: Response) => {
  res.json({
    message: "PathRise API is running",
    health: "/health",
    endpoints: ["/dashboard", "/jobs", "/learning-path", "/applications"],
  });
});

app.get("/dashboard", async (req: Request, res: Response) => {
  const profileId =
    (typeof req.query.profile_id === "string" ? req.query.profile_id : undefined) ??
    process.env.DEMO_PROFILE_ID;
  const currentJobs = await getJobs();
  const currentLearningPath = await getLearningPath(profileId);
  const currentApplications = await getApplications(profileId);
  const averageProgress =
    currentLearningPath.length === 0
      ? 0
      : Math.round(
          currentLearningPath.reduce((total, course) => total + course.progress, 0) /
            currentLearningPath.length,
        );
  const matchScore =
    currentLearningPath.length === 0 || currentJobs.length === 0
      ? 0
      : Math.round(
          currentJobs.slice(0, 5).reduce((total, job) => total + (job.fit || 0), 0) /
            Math.min(currentJobs.length, 5) *
            0.7 +
            averageProgress * 0.3,
        );

  res.json({
    matchScore,
    recommendedJobs: currentJobs.length,
    learningProgress: averageProgress,
    activeApplications: currentApplications.length,
    nextAction:
      currentLearningPath.length === 0
        ? "Create your first learning path to start improving your dashboard metrics."
        : "Complete your next learning module and apply to one matching role.",
    source: isSupabaseConfigured ? "supabase-user-data" : "demo",
  });
});

app.get("/jobs", async (_req: Request, res: Response) => {
  res.json(await getJobs());
});

app.get("/learning-path", async (req: Request, res: Response) => {
  const profileId =
    (typeof req.query.profile_id === "string" ? req.query.profile_id : undefined) ??
    process.env.DEMO_PROFILE_ID;
  res.json(await getLearningPath(profileId));
});

app.get("/applications", async (req: Request, res: Response) => {
  const profileId =
    (typeof req.query.profile_id === "string" ? req.query.profile_id : undefined) ??
    process.env.DEMO_PROFILE_ID;
  res.json(await getApplications(profileId));
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`PathRise API listening on port ${PORT}`);
});
