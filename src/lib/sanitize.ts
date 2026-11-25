/** Escapes HTML special characters to prevent XSS in template strings. */
export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Allows only safe http(s) URLs or local /images/ paths for <img> src. */
export function safeImageUrl(url: unknown, fallback = "/images/prod-1.svg"): string {
  const raw = String(url ?? "").trim();
  if (raw.startsWith("/images/") || raw.startsWith("https://") || raw.startsWith("http://")) {
    return escapeHtml(raw);
  }
  return fallback;
}
