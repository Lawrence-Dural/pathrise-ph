const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

function getConfig() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase environment variables are missing.");
  }

  return { supabaseUrl, supabaseAnonKey };
}

export async function signInWithPassword(email: string, password: string) {
  const { supabaseUrl, supabaseAnonKey } = getConfig();

  const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: supabaseAnonKey,
    },
    body: JSON.stringify({ email, password }),
  });

  return response.json();
}

type SignUpInput = {
  email: string;
  password: string;
  fullName: string;
  location: string;
  targetRole: string;
  skills: string[];
};

export async function signUpWithProfile(input: SignUpInput) {
  const { supabaseUrl, supabaseAnonKey } = getConfig();

  const response = await fetch(`${supabaseUrl}/auth/v1/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: supabaseAnonKey,
    },
    body: JSON.stringify({
      email: input.email,
      password: input.password,
      data: {
        full_name: input.fullName,
        location: input.location,
        target_role: input.targetRole,
        skills: input.skills,
      },
    }),
  });

  return response.json();
}

type UpsertProfileInput = {
  accessToken: string;
  id: string;
  full_name: string;
  location: string;
  target_role: string;
  skills: string[];
};

async function supabaseRest<T>(
  path: string,
  options: {
    method?: string;
    accessToken?: string;
    body?: unknown;
    headers?: Record<string, string>;
  } = {},
): Promise<{ data: T | null; error: string | null }> {
  const { supabaseUrl, supabaseAnonKey } = getConfig();
  const response = await fetch(`${supabaseUrl}${path}`, {
    method: options.method ?? "GET",
    headers: {
      apikey: supabaseAnonKey,
      "Content-Type": "application/json",
      ...(options.accessToken ? { Authorization: `Bearer ${options.accessToken}` } : {}),
      ...(options.headers ?? {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const text = await response.text();
    return { data: null, error: text || response.statusText };
  }

  // Supabase PostgREST sometimes returns empty body for successful upserts with Prefer return=minimal
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return { data: null, error: null };
  }

  const json = (await response.json()) as T;
  return { data: json, error: null };
}

export async function upsertProfile(input: UpsertProfileInput) {
  // Requires RLS policy allowing user to insert/update own row (profiles.id == auth.uid()).
  return supabaseRest<unknown>("/rest/v1/profiles?on_conflict=id", {
    method: "POST",
    accessToken: input.accessToken,
    headers: {
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: {
      id: input.id,
      full_name: input.full_name,
      location: input.location,
      target_role: input.target_role,
      skills: input.skills,
    },
  });
}

export async function fetchPublicJobs() {
  return supabaseRest<
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
  >("/rest/v1/jobs?select=*&order=created_at.desc");
}

export async function fetchLearningPaths(accessToken: string, profileId: string) {
  return supabaseRest<
    Array<{
      id: string;
      title: string;
      level: string;
      duration: string;
      progress: number;
      outcome: string;
      created_at: string;
    }>
  >(
    `/rest/v1/learning_paths?select=*&profile_id=eq.${encodeURIComponent(
      profileId,
    )}&order=created_at.asc`,
    { accessToken },
  );
}

export async function fetchApplications(accessToken: string, profileId: string) {
  return supabaseRest<
    Array<{
      id: string;
      role: string;
      company: string;
      status: string;
      next_step: string;
      created_at: string;
    }>
  >(
    `/rest/v1/applications?select=*&profile_id=eq.${encodeURIComponent(
      profileId,
    )}&order=created_at.desc`,
    { accessToken },
  );
}

export async function fetchProfile(accessToken: string, profileId: string) {
  return supabaseRest<
    Array<{
      id: string;
      full_name: string;
      location: string | null;
      target_role: string | null;
      skills: string[] | null;
    }>
  >(`/rest/v1/profiles?select=*&id=eq.${encodeURIComponent(profileId)}`, { accessToken });
}

type CreateLearningPathInput = {
  accessToken: string;
  profileId: string;
  items: Array<{
    title: string;
    level: string;
    duration: string;
    outcome: string;
    progress?: number;
  }>;
};

export async function createLearningPath(input: CreateLearningPathInput) {
  return supabaseRest<unknown>("/rest/v1/learning_paths", {
    method: "POST",
    accessToken: input.accessToken,
    headers: { Prefer: "return=minimal" },
    body: input.items.map((item) => ({
      profile_id: input.profileId,
      title: item.title,
      level: item.level,
      duration: item.duration,
      outcome: item.outcome,
      progress: item.progress ?? 0,
    })),
  });
}

export async function updateLearningProgress(accessToken: string, id: string, progress: number) {
  return supabaseRest<unknown>(`/rest/v1/learning_paths?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    accessToken,
    headers: { Prefer: "return=minimal" },
    body: { progress },
  });
}

type CreateApplicationInput = {
  accessToken: string;
  profileId: string;
  role: string;
  company: string;
  status: "Applied" | "Screening" | "Interview";
  next_step: string;
};

export async function createApplication(input: CreateApplicationInput) {
  return supabaseRest<unknown>("/rest/v1/applications", {
    method: "POST",
    accessToken: input.accessToken,
    headers: { Prefer: "return=minimal" },
    body: {
      profile_id: input.profileId,
      role: input.role,
      company: input.company,
      status: input.status,
      next_step: input.next_step,
    },
  });
}
