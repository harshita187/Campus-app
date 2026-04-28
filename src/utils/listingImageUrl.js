import { SOCKET_URL } from "../services/api";

/**
 * Turn a stored product image value into a full URL for <img src>.
 * Supports absolute URLs, `/uploads/...`, `uploads/...` (no leading slash), and bare filenames.
 */
export function resolveListingImageUrl(src) {
  if (!src || typeof src !== "string") return null;
  let t = src.trim().replace(/\\/g, "/");
  if (!t) return null;
  if (/^https?:\/\//i.test(t)) {
    // Avoid mixed-content blocks and flaky http CDNs
    if (/^http:\/\/(images\.unsplash\.com|plus\.unsplash\.com)/i.test(t)) {
      return `https://${t.slice("http://".length)}`;
    }
    return t;
  }
  if (t.startsWith("//")) return `https:${t}`;
  if (t.startsWith("/api/uploads/")) return `${SOCKET_URL}${t.replace(/^\/api/, "")}`;
  if (t.startsWith("/uploads/")) return `${SOCKET_URL}${t}`;
  if (t.startsWith("uploads/")) return `${SOCKET_URL}/${t}`;
  if (t.startsWith("/")) return `${SOCKET_URL}${t}`;
  return `${SOCKET_URL}/uploads/${t}`;
}

/**
 * If the first URL fails in the browser (e.g. blocked query / hotlink rules), try this once.
 */
export function alternateListingImageUrl(url) {
  if (!url || typeof url !== "string") return null;
  try {
    const u = new URL(url);
    if (!u.search) return null;
    const host = u.hostname.toLowerCase();
    if (
      host.includes("unsplash.com") ||
      host.includes("pexels.com") ||
      host === "images.pexels.com"
    ) {
      u.search = "";
      return u.toString();
    }
  } catch {
    return null;
  }
  return null;
}
