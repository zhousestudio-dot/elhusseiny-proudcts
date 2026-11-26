import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";

export const prerender = false;

function normalizeEgyptPhone(raw: string): string | null {
  const cleaned = raw.replace(/[\s\-()]/g, "");
  const match = cleaned.match(/^(?:\+?20|0)?(1[0125][0-9]{8})$/);
  return match ? `+20${match[1]}` : null;
}

const trackHits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (trackHits.get(ip) || []).filter((t) => now - t < 60_000);
  if (recent.length >= 10) {
    trackHits.set(ip, recent);
    return true;
  }
  recent.push(now);
  trackHits.set(ip, recent);
  return false;
}

/**
 * Secure order tracking endpoint (POST /api/track-order).
 * Requires matching orderNumber + customerPhone; never exposes full address or PII.
 */
export const POST: APIRoute = async ({ request, clientAddress }) => {
  const ip =
    clientAddress ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";

  if (isRateLimited(ip)) {
    return Response.json(
      { error: "محاولات كثيرة جداً. يرجى الانتظار دقيقة والمحاولة مرة أخرى." },
      { status: 429 }
    );
  }

  const env = import.meta.env as Record<string, string | undefined>;
  const getEnv = (key: string) => (process.env[key] || env[key] || "").trim();
  const supabaseUrl = getEnv("PUBLIC_SUPABASE_URL") || getEnv("SUPABASE_URL");
  const serviceKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceKey) {
    return Response.json({ error: "Server configuration error" }, { status: 500 });
  }

  let body: { orderNumber?: string; phone?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "بيانات غير صالحة." }, { status: 400 });
  }

  const orderNumber = String(body.orderNumber || "").trim().toUpperCase();
  const phone = normalizeEgyptPhone(String(body.phone || ""));

  if (!orderNumber || !/^ELH-[A-Z0-9-]+$/i.test(orderNumber)) {
    return Response.json({ error: "يرجى إدخال رقم طلب صحيح (مثال: ELH-1234ABCD)." }, { status: 400 });
  }
  if (!phone) {
    return Response.json({ error: "يرجى إدخال رقم الموبايل المسجل في الطلب." }, { status: 400 });
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  const { data: order, error } = await supabase
    .from("orders")
    .select("order_number, status, payment_status, payment_method, total, created_at, order_items(product_name, quantity)")
    .eq("order_number", orderNumber)
    .eq("customer_phone", phone)
    .maybeSingle();

  if (error || !order) {
    return Response.json(
      { error: "لم يتم العثور على طلب مطابق لهذا الرقم والموبايل." },
      { status: 404 }
    );
  }

  return Response.json({ order });
};
