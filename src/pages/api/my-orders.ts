import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const env = import.meta.env as Record<string, string | undefined>;
  const getEnv = (key: string) => (process.env[key] || env[key] || "").trim();

  const supabaseUrl = getEnv("PUBLIC_SUPABASE_URL") || getEnv("SUPABASE_URL");
  const serviceKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceKey) {
    return Response.json({ error: "Server configuration incomplete." }, { status: 500 });
  }

  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  if (!token) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  const { data: userData, error: authErr } = await supabase.auth.getUser(token);
  const user = userData?.user;
  if (authErr || !user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let query = supabase
    .from("orders")
    .select(
      "id, order_number, total, status, payment_status, payment_method, city, shipping_address, created_at, order_items(product_name, quantity, unit_price)"
    )
    .order("created_at", { ascending: false })
    .limit(50);

  if (user.email && user.email_confirmed_at) {
    query = query.or(`user_id.eq.${user.id},customer_email.eq.${user.email}`);
  } else {
    query = query.eq("user_id", user.id);
  }

  const { data: orders, error: ordersErr } = await query;
  if (ordersErr) {
    return Response.json({ error: ordersErr.message }, { status: 500 });
  }

  return Response.json(
    { orders: orders || [] },
    { headers: { "Cache-Control": "no-store" } }
  );
};
