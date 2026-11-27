import type { APIRoute } from "astro";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const prerender = false;

const STORAGE_BUCKET = "product-images";

/** Checks real file magic bytes so malicious files cannot masquerade as images. */
function isValidImageMagicBytes(buf: Buffer): boolean {
  if (buf.byteLength < 12) return false;
  // JPEG: FF D8 FF
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return true;
  // PNG: 89 50 4E 47
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return true;
  // WebP: RIFF....WEBP
  if (
    buf.subarray(0, 4).toString("ascii") === "RIFF" &&
    buf.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return true;
  }
  // AVIF: ....ftypavif / ....ftypavis
  const ftyp = buf.subarray(4, 12).toString("ascii");
  if (ftyp.startsWith("ftypavif") || ftyp.startsWith("ftypavis")) return true;
  return false;
}

function isSameOriginRequest(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const host = request.headers.get("host");
  if (!host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

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

  const [productsRes, categoriesRes, ordersRes, settingsRes] = await Promise.all([
    supabase
      .from("products")
      .select("id, name, slug, description, price, compare_at_price, image_url, stock, category_id, is_active, created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("categories")
      .select("id, name, slug")
      .order("sort_order", { ascending: true }),
    supabase
      .from("orders")
      .select("id, order_number, customer_name, customer_phone, city, shipping_address, total, status, payment_status, payment_method, payment_reference, created_at, order_items(product_name, quantity, unit_price)")
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("store_settings")
      .select("free_shipping_threshold, wallet_phone_1, wallet_phone_2, whatsapp_phone_1, whatsapp_phone_2")
      .eq("id", 1)
      .maybeSingle(),
  ]);

  return Response.json({
    products: productsRes.data || [],
    categories: categoriesRes.data || [],
    orders: ordersRes.data || [],
    settings: settingsRes.data || {
      free_shipping_threshold: 2500,
      wallet_phone_1: "01010231211",
      wallet_phone_2: "",
      whatsapp_phone_1: "01010231211",
      whatsapp_phone_2: "",
    },
  });
};

export const POST: APIRoute = async ({ request }) => {
  if (!isSameOriginRequest(request)) {
    return Response.json({ error: "Forbidden: Cross-origin request blocked" }, { status: 403 });
  }
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
    if (!isValidImageMagicBytes(buffer)) {
      return Response.json({ error: "الملف المرفوع ليس صورة صالحة." }, { status: 400 });
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
    const compareRaw = body.compare_at_price !== null && body.compare_at_price !== undefined && body.compare_at_price !== ""
      ? Number(body.compare_at_price)
      : null;
    const compareAtPrice =
      compareRaw !== null && Number.isFinite(compareRaw) && compareRaw > price && compareRaw <= 100000
        ? compareRaw
        : null;
    const stock = Math.max(0, Math.floor(Number(body.stock || 0)));
    const categoryId = body.category_id ? String(body.category_id) : null;
    const imageUrlRaw = body.image_url ? String(body.image_url).trim() : null;
    const imageUrl =
      imageUrlRaw && (imageUrlRaw.startsWith("https://") || imageUrlRaw.startsWith("/images/"))
        ? imageUrlRaw
        : null;
    const isActive = body.is_active !== false;

    if (!name || name.length > 150 || description.length > 2000 || !Number.isFinite(price) || price < 0 || price > 100000) {
      return Response.json({ error: "بيانات المنتج غير صالحة." }, { status: 400 });
    }

    const record = {
      name,
      slug: body.slug ? String(body.slug).trim() : `${slugify(name)}-${Date.now().toString().slice(-4)}`,
      description,
      price,
      compare_at_price: compareAtPrice,
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

  if (action === "toggle_stock") {
    const id = String(body.id || "");
    const nextStock = Number(body.stock) > 0 ? 999 : 0;
    if (!id) return Response.json({ error: "Missing product id" }, { status: 400 });

    const { error } = await supabase.from("products").update({ stock: nextStock }).eq("id", id);
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ ok: true, stock: nextStock });
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

  if (action === "confirm_payment") {
    const id = String(body.id || "");
    if (!id) return Response.json({ error: "Missing order id" }, { status: 400 });

    const { data: updated, error: updErr } = await supabase
      .from("orders")
      .update({ payment_status: "paid", status: "confirmed" })
      .eq("id", id)
      .neq("payment_status", "paid")
      .select("id")
      .maybeSingle();

    if (updErr) return Response.json({ error: updErr.message }, { status: 500 });
    void updated;

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

  if (action === "save_settings") {
    const threshold = Math.max(0, Math.min(100000, Math.floor(Number(body.free_shipping_threshold || 0))));
    const wallet1 = String(body.wallet_phone_1 || "").trim();
    const wallet2 = String(body.wallet_phone_2 || "").trim();
    const wa1 = String(body.whatsapp_phone_1 || "").trim();
    const wa2 = String(body.whatsapp_phone_2 || "").trim();

    if (!wallet1 || !wa1) {
      return Response.json({ error: "يرجى إدخال رقم المحفظة الأساسي ورقم الواتساب الأساسي." }, { status: 400 });
    }

    const { error } = await supabase
      .from("store_settings")
      .upsert({
        id: 1,
        free_shipping_threshold: threshold,
        wallet_phone_1: wallet1,
        wallet_phone_2: wallet2,
        whatsapp_phone_1: wa1,
        whatsapp_phone_2: wa2,
        updated_at: new Date().toISOString(),
      });

    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ ok: true });
  }

  return Response.json({ error: "Unknown action" }, { status: 400 });
};
