import type { StoreSettings } from "./settings";

export interface ShippingQuote {
  fee: number;
  label: string;
}

/**
 * Calculates shipping fee based on Governorate (`city`), selected center/area (`area`),
 * street address (`address`), cart subtotal, and store settings from Supabase.
 */
export function calculateShippingFee(
  city: string,
  area: string,
  address: string,
  subtotal: number,
  settings: Pick<
    StoreSettings,
    | "free_shipping_threshold"
    | "shipping_qalag_fee"
    | "shipping_marg_fee"
    | "shipping_cairo_giza_fee"
    | "shipping_other_gov_fee"
  >
): ShippingQuote {
  const combinedArea = `${area} ${address}`.trim();
  const isQalagZone = /القلج|قلج|الخانكة|خانكة|الجبل|جبل أصفر|الجبل الأصفر|qalag|khankah/i.test(combinedArea);
  const isMargZone = /المرج|مرج|al marj|el marg/i.test(combinedArea);
  const isCairoOrGiza = /القاهرة|الجيزة|cairo|giza/i.test(city);

  const threshold = Number(settings.free_shipping_threshold || 0);
  if (threshold > 0 && subtotal >= threshold && (isCairoOrGiza || isQalagZone || isMargZone)) {
    return { fee: 0, label: "شحن مجاني" };
  }

  if (isQalagZone) {
    return {
      fee: Number(settings.shipping_qalag_fee ?? 20),
      label: "رسوم الشحن (القلج / الخانكة / الجبل)",
    };
  }

  if (isMargZone) {
    return {
      fee: Number(settings.shipping_marg_fee ?? 40),
      label: "رسوم الشحن (المرج)",
    };
  }

  if (!city) {
    return { fee: 0, label: "رسوم الشحن" };
  }

  if (isCairoOrGiza) {
    return {
      fee: Number(settings.shipping_cairo_giza_fee ?? 100),
      label: `رسوم الشحن (${city})`,
    };
  }

  return {
    fee: Number(settings.shipping_other_gov_fee ?? 120),
    label: `رسوم الشحن (${city})`,
  };
}
