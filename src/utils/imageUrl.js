const API_BASE =
  import.meta.env.VITE_API_URL || "https://ninebyfourapi.herokuapp.com";

export function resolveImageUrl(url, fallback = null) {
  if (!url) return fallback;
  if (url.startsWith("http")) return url;
  return `${API_BASE}${url}`;
}
