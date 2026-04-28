export type Job = {
  id: number;
  title: string;
  company: string;
  location: string;
  type: string;
  fit: number;
  salary: string;
  skills: string[];
  summary: string;
};

export type Course = {
  id: number;
  title: string;
  progress: number;
  duration: string;
  level: string;
  outcome: string;
};

export type Application = {
  role: string;
  company: string;
  status: "Applied" | "Screening" | "Interview";
  nextStep: string;
};

export const jobs: Job[] = [
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

export const courses: Course[] = [
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

export const applications: Application[] = [
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

export const roadmapMilestones = [
  {
    title: "Foundation",
    description: "Finish communication and workplace basics.",
  },
  {
    title: "Job readiness",
    description: "Complete task, tools, and service training.",
  },
  {
    title: "Interview prep",
    description: "Practice mock interviews and finalize resume.",
  },
  {
    title: "Placement",
    description: "Apply to matched entry-level roles.",
  },
];

export const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/jobs", label: "Jobs" },
  { href: "/learning", label: "Learning" },
  { href: "/applications", label: "Applications" },
];
