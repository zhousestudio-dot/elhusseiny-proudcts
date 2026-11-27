import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const env = import.meta.env as Record<string, string | undefined>;
  const getEnv = (key: string) => (process.env[key] || env[key] || "").trim();

  const supabaseUrl = getEnv("PUBLIC_SUPABASE_URL") || getEnv("SUPABASE_URL");
  const serviceKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");
  const adminEmail = (getEnv("ADMIN_EMAIL") || getEnv("ADMIN_NOTIFICATION_EMAIL")).toLowerCase();

  if (!supabaseUrl || !serviceKey) {
    return Response.json({ authenticated: false, isAdmin: false });
  }

  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  if (!token) {
    return Response.json({ authenticated: false, isAdmin: false });
  }

  try {
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) {
      return Response.json({ authenticated: false, isAdmin: false });
    }

    const email = (data.user.email || "").toLowerCase();
    const isAdmin = Boolean(adminEmail && email && email === adminEmail);
    const name =
      (data.user.user_metadata?.full_name as string) ||
      (data.user.user_metadata?.name as string) ||
      email.split("@")[0] ||
      "حسابي";

    return Response.json(
      {
        authenticated: true,
        email: data.user.email || "",
        name,
        isAdmin,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return Response.json({ authenticated: false, isAdmin: false });
  }
};
