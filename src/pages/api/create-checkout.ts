import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";
import { getStoreSettings } from "../../lib/settings";
import { calculateShippingFee } from "../../lib/shipping";

export const prerender = false;

interface CheckoutItemInput {
  productId?: string;
  slug?: string;
  quantity: number;
}

interface CheckoutBody {
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  shippingAddress?: string;
  city?: string;
  area?: string;
  paymentMethod?: "paymob" | "vodafone_cash" | "cod";
  walletSenderPhone?: string;
  items?: CheckoutItemInput[];
}

function normalizeEgyptPhone(raw: string): string | null {
  const cleaned = raw.replace(/[\s\-()]/g, "");
  const egMatch = cleaned.match(/^(?:\+?20|0)?(1[0125][0-9]{8})$/);
  return egMatch ? `+20${egMatch[1]}` : null;
}

function normalizePhone(raw: string): string | null {
  const eg = normalizeEgyptPhone(raw);
  if (eg) return eg;
  const cleaned = raw.replace(/[\s\-()]/g, "");
  const intlMatch = cleaned.match(/^\+?([0-9]{7,15})$/);
  return intlMatch ? `+${intlMatch[1]}` : null;
}

function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/);
  const firstName = parts[0] || "Customer";
  const lastName = parts.slice(1).join(" ") || firstName;
  return { firstName, lastName };
}

const ipHits = new Map<string, number[]>();

function isIpRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60_000;
  const recent = (ipHits.get(ip) || []).filter((t) => now - t < windowMs);
  if (recent.length >= 5) {
    ipHits.set(ip, recent);
    return true;
  }
  recent.push(now);
  ipHits.set(ip, recent);
  return false;
}

/**
 * Creates a pending order in Supabase and initializes a Paymob Intention.
 * POST /api/create-checkout
 */
export const POST: APIRoute = async ({ request, clientAddress }) => {
  const clientIp =
    clientAddress ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";

  if (isIpRateLimited(clientIp)) {
    return Response.json(
      { error: "تم إرسال طلبات كثيرة جداً. يرجى الانتظار دقيقة والمحاولة مرة أخرى." },
      { status: 429 }
    );
  }

  const env = import.meta.env as Record<string, string | undefined>;
  const getEnv = (key: string) => (process.env[key] || env[key] || "").trim();

  const supabaseUrl = getEnv("PUBLIC_SUPABASE_URL") || getEnv("SUPABASE_URL");
  const serviceKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");
  const paymobSecretKey = getEnv("PAYMOB_SECRET_KEY");
  const paymobPublicKey = getEnv("PAYMOB_PUBLIC_KEY");
  const integrationIdsRaw = getEnv("PAYMOB_INTEGRATION_IDS");
  const siteUrl = (getEnv("PUBLIC_SITE_URL") || "http://localhost:4321").replace(/\/$/, "");

  const missingKeys = [
    !supabaseUrl && "PUBLIC_SUPABASE_URL",
    !serviceKey && "SUPABASE_SERVICE_ROLE_KEY",
  ].filter(Boolean) as string[];

  if (missingKeys.length > 0) {
    console.error("[create-checkout] Missing env keys:", missingKeys.join(", "));
    return Response.json(
      { error: `إعدادات الخادم غير مكتملة (مفقود: ${missingKeys.join("، ")})` },
      { status: 500 }
    );
  }

  let body: CheckoutBody;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "بيانات الطلب غير صالحة." }, { status: 400 });
  }

  const customerName = (body.customerName || "").trim();
  const normalizedPhone = normalizePhone(body.customerPhone || "");
  const customerEmail = (body.customerEmail || "").trim();
  const shippingAddress = (body.shippingAddress || "").trim();
  const city = (body.city || "").trim();
  const area = (body.area || "").trim();
  const fullShippingAddress = area ? `${area} — ${shippingAddress}` : shippingAddress;
  const paymentMethod: "paymob" | "vodafone_cash" | "cod" =
    body.paymentMethod === "vodafone_cash" || body.paymentMethod === "cod"
      ? body.paymentMethod
      : "paymob";
  const walletSenderPhone =
    paymentMethod === "vodafone_cash" ? normalizeEgyptPhone(body.walletSenderPhone || "") : null;

  if (paymentMethod === "vodafone_cash" && !walletSenderPhone) {
    return Response.json(
      { error: "يرجى إدخال رقم المحفظة الإلكترونية الذي تم التحويل منه." },
      { status: 400 }
    );
  }

  let integrationIds: number[] = [];
  if (paymentMethod === "paymob") {
    if (!paymobSecretKey || !paymobPublicKey || !integrationIdsRaw) {
      return Response.json(
        { error: "الدفع الإلكتروني بالبطاقة قيد التفعيل حالياً. يمكنك الدفع عبر محفظة إلكترونية أو عند الاستلام." },
        { status: 503 }
      );
    }
    integrationIds = integrationIdsRaw
      .split(",")
      .map((id) => Number(id.trim()))
      .filter((id) => Number.isInteger(id) && id > 0);
    if (integrationIds.length === 0) {
      return Response.json({ error: "معرفات الدفع غير صالحة." }, { status: 500 });
    }
  }

  if (customerName.length < 2 || customerName.length > 100) {
    return Response.json({ error: "يرجى إدخال اسم صحيح (بين ٢ و ١٠٠ حرف)." }, { status: 400 });
  }
  if (!normalizedPhone) {
    return Response.json(
      { error: "يرجى إدخال رقم موبايل صحيح." },
      { status: 400 }
    );
  }
  if (city.length < 2 || city.length > 60) {
    return Response.json({ error: "يرجى اختيار المحافظة / المدينة." }, { status: 400 });
  }
  if (!shippingAddress || shippingAddress.length > 300) {
    return Response.json({ error: "يرجى إدخال عنوان التوصيل." }, { status: 400 });
  }
  if (customerEmail && (customerEmail.length > 150 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail))) {
    return Response.json({ error: "البريد الإلكتروني غير صحيح." }, { status: 400 });
  }

  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const rawItems = Array.isArray(body.items) ? body.items.slice(0, 50) : [];
  const qtyById = new Map<string, number>();
  const qtyBySlug = new Map<string, number>();

  for (const item of rawItems) {
    const qty = Math.floor(Number(item?.quantity));
    if (!Number.isFinite(qty) || qty <= 0 || qty > 100) continue;

    const id = typeof item?.productId === "string" ? item.productId.trim() : "";
    const slug = typeof item?.slug === "string" ? item.slug.trim() : "";

    if (id && UUID_RE.test(id)) {
      qtyById.set(id, (qtyById.get(id) ?? 0) + qty);
    } else if (slug) {
      qtyBySlug.set(slug, (qtyBySlug.get(slug) ?? 0) + qty);
    }
  }

  if (qtyById.size === 0 && qtyBySlug.size === 0) {
    return Response.json({ error: "سلة التسوق فارغة." }, { status: 400 });
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  const tenMinutesAgo = new Date(Date.now() - 10 * 60_000).toISOString();
  const { count: recentPhoneOrders } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("customer_phone", normalizedPhone)
    .eq("payment_status", "pending")
    .gte("created_at", tenMinutesAgo);

  if ((recentPhoneOrders ?? 0) >= 5) {
    return Response.json(
      { error: "تم إنشاء عدة طلبات مؤخراً لهذا الرقم. يرجى الانتظار ١٠ دقائق." },
      { status: 429 }
    );
  }

  type DbProduct = {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    price: number | string;
    stock: number;
    is_active: boolean;
  };

  const fetchedById = new Map<string, DbProduct>();
  const requestedQtyByDbId = new Map<string, number>();

  if (qtyById.size > 0) {
    const { data, error } = await supabase
      .from("products")
      .select("id, slug, name, description, price, stock, is_active")
      .in("id", Array.from(qtyById.keys()))
      .eq("is_active", true);

    if (error) {
      console.error("[create-checkout] products by id error:", error.message);
      return Response.json({ error: `خطأ قاعدة البيانات: ${error.message}` }, { status: 500 });
    } else if (data) {
      for (const p of data as DbProduct[]) {
        fetchedById.set(p.id, p);
        requestedQtyByDbId.set(p.id, (requestedQtyByDbId.get(p.id) ?? 0) + (qtyById.get(p.id) ?? 0));
      }
    }
  }

  if (qtyBySlug.size > 0) {
    const { data, error } = await supabase
      .from("products")
      .select("id, slug, name, description, price, stock, is_active")
      .in("slug", Array.from(qtyBySlug.keys()))
      .eq("is_active", true);

    if (error) {
      console.error("[create-checkout] products by slug error:", error.message);
      return Response.json({ error: `خطأ قاعدة البيانات: ${error.message}` }, { status: 500 });
    } else if (data) {
      for (const p of data as DbProduct[]) {
        fetchedById.set(p.id, p);
        requestedQtyByDbId.set(p.id, (requestedQtyByDbId.get(p.id) ?? 0) + (qtyBySlug.get(p.slug) ?? 0));
      }
    }
  }

  const products = Array.from(fetchedById.values());
  if (products.length === 0) {
    return Response.json(
      { error: "المنتجات غير موجودة في قاعدة البيانات (تأكد من تشغيل seed.sql في Supabase)." },
      { status: 400 }
    );
  }

  const verifiedItems: Array<{
    product_id: string;
    product_name: string;
    description: string;
    unit_price: number;
    quantity: number;
  }> = [];
  let totalEGP = 0;

  for (const product of products) {
    const qty = requestedQtyByDbId.get(product.id) ?? 0;
    if (qty <= 0) continue;

    if (product.stock <= 0) {
      return Response.json(
        { error: `المنتج غير متوفر حالياً: ${product.name}` },
        { status: 409 }
      );
    }

    const unitPrice = Number(product.price);
    totalEGP += unitPrice * qty;
    verifiedItems.push({
      product_id: product.id,
      product_name: product.name,
      description: (product.description || product.name).slice(0, 200),
      unit_price: unitPrice,
      quantity: qty,
    });
  }

  if (verifiedItems.length === 0 || totalEGP <= 0) {
    return Response.json({ error: "لا توجد منتجات صالحة في الطلب." }, { status: 400 });
  }

  const storeSettings = await getStoreSettings();
  const shippingQuote = calculateShippingFee(city, area, shippingAddress, totalEGP, storeSettings);
  const shippingFeeEGP = shippingQuote.fee;
  const finalTotalEGP = totalEGP + shippingFeeEGP;
  const amountCents = Math.round(finalTotalEGP * 100);

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_name: customerName,
      customer_phone: normalizedPhone,
      customer_email: customerEmail || null,
      shipping_address: fullShippingAddress,
      city,
      total: finalTotalEGP,
      status: "pending",
      payment_status: paymentMethod === "cod" ? "unpaid" : "pending",
      payment_method: paymentMethod,
      payment_reference: walletSenderPhone,
    })
    .select("id, order_number")
    .single();

  if (orderError || !order) {
    console.error("Order insert error:", orderError?.message);
    return Response.json({ error: "تعذر إنشاء الطلب في قاعدة البيانات." }, { status: 500 });
  }

  const { error: itemsError } = await supabase.from("order_items").insert(
    verifiedItems.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.product_name,
      unit_price: item.unit_price,
      quantity: item.quantity,
    }))
  );

  if (itemsError) {
    console.error("Order items insert error:", itemsError.message);
    await supabase.from("orders").delete().eq("id", order.id);
    return Response.json({ error: "تعذر حفظ تفاصيل الطلب." }, { status: 500 });
  }

  // For direct Vodafone Cash or Cash on Delivery, return redirect URL directly without Paymob
  if (paymentMethod === "vodafone_cash" || paymentMethod === "cod") {
    const resendKey = getEnv("RESEND_API_KEY");
    const fromEmail = getEnv("RESEND_FROM_EMAIL");
    const adminNotify = getEnv("ADMIN_NOTIFICATION_EMAIL");
    if (resendKey && fromEmail && adminNotify) {
      const methodLabel = paymentMethod === "vodafone_cash" ? "محفظة إلكترونية (إرسال مباشر)" : "الدفع عند الاستلام";
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [adminNotify],
          subject: `طلب جديد (${methodLabel}): ${order.order_number} — ${finalTotalEGP} ج.م.`,
          html: `<div dir="rtl" style="font-family:Arial,sans-serif;line-height:1.7;">
            <h2>طلب جديد (${methodLabel})</h2>
            <p><strong>رقم الطلب:</strong> ${order.order_number}</p>
            <p><strong>العميل:</strong> ${customerName} (${normalizedPhone})</p>
            ${walletSenderPhone ? `<p><strong>رقم محفظة التحويل:</strong> ${walletSenderPhone}</p>` : ""}
            <p><strong>العنوان:</strong> ${city} — ${fullShippingAddress}</p>
            ${shippingFeeEGP > 0 ? `<p><strong>${shippingQuote.label}:</strong> ${shippingFeeEGP} ج.م.</p>` : ""}
            <p><strong>الإجمالي:</strong> ${finalTotalEGP} ج.م.</p>
          </div>`,
        }),
      }).catch(() => {});
    }

    const completeUrl = `${siteUrl}/payment/complete?success=true&method=${encodeURIComponent(
      paymentMethod
    )}&order=${encodeURIComponent(order.order_number)}&total=${encodeURIComponent(
      String(finalTotalEGP)
    )}&shipping=${encodeURIComponent(String(shippingFeeEGP))}&subtotal=${encodeURIComponent(String(totalEGP))}`;

    return Response.json({
      orderNumber: order.order_number,
      checkoutUrl: completeUrl,
    });
  }

  const { firstName, lastName } = splitName(customerName);
  const billingEmail = customerEmail || "orders@elhusseiny.com";

  const intentionPayload = {
    amount: amountCents,
    currency: "EGP",
    payment_methods: integrationIds,
    items: [
      ...verifiedItems.map((item) => ({
        name: item.product_name,
        amount: Math.round(item.unit_price * 100),
        description: item.description,
        quantity: item.quantity,
      })),
      ...(shippingFeeEGP > 0
        ? [
            {
              name: shippingQuote.label,
              amount: Math.round(shippingFeeEGP * 100),
              description: shippingQuote.label,
              quantity: 1,
            },
          ]
        : []),
    ],
    billing_data: {
      first_name: firstName,
      last_name: lastName,
      phone_number: normalizedPhone,
      email: billingEmail,
      country: "EG",
      city,
      street: shippingAddress,
      building: "NA",
      floor: "NA",
      apartment: "NA",
    },
    customer: {
      first_name: firstName,
      last_name: lastName,
      email: billingEmail,
    },
    special_reference: order.order_number,
    redirection_url: `${siteUrl}/payment/complete`,
    notification_url: `${siteUrl}/api/paymob-webhook`,
  };

  let paymobData: { id?: string; client_secret?: string };
  try {
    const paymobRes = await fetch("https://accept.paymob.com/v1/intention/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${paymobSecretKey}`,
      },
      body: JSON.stringify(intentionPayload),
    });

    paymobData = await paymobRes.json();

    if (!paymobRes.ok || !paymobData.client_secret) {
      console.error("Paymob Intention error:", paymobData);
      await supabase
        .from("orders")
        .update({ status: "cancelled", payment_status: "failed" })
        .eq("id", order.id);

      return Response.json(
        { error: "تعذر بدء عملية الدفع مع Paymob. يرجى المحاولة مرة أخرى." },
        { status: 502 }
      );
    }
  } catch (err) {
    console.error("Paymob network error:", err);
    await supabase
      .from("orders")
      .update({ status: "cancelled", payment_status: "failed" })
      .eq("id", order.id);

    return Response.json(
      { error: "حدث خطأ في الاتصال ببوابة الدفع." },
      { status: 502 }
    );
  }

  await supabase.from("payments").insert({
    order_id: order.id,
    provider: "paymob",
    paymob_intention_id: paymobData.id || null,
    amount_cents: amountCents,
    currency: "EGP",
    status: "pending",
  });

  const checkoutUrl = `https://accept.paymob.com/unifiedcheckout/?publicKey=${encodeURIComponent(
    paymobPublicKey
  )}&clientSecret=${encodeURIComponent(paymobData.client_secret)}`;

  return Response.json({
    orderNumber: order.order_number,
    checkoutUrl,
  });
};
