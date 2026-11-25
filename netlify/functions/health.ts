import type { Context } from "@netlify/functions";

/**
 * Simple healthcheck Netlify Function (/.netlify/functions/health).
 */
export default async (_req: Request, _context: Context) => {
  return new Response(
    JSON.stringify({
      ok: true,
      service: "elhusseiny-shop",
      timestamp: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: { "content-type": "application/json; charset=utf-8" },
    }
  );
};
