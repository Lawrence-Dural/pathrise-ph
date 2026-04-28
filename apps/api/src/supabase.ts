const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseServiceKey);

function getConfig() {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Supabase server environment variables are missing.");
  }

  return { supabaseUrl, supabaseServiceKey };
}

export async function fetchSupabaseTable<T extends Record<string, unknown>>(
  table: string,
  query = "",
): Promise<T[] | null> {
  const { supabaseUrl, supabaseServiceKey } = getConfig();
  const response = await fetch(`${supabaseUrl}/rest/v1/${table}${query}`, {
    headers: {
      apikey: supabaseServiceKey,
      Authorization: `Bearer ${supabaseServiceKey}`,
    },
  });

  if (!response.ok) {
    return null;
  }

  return response.json() as Promise<T[]>;
}
