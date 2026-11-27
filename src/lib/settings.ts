import { getSupabasePublicClient } from "./supabase";

export interface StoreSettings {
  free_shipping_threshold: number;
  wallet_phone_1: string;
  wallet_phone_2: string;
  whatsapp_phone_1: string;
  whatsapp_phone_2: string;
  shipping_qalag_fee: number;
  shipping_marg_fee: number;
  shipping_cairo_giza_fee: number;
  shipping_other_gov_fee: number;
}

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  free_shipping_threshold: 2500,
  wallet_phone_1: "01010231211",
  wallet_phone_2: "",
  whatsapp_phone_1: "01010231211",
  whatsapp_phone_2: "",
  shipping_qalag_fee: 20,
  shipping_marg_fee: 40,
  shipping_cairo_giza_fee: 100,
  shipping_other_gov_fee: 120,
};

/** Converts local Egyptian phone (010...) to international WhatsApp format (2010...). */
export function toWhatsAppIntl(phone: string): string {
  const digits = (phone || "").replace(/[^0-9]/g, "");
  if (!digits) return "201010231211";
  if (digits.startsWith("20")) return digits;
  if (digits.startsWith("0")) return `2${digits}`;
  return digits;
}

export async function getStoreSettings(): Promise<StoreSettings> {
  const supabase = getSupabasePublicClient();
  if (!supabase) return DEFAULT_STORE_SETTINGS;

  try {
    const { data, error } = await supabase
      .from("store_settings")
      .select(
        "free_shipping_threshold, wallet_phone_1, wallet_phone_2, whatsapp_phone_1, whatsapp_phone_2, shipping_qalag_fee, shipping_marg_fee, shipping_cairo_giza_fee, shipping_other_gov_fee"
      )
      .eq("id", 1)
      .maybeSingle();

    if (error || !data) return DEFAULT_STORE_SETTINGS;

    return {
      free_shipping_threshold: Number(data.free_shipping_threshold ?? 2500),
      wallet_phone_1: (data.wallet_phone_1 || "01010231211").trim(),
      wallet_phone_2: (data.wallet_phone_2 || "").trim(),
      whatsapp_phone_1: (data.whatsapp_phone_1 || "01010231211").trim(),
      whatsapp_phone_2: (data.whatsapp_phone_2 || "").trim(),
      shipping_qalag_fee: Number(data.shipping_qalag_fee ?? 20),
      shipping_marg_fee: Number(data.shipping_marg_fee ?? 40),
      shipping_cairo_giza_fee: Number(data.shipping_cairo_giza_fee ?? 100),
      shipping_other_gov_fee: Number(data.shipping_other_gov_fee ?? 120),
    };
  } catch {
    return DEFAULT_STORE_SETTINGS;
  }
}
