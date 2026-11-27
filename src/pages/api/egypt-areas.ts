import type { APIRoute } from "astro";
import rawCities from "../../data/egypt-cities.json";

export const prerender = false;

type CityRow = { id: string; governorate_id: string; city_name_ar: string };
const cityRows: CityRow[] =
  (Array.isArray(rawCities)
    ? (rawCities.find((x: any) => x.type === "table")?.data as CityRow[]) || []
    : []) as CityRow[];

export const GET: APIRoute = async ({ url }) => {
  const govId = (url.searchParams.get("govId") || "").trim();
  if (!govId) return Response.json({ cities: [] });

  const cities = cityRows
    .filter((c) => c.governorate_id === govId)
    .map((c) => c.city_name_ar);

  if (govId === "12") {
    for (const extra of ["القلج", "الجبل الأصفر"]) {
      if (!cities.includes(extra)) cities.unshift(extra);
    }
  }

  return Response.json(
    { cities },
    { headers: { "Cache-Control": "public, max-age=86400, s-maxage=86400" } }
  );
};
