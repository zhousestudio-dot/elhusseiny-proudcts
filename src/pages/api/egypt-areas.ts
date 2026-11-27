import type { APIRoute } from "astro";
import { getDistricts, getLocations } from "egypt-geo-navigator";

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const govId = (url.searchParams.get("govId") || "").trim();
  if (!govId) {
    return Response.json({ districts: [] });
  }

  try {
    const districts = getDistricts(govId) || [];
    const result = await Promise.all(
      districts.map(async (d) => {
        const locs = (await getLocations(govId, d.id)) || [];
        const seen = new Set<string>([d.nameAr]);
        const places: string[] = [];
        for (const l of locs) {
          if (l.nameAr && !seen.has(l.nameAr)) {
            seen.add(l.nameAr);
            places.push(l.nameAr);
          }
        }
        return {
          id: d.id,
          nameAr: d.nameAr,
          places,
        };
      })
    );

    return Response.json(
      { districts: result },
      {
        headers: {
          "Cache-Control": "public, max-age=86400, s-maxage=86400",
        },
      }
    );
  } catch (err) {
    console.error("[egypt-areas] error:", err);
    return Response.json({ districts: [] }, { status: 500 });
  }
};
