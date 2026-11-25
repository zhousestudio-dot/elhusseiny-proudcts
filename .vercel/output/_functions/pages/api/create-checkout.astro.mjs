import { createClient } from '@supabase/supabase-js';
export { renderers } from '../../renderers.mjs';

const prerender = false;
function normalizeEgyptPhone(raw) {
  const cleaned = raw.replace(/[\s\-()]/g, "");
  const match = cleaned.match(/^(?:\+?20|0)?(1[0125][0-9]{8})$/);
  return match ? `+20${match[1]}` : null;
}
function splitName(fullName) {
  const parts = fullName.trim().split(/\s+/);
  const firstName = parts[0] || "Customer";
  const lastName = parts.slice(1).join(" ") || firstName;
  return { firstName, lastName };
}
const ipHits = /* @__PURE__ */ new Map();
function isIpRateLimited(ip) {
  const now = Date.now();
  const windowMs = 6e4;
  const recent = (ipHits.get(ip) || []).filter((t) => now - t < windowMs);
  if (recent.length >= 5) {
    ipHits.set(ip, recent);
    return true;
  }
  recent.push(now);
  ipHits.set(ip, recent);
  return false;
}
const POST = async ({ request, clientAddress }) => {
  const clientIp = clientAddress || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isIpRateLimited(clientIp)) {
    return Response.json(
      { error: "تم إرسال طلبات كثيرة جداً. يرجى الانتظار دقيقة والمحاولة مرة أخرى." },
      { status: 429 }
    );
  }
  const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const paymobSecretKey = process.env.PAYMOB_SECRET_KEY;
  const paymobPublicKey = process.env.PAYMOB_PUBLIC_KEY;
  const integrationIdsRaw = process.env.PAYMOB_INTEGRATION_IDS;
  const siteUrl = (process.env.PUBLIC_SITE_URL || "http://localhost:4321").replace(/\/$/, "");
  if (!supabaseUrl || !serviceKey || !paymobSecretKey || !paymobPublicKey || !integrationIdsRaw) {
    return Response.json(
      { error: "إعدادات الخادم غير مكتملة (متغيرات البيئة مفقودة)." },
      { status: 500 }
    );
  }
  const integrationIds = integrationIdsRaw.split(",").map((id) => Number(id.trim())).filter((id) => Number.isInteger(id) && id > 0);
  if (integrationIds.length === 0) {
    return Response.json(
      { error: "معرفات الدفع (PAYMOB_INTEGRATION_IDS) غير صالحة." },
      { status: 500 }
    );
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "بيانات الطلب غير صالحة." }, { status: 400 });
  }
  const customerName = (body.customerName || "").trim();
  const normalizedPhone = normalizeEgyptPhone(body.customerPhone || "");
  const customerEmail = (body.customerEmail || "").trim();
  const shippingAddress = (body.shippingAddress || "").trim();
  const city = (body.city || "").trim();
  if (customerName.length < 2 || customerName.length > 100) {
    return Response.json({ error: "يرجى إدخال اسم صحيح (بين ٢ و ١٠٠ حرف)." }, { status: 400 });
  }
  if (!normalizedPhone) {
    return Response.json(
      { error: "يرجى إدخال رقم موبايل مصري صحيح (مثال: 01012345678)." },
      { status: 400 }
    );
  }
  if (city.length < 2 || city.length > 60) {
    return Response.json({ error: "يرجى اختيار المحافظة / المدينة." }, { status: 400 });
  }
  if (shippingAddress.length < 5 || shippingAddress.length > 300) {
    return Response.json({ error: "يرجى إدخال عنوان توصيل صحيح (أقل من ٣٠٠ حرف)." }, { status: 400 });
  }
  if (customerEmail && (customerEmail.length > 150 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail))) {
    return Response.json({ error: "البريد الإلكتروني غير صحيح." }, { status: 400 });
  }
  const rawItems = Array.isArray(body.items) ? body.items.slice(0, 50) : [];
  const qtyById = /* @__PURE__ */ new Map();
  for (const item of rawItems) {
    if (typeof item?.productId !== "string" || !item.productId.trim()) continue;
    const qty = Math.floor(Number(item.quantity));
    if (!Number.isFinite(qty) || qty <= 0 || qty > 100) continue;
    qtyById.set(item.productId, (qtyById.get(item.productId) ?? 0) + qty);
  }
  if (qtyById.size === 0) {
    return Response.json({ error: "سلة التسوق فارغة." }, { status: 400 });
  }
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false }
  });
  const tenMinutesAgo = new Date(Date.now() - 10 * 6e4).toISOString();
  const { count: recentPhoneOrders } = await supabase.from("orders").select("id", { count: "exact", head: true }).eq("customer_phone", normalizedPhone).eq("payment_status", "pending").gte("created_at", tenMinutesAgo);
  if ((recentPhoneOrders ?? 0) >= 5) {
    return Response.json(
      { error: "تم إنشاء عدة طلبات مؤخراً لهذا الرقم. يرجى الانتظار ١٠ دقائق." },
      { status: 429 }
    );
  }
  const { data: products, error: productsError } = await supabase.from("products").select("id, name, description, price, stock, is_active").in("id", Array.from(qtyById.keys())).eq("is_active", true);
  if (productsError || !products || products.length === 0) {
    return Response.json(
      { error: "تعذر التحقق من المنتجات من قاعدة البيانات." },
      { status: 400 }
    );
  }
  const verifiedItems = [];
  let totalEGP = 0;
  for (const product of products) {
    const qty = qtyById.get(product.id) ?? 0;
    if (qty <= 0) continue;
    if (product.stock < qty) {
      return Response.json(
        { error: `الكمية المطلوبة غير متوفرة للمنتج: ${product.name}` },
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
      quantity: qty
    });
  }
  if (verifiedItems.length === 0 || totalEGP <= 0) {
    return Response.json({ error: "لا توجد منتجات صالحة في الطلب." }, { status: 400 });
  }
  const amountCents = Math.round(totalEGP * 100);
  const { data: order, error: orderError } = await supabase.from("orders").insert({
    customer_name: customerName,
    customer_phone: normalizedPhone,
    customer_email: customerEmail || null,
    shipping_address: shippingAddress,
    city,
    total: totalEGP,
    status: "pending",
    payment_status: "pending"
  }).select("id, order_number").single();
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
      quantity: item.quantity
    }))
  );
  if (itemsError) {
    console.error("Order items insert error:", itemsError.message);
    await supabase.from("orders").delete().eq("id", order.id);
    return Response.json({ error: "تعذر حفظ تفاصيل الطلب." }, { status: 500 });
  }
  const { firstName, lastName } = splitName(customerName);
  const billingEmail = customerEmail || "orders@elhusseiny.com";
  const intentionPayload = {
    amount: amountCents,
    currency: "EGP",
    payment_methods: integrationIds,
    items: verifiedItems.map((item) => ({
      name: item.product_name,
      amount: Math.round(item.unit_price * 100),
      description: item.description,
      quantity: item.quantity
    })),
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
      apartment: "NA"
    },
    customer: {
      first_name: firstName,
      last_name: lastName,
      email: billingEmail
    },
    special_reference: order.order_number,
    redirection_url: `${siteUrl}/payment/complete`,
    notification_url: `${siteUrl}/api/paymob-webhook`
  };
  let paymobData;
  try {
    const paymobRes = await fetch("https://accept.paymob.com/v1/intention/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${paymobSecretKey}`
      },
      body: JSON.stringify(intentionPayload)
    });
    paymobData = await paymobRes.json();
    if (!paymobRes.ok || !paymobData.client_secret) {
      console.error("Paymob Intention error:", paymobData);
      await supabase.from("orders").update({ status: "cancelled", payment_status: "failed" }).eq("id", order.id);
      return Response.json(
        { error: "تعذر بدء عملية الدفع مع Paymob. يرجى المحاولة مرة أخرى." },
        { status: 502 }
      );
    }
  } catch (err) {
    console.error("Paymob network error:", err);
    await supabase.from("orders").update({ status: "cancelled", payment_status: "failed" }).eq("id", order.id);
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
    status: "pending"
  });
  const checkoutUrl = `https://accept.paymob.com/unifiedcheckout/?publicKey=${encodeURIComponent(
    paymobPublicKey
  )}&clientSecret=${encodeURIComponent(paymobData.client_secret)}`;
  return Response.json({
    orderNumber: order.order_number,
    checkoutUrl
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
