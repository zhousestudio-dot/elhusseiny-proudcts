import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";

export const prerender = false;

export const POST: APIRoute = async () => {
  const env = import.meta.env as Record<string, string | undefined>;
  const getEnv = (key: string) => (process.env[key] || env[key] || "").trim();

  const supabaseUrl = getEnv("PUBLIC_SUPABASE_URL") || getEnv("SUPABASE_URL");
  const serviceKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceKey) {
    return new Response(null, { status: 204 });
  }

  try {
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });
    await supabase.rpc("increment_site_visit");
  } catch {
    // Non-critical telemetry; never fail the visitor experience
  }

  return new Response(null, { status: 204 });
};
