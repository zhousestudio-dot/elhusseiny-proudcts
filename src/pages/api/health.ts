import type { APIRoute } from "astro";

export const prerender = false;

/**
 * Simple healthcheck endpoint (GET /api/health).
 */
export const GET: APIRoute = async () => {
  return Response.json({
    ok: true,
    service: "elhusseiny-shop",
    timestamp: new Date().toISOString(),
  });
};
