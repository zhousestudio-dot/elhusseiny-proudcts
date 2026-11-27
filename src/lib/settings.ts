import { getSupabasePublicClient } from "./supabase";

export interface StoreSettings {
  free_shipping_threshold: number;
  wallet_phone_1: string;
  wallet_phone_2: string;
  whatsapp_phone_1: string;
  whatsapp_phone_2: string;
}

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  free_shipping_threshold: 2500,
  wallet_phone_1: "01010231211",
  wallet_phone_2: "",
  whatsapp_phone_1: "01010231211",
  whatsapp_phone_2: "",
};

/** Converts local Egyptian number like 01010231211 to wa.me international format 201010231211 */
export function toWhatsAppIntl(phone: string): string {
  const digits = phone.replace(/[^0-9]/g, "");
  if (!digits) return "201010231211";
  if (digits.startsWith("20") && digits.length >= 12) return digits;
  if (digits.startsWith("0")) return `2${digits}`;
  return digits;
}

/** Fetches store settings from Supabase with safe defaults. */
export async function getStoreSettings(): Promise<StoreSettings> {
  const supabase = getSupabasePublicClient();
  if (!supabase) return DEFAULT_STORE_SETTINGS;

  try {
    const { data, error } = await supabase
      .from("store_settings")
      .select("free_shipping_threshold, wallet_phone_1, wallet_phone_2, whatsapp_phone_1, whatsapp_phone_2")
      .eq("id", 1)
      .maybeSingle();

    if (error || !data) return DEFAULT_STORE_SETTINGS;

    return {
      free_shipping_threshold: Math.max(0, Number(data.free_shipping_threshold ?? 2500)),
      wallet_phone_1: (data.wallet_phone_1 || "01010231211").trim(),
      wallet_phone_2: (data.wallet_phone_2 || "").trim(),
      whatsapp_phone_1: (data.whatsapp_phone_1 || "01010231211").trim(),
      whatsapp_phone_2: (data.whatsapp_phone_2 || "").trim(),
    };
  } catch {
    return DEFAULT_STORE_SETTINGS;
  }
}
