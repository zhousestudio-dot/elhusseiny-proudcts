import type { APIRoute } from "astro";
import { getActiveProducts } from "../lib/products";

export const GET: APIRoute = async () => {
  const siteUrl = (import.meta.env.PUBLIC_SITE_URL || "https://elhusseiny-products.vercel.app").replace(/\/$/, "");
  const products = await getActiveProducts();
  const now = new Date().toISOString().split("T")[0];

  const staticPages = [
    { url: `${siteUrl}/`, priority: "1.0", changefreq: "daily" },
    { url: `${siteUrl}/products`, priority: "0.9", changefreq: "daily" },
  ];

  const productPages = products.map((p) => ({
    url: `${siteUrl}/products/${encodeURIComponent(p.slug)}`,
    priority: "0.8",
    changefreq: "weekly",
  }));

  const urls = [...staticPages, ...productPages]
    .map(
      (entry) => `  <url>
    <loc>${entry.url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
};
