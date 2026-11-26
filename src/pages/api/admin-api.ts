import type { APIRoute } from "astro";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const prerender = false;

const STORAGE_BUCKET = "product-images";

function slugify(text: string): string {
  const base = text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-");
  return base || `product-${Date.now()}`;
}

async function authenticateAdmin(request: Request): Promise<
  { supabase: SupabaseClient; error?: undefined } | { supabase?: undefined; error: Response }
> {
  const env = import.meta.env as Record<string, string | undefined>;
  const getEnv = (key: string) => (process.env[key] || env[key] || "").trim();

  const supabaseUrl = getEnv("PUBLIC_SUPABASE_URL") || getEnv("SUPABASE_URL");
  const serviceKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");
  const adminEmail = (getEnv("ADMIN_EMAIL") || getEnv("ADMIN_NOTIFICATION_EMAIL")).toLowerCase();

  if (!supabaseUrl || !serviceKey || !adminEmail) {
    return {
      error: Response.json({ error: "Server admin configuration is incomplete." }, { status: 500 }),
    };
  }

  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  if (!token) {
    return { error: Response.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  const { data: userData, error: authError } = await supabase.auth.getUser(token);
  const userEmail = userData?.user?.email?.toLowerCase();

  if (authError || !userEmail || userEmail !== adminEmail) {
    return { error: Response.json({ error: "Forbidden: Admin access only" }, { status: 403 }) };
  }

  return { supabase };
}

export const GET: APIRoute = async ({ request }) => {
  const auth = await authenticateAdmin(request);
  if (auth.error) return auth.error;
  const supabase = auth.supabase;

  const [productsRes, categoriesRes, ordersRes] = await Promise.all([
    supabase
      .from("products")
      .select("id, name, slug, description, price, image_url, stock, category_id, is_active, created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("categories")
      .select("id, name, slug")
      .order("sort_order", { ascending: true }),
    supabase
      .from("orders")
      .select("id, order_number, customer_name, customer_phone, city, shipping_address, total, status, payment_status, created_at")
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  return Response.json({
    products: productsRes.data || [],
    categories: categoriesRes.data || [],
    orders: ordersRes.data || [],
  });
};

export const POST: APIRoute = async ({ request }) => {
  const auth = await authenticateAdmin(request);
  if (auth.error) return auth.error;
  const supabase = auth.supabase;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const action = String(body.action || "");

  if (action === "upload_image") {
    const fileName = String(body.fileName || "image.webp").replace(/[^a-zA-Z0-9._-]/g, "_");
    const base64Data = String(body.base64Data || "");
    const contentType = String(body.contentType || "image/jpeg");
    const allowedMime = ["image/jpeg", "image/png", "image/webp", "image/avif"];

    if (!allowedMime.includes(contentType)) {
      return Response.json({ error: "نوع الصورة غير مدعوم." }, { status: 400 });
    }
    if (!base64Data) {
      return Response.json({ error: "Missing image data" }, { status: 400 });
    }

    await supabase.storage.createBucket(STORAGE_BUCKET, { public: true }).catch(() => {});

    const buffer = Buffer.from(base64Data, "base64");
    if (buffer.byteLength > 5 * 1024 * 1024) {
      return Response.json({ error: "حجم الصورة يتجاوز ٥ ميجابايت." }, { status: 400 });
    }

    const path = `products/${Date.now()}-${fileName}`;
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(path, buffer, { contentType, upsert: false });

    if (uploadError) {
      return Response.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: publicUrlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(path);

    return Response.json({ imageUrl: publicUrlData.publicUrl });
  }

  if (action === "save_product") {
    const id = body.id ? String(body.id) : null;
    const name = String(body.name || "").trim();
    const description = String(body.description || "").trim();
    const price = Number(body.price);
    const stock = Math.max(0, Math.floor(Number(body.stock || 0)));
    const categoryId = body.category_id ? String(body.category_id) : null;
    const imageUrlRaw = body.image_url ? String(body.image_url).trim() : null;
    const imageUrl =
      imageUrlRaw && (imageUrlRaw.startsWith("https://") || imageUrlRaw.startsWith("/images/"))
        ? imageUrlRaw
        : null;
    const isActive = body.is_active !== false;

    if (!name || !Number.isFinite(price) || price < 0) {
      return Response.json({ error: "بيانات المنتج غير صالحة." }, { status: 400 });
    }

    const record = {
      name,
      slug: body.slug ? String(body.slug).trim() : `${slugify(name)}-${Date.now().toString().slice(-4)}`,
      description,
      price,
      stock,
      category_id: categoryId,
      image_url: imageUrl,
      is_active: isActive,
    };

    if (id) {
      const { error } = await supabase.from("products").update(record).eq("id", id);
      if (error) return Response.json({ error: error.message }, { status: 500 });
      return Response.json({ ok: true, updated: id });
    } else {
      const { data, error } = await supabase
        .from("products")
        .insert(record)
        .select("id")
        .single();
      if (error) return Response.json({ error: error.message }, { status: 500 });
      return Response.json({ ok: true, created: data.id });
    }
  }

  if (action === "delete_product") {
    const id = String(body.id || "");
    if (!id) return Response.json({ error: "Missing product id" }, { status: 400 });

    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ ok: true });
  }

  if (action === "update_order_status") {
    const id = String(body.id || "");
    const status = String(body.status || "");
    const allowed = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

    if (!id || !allowed.includes(status)) {
      return Response.json({ error: "حالة الطلب غير صالحة." }, { status: 400 });
    }

    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ ok: true });
  }

  if (action === "trigger_rebuild") {
    const hookUrl = process.env.VERCEL_DEPLOY_HOOK_URL || process.env.NETLIFY_BUILD_HOOK_URL;
    if (!hookUrl || hookUrl.includes("your-hook-id")) {
      return Response.json(
        { error: "لم يتم ضبط رابط VERCEL_DEPLOY_HOOK_URL بعد." },
        { status: 400 }
      );
    }

    const hookRes = await fetch(hookUrl, { method: "POST" });
    if (!hookRes.ok) {
      return Response.json({ error: "فشل تشغيل إعادة البناء على Vercel." }, { status: 502 });
    }
    return Response.json({ ok: true });
  }

  return Response.json({ error: "Unknown action" }, { status: 400 });
};
