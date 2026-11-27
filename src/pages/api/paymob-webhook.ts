import crypto from "node:crypto";
import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";

export const prerender = false;

interface PaymobTransactionObj {
  id: number;
  pending: boolean;
  amount_cents: number;
  success: boolean;
  is_auth: boolean;
  is_capture: boolean;
  is_standalone_payment: boolean;
  is_voided: boolean;
  is_refunded: boolean;
  is_3d_secure: boolean;
  integration_id: number;
  has_parent_transaction: boolean;
  created_at: string;
  currency: string;
  error_occured: boolean;
  owner: number;
  order?: {
    id?: number;
    merchant_order_id?: string | null;
  };
  source_data?: {
    pan?: string | null;
    sub_type?: string | null;
    type?: string | null;
  };
  payment_key_claims?: {
    extra?: {
      intention_id?: string;
    };
  };
}

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function toHmacValue(val: unknown): string {
  if (val === null || val === undefined) return "";
  return String(val);
}

function computePaymobHmac(obj: PaymobTransactionObj, secret: string): string {
  const concatenated = [
    toHmacValue(obj.amount_cents),
    toHmacValue(obj.created_at),
    toHmacValue(obj.currency),
    toHmacValue(obj.error_occured),
    toHmacValue(obj.has_parent_transaction),
    toHmacValue(obj.id),
    toHmacValue(obj.integration_id),
    toHmacValue(obj.is_3d_secure),
    toHmacValue(obj.is_auth),
    toHmacValue(obj.is_capture),
    toHmacValue(obj.is_refunded),
    toHmacValue(obj.is_standalone_payment),
    toHmacValue(obj.is_voided),
    toHmacValue(obj.order?.id),
    toHmacValue(obj.owner),
    toHmacValue(obj.pending),
    toHmacValue(obj.source_data?.pan),
    toHmacValue(obj.source_data?.sub_type),
    toHmacValue(obj.source_data?.type),
    toHmacValue(obj.success),
  ].join("");

  return crypto.createHmac("sha512", secret).update(concatenated).digest("hex");
}

function verifyHmac(expectedHex: string, receivedHex: string): boolean {
  const a = Buffer.from(expectedHex.toLowerCase(), "utf8");
  const b = Buffer.from(receivedHex.toLowerCase(), "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

async function sendResendEmail(params: {
  apiKey: string;
  from: string;
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${params.apiKey}`,
    },
    body: JSON.stringify({
      from: params.from,
      to: [params.to],
      subject: params.subject,
      html: params.html,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Resend API error (${res.status}): ${errText}`);
  }
}

/**
 * Paymob Transaction Processed Webhook
 * POST /api/paymob-webhook?hmac=...
 */
export const POST: APIRoute = async ({ request }) => {
  const env = import.meta.env as Record<string, string | undefined>;
  const getEnv = (key: string) => (process.env[key] || env[key] || "").trim();

  const supabaseUrl = getEnv("PUBLIC_SUPABASE_URL") || getEnv("SUPABASE_URL");
  const serviceKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");
  const hmacSecret = getEnv("PAYMOB_HMAC_SECRET");

  if (!supabaseUrl || !serviceKey || !hmacSecret) {
    console.error("[paymob-webhook] Missing required server environment variables");
    return Response.json({ error: "Server misconfigured" }, { status: 500 });
  }

  let body: { type?: string; obj?: PaymobTransactionObj; hmac?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const obj = body?.obj;
  if (!obj || typeof obj.id !== "number") {
    return Response.json({ error: "Invalid webhook payload" }, { status: 400 });
  }

  const url = new URL(request.url);
  const receivedHmac = (url.searchParams.get("hmac") || body.hmac || "").trim();
  if (!receivedHmac) {
    console.warn("[paymob-webhook] Rejected webhook: missing hmac");
    return Response.json({ error: "Missing signature" }, { status: 401 });
  }

  const expectedHmac = computePaymobHmac(obj, hmacSecret);
  if (!verifyHmac(expectedHmac, receivedHmac)) {
    console.warn("[paymob-webhook] Rejected webhook: invalid hmac for tx", obj.id);
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }

  if (obj.pending) {
    return Response.json({ received: true, status: "pending" });
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  const { data: existingTx } = await supabase
    .from("payments")
    .select("id, status")
    .eq("paymob_transaction_id", obj.id)
    .maybeSingle();

  if (existingTx && (existingTx.status === "paid" || existingTx.status === "failed")) {
    return Response.json({ received: true, duplicate: true });
  }

  const orderNumber = obj.order?.merchant_order_id || null;
  const intentionId = obj.payment_key_claims?.extra?.intention_id || null;

  let order: {
    id: string;
    order_number: string;
    customer_name: string;
    customer_phone: string;
    customer_email: string | null;
    city: string;
    shipping_address: string;
    total: number | string;
    payment_status: string;
  } | null = null;

  if (orderNumber) {
    const { data } = await supabase
      .from("orders")
      .select("id, order_number, customer_name, customer_phone, customer_email, city, shipping_address, total, payment_status")
      .eq("order_number", orderNumber)
      .maybeSingle();
    order = data;
  }

  if (!order && intentionId) {
    const { data: paymentRow } = await supabase
      .from("payments")
      .select("order_id")
      .eq("paymob_intention_id", intentionId)
      .maybeSingle();

    if (paymentRow?.order_id) {
      const { data } = await supabase
        .from("orders")
        .select("id, order_number, customer_name, customer_phone, customer_email, city, shipping_address, total, payment_status")
        .eq("id", paymentRow.order_id)
        .maybeSingle();
      order = data;
    }
  }

  if (!order) {
    console.error("[paymob-webhook] Order not found for tx", obj.id, "ref:", orderNumber);
    return Response.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.payment_status === "paid") {
    return Response.json({ received: true, duplicate: true });
  }

  const paymentMethod = obj.source_data?.type || null;
  const paymobOrderId = obj.order?.id ?? null;

  if (!obj.success) {
    await supabase
      .from("orders")
      .update({ payment_status: "failed", status: "cancelled" })
      .eq("id", order.id);

    await supabase
      .from("payments")
      .update({
        paymob_transaction_id: obj.id,
        paymob_order_id: paymobOrderId,
        status: "failed",
        payment_method: paymentMethod,
        raw_response: obj,
      })
      .eq("order_id", order.id);

    return Response.json({ received: true, status: "failed" });
  }

  const expectedCents = Math.round(Number(order.total) * 100);
  if (obj.amount_cents !== expectedCents) {
    console.error(
      `[paymob-webhook] Amount mismatch for order ${order.order_number}: expected ${expectedCents}, got ${obj.amount_cents}`
    );
    return Response.json({ error: "Amount mismatch" }, { status: 400 });
  }

  const { data: updatedOrder, error: updateOrderError } = await supabase
    .from("orders")
    .update({ payment_status: "paid", status: "confirmed" })
    .eq("id", order.id)
    .neq("payment_status", "paid")
    .select("id")
    .maybeSingle();

  if (updateOrderError) {
    console.error("[paymob-webhook] Failed to update order:", updateOrderError.message);
    return Response.json({ error: "Database update failed" }, { status: 500 });
  }

  if (!updatedOrder) {
    return Response.json({ received: true, duplicate: true });
  }

  const { error: paymentUpdateError } = await supabase
    .from("payments")
    .update({
      paymob_transaction_id: obj.id,
      paymob_order_id: paymobOrderId,
      status: "paid",
      payment_method: paymentMethod,
      raw_response: obj,
    })
    .eq("order_id", order.id);

  if (paymentUpdateError) {
    console.error("[paymob-webhook] Failed to update payment:", paymentUpdateError.message);
  }

  // Stock counts are managed as Available/Unavailable from Admin; no per-order numeric decrement needed.

  const resendKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;

  if (resendKey && fromEmail) {
    const emailTasks: Promise<void>[] = [];

    if (order.customer_email) {
      emailTasks.push(
        sendResendEmail({
          apiKey: resendKey,
          from: fromEmail,
          to: order.customer_email,
          subject: `تأكيد طلبك من منتجات الحسيني (${order.order_number})`,
          html: `
            <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.7;">
              <h2>شكراً لطلبك من منتجات الحسيني!</h2>
              <p>مرحباً ${escapeHtml(order.customer_name)}، تم تأكيد الدفع بنجاح.</p>
              <p><strong>رقم الطلب:</strong> ${escapeHtml(order.order_number)}</p>
              <p><strong>الإجمالي المدفوع:</strong> ${escapeHtml(order.total)} ج.م.</p>
              <p><strong>العنوان:</strong> ${escapeHtml(order.city)} — ${escapeHtml(order.shipping_address)}</p>
              <p>سيتواصل معك فريقنا قريباً لتنسيق التوصيل.</p>
            </div>
          `,
        })
      );
    }

    if (adminEmail) {
      emailTasks.push(
        sendResendEmail({
          apiKey: resendKey,
          from: fromEmail,
          to: adminEmail,
          subject: `طلب جديد مدفوع: ${order.order_number} (${order.total} ج.م.)`,
          html: `
            <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.7;">
              <h2>تم استلام طلب جديد مدفوع</h2>
              <p><strong>رقم الطلب:</strong> ${escapeHtml(order.order_number)}</p>
              <p><strong>العميل:</strong> ${escapeHtml(order.customer_name)}</p>
              <p><strong>الهاتف:</strong> ${escapeHtml(order.customer_phone)}</p>
              <p><strong>العنوان:</strong> ${escapeHtml(order.city)} — ${escapeHtml(order.shipping_address)}</p>
              <p><strong>الإجمالي:</strong> ${escapeHtml(order.total)} ج.م.</p>
            </div>
          `,
        })
      );
    }

    const results = await Promise.allSettled(emailTasks);
    for (const r of results) {
      if (r.status === "rejected") {
        console.error("[paymob-webhook] Resend email error:", r.reason);
      }
    }
  }

  return Response.json({ received: true, status: "paid", orderNumber: order.order_number });
};
