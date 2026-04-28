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

async function getLearningPath() {
  if (!isSupabaseConfigured) {
    return learningPath;
  }

  const profileId = process.env.DEMO_PROFILE_ID;
  if (!profileId) {
    return learningPath;
  }

  const data = await fetchSupabaseTable<SupabaseLearningPathRow>(
    "learning_paths",
    `?select=*&profile_id=eq.${profileId}&order=created_at.asc`,
  );
  if (!data || data.length === 0) {
    return learningPath;
  }

  return data;
}

async function getApplications() {
  if (!isSupabaseConfigured) {
    return applications;
  }

  const profileId = process.env.DEMO_PROFILE_ID;
  if (!profileId) {
    return applications;
  }

  const data = await fetchSupabaseTable<SupabaseApplicationRow>(
    "applications",
    `?select=*&profile_id=eq.${profileId}&order=created_at.desc`,
  );
  if (!data || data.length === 0) {
    return applications;
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

app.get("/dashboard", async (_req: Request, res: Response) => {
  const currentJobs = await getJobs();
  const currentLearningPath = await getLearningPath();
  const currentApplications = await getApplications();
  const averageProgress = Math.round(
    currentLearningPath.reduce((total, course) => total + course.progress, 0) /
      currentLearningPath.length,
  );

  res.json({
    matchScore: 84,
    recommendedJobs: currentJobs.length,
    learningProgress: averageProgress,
    activeApplications: currentApplications.length,
    nextAction: "Complete Google Workspace Essentials and apply to one high-fit role.",
    source: isSupabaseConfigured ? "supabase-or-fallback" : "demo",
  });
});

app.get("/jobs", async (_req: Request, res: Response) => {
  res.json(await getJobs());
});

app.get("/learning-path", async (_req: Request, res: Response) => {
  res.json(await getLearningPath());
});

app.get("/applications", async (_req: Request, res: Response) => {
  res.json(await getApplications());
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`PathRise API listening on port ${PORT}`);
});
