import { createClient } from '@supabase/supabase-js';
export { renderers } from '../../renderers.mjs';

const prerender = false;
const POST = async ({ request }) => {
  const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey || supabaseUrl.includes("your-project-id")) {
    return Response.json(
      { error: "Server Supabase credentials are not configured." },
      { status: 500 }
    );
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const rawItems = Array.isArray(body.items) ? body.items : [];
  if (rawItems.length === 0) {
    return Response.json({ error: "Cart is empty" }, { status: 400 });
  }
  const qtyById = /* @__PURE__ */ new Map();
  for (const item of rawItems) {
    if (typeof item?.productId !== "string" || !item.productId.trim()) continue;
    const qty = Math.floor(Number(item.quantity));
    if (!Number.isFinite(qty) || qty <= 0) continue;
    qtyById.set(item.productId, (qtyById.get(item.productId) ?? 0) + qty);
  }
  if (qtyById.size === 0) {
    return Response.json({ error: "No valid items in cart" }, { status: 400 });
  }
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false }
  });
  const { data: products, error } = await supabase.from("products").select("id, name, price, stock, is_active").in("id", Array.from(qtyById.keys())).eq("is_active", true);
  if (error || !products) {
    return Response.json({ error: "Failed to verify products" }, { status: 500 });
  }
  const verifiedItems = [];
  let totalEGP = 0;
  for (const product of products) {
    const requestedQty = qtyById.get(product.id) ?? 0;
    if (requestedQty <= 0) continue;
    if (product.stock < requestedQty) {
      return Response.json(
        { error: `الكمية المطلوبة غير متوفرة للمنتج: ${product.name}` },
        { status: 409 }
      );
    }
    const unitPrice = Number(product.price);
    const lineTotal = unitPrice * requestedQty;
    totalEGP += lineTotal;
    verifiedItems.push({
      productId: product.id,
      name: product.name,
      unitPrice,
      quantity: requestedQty,
      lineTotal
    });
  }
  if (verifiedItems.length === 0) {
    return Response.json({ error: "Products not found or inactive" }, { status: 404 });
  }
  return Response.json({
    items: verifiedItems,
    totalEGP,
    amountCents: Math.round(totalEGP * 100),
    currency: "EGP"
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
