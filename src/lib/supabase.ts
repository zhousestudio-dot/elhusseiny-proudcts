import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const env = import.meta.env as Record<string, string | undefined>;
const supabaseUrl = (process.env.PUBLIC_SUPABASE_URL || env.PUBLIC_SUPABASE_URL || "").trim();
const supabaseAnonKey = (process.env.PUBLIC_SUPABASE_ANON_KEY || env.PUBLIC_SUPABASE_ANON_KEY || "").trim();

const isConfigured =
  Boolean(supabaseUrl) &&
  Boolean(supabaseAnonKey) &&
  !supabaseUrl.includes("your-project-id");

/**
 * Returns a public Supabase client (anon key, governed by RLS),
 * or null if environment variables are not configured yet.
 */
export function getSupabasePublicClient(): SupabaseClient | null {
  if (!isConfigured) {
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  });
}
