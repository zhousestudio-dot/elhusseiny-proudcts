import type { Context } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";

interface CartRequestItem {
  productId: string;
  quantity: number;
}

/**
 * Server-side cart validation & price recalculation (/.netlify/functions/validate-cart).
 * NEVER trusts prices sent from the browser — always reads real prices & stock from Supabase.
 */
export default async (req: Request, _context: Context) => {
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey || supabaseUrl.includes("your-project-id")) {
    return Response.json(
      { error: "Server Supabase credentials are not configured." },
      { status: 500 }
    );
  }

  let body: { items?: CartRequestItem[] };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const rawItems = Array.isArray(body.items) ? body.items : [];
  if (rawItems.length === 0) {
    return Response.json({ error: "Cart is empty" }, { status: 400 });
  }

  // Sanitize & deduplicate requested quantities
  const qtyById = new Map<string, number>();
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
    auth: { persistSession: false },
  });

  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, price, stock, is_active")
    .in("id", Array.from(qtyById.keys()))
    .eq("is_active", true);

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
      lineTotal,
    });
  }

  if (verifiedItems.length === 0) {
    return Response.json({ error: "Products not found or inactive" }, { status: 404 });
  }

  return Response.json({
    items: verifiedItems,
    totalEGP,
    amountCents: Math.round(totalEGP * 100),
    currency: "EGP",
  });
};
