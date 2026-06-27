import { API_BASE_URL } from "./api";

/**
 * Strips a hardcoded host/port from a media URL so it resolves relative to
 * whatever origin loaded the page. The Vite dev server then forwards `/api/*`
 * to the API server via its proxy; in production, a reverse-proxy serves both
 * frontend and API on the same origin.
 *
 * Without this, a URL like `http://localhost:4004/api/upload/media/abc/content`
 * stored in settings will 404 for anyone visiting from a different host (LAN
 * IP, deployed origin). After normalization the same URL becomes
 * `/api/upload/media/abc/content` which works from any host.
 *
 * Handles:
 *   • localhost / 127.0.0.1
 *   • RFC 1918 private LAN IPs (192.168.x.x, 10.x.x.x, 172.16–31.x.x)
 *   • Optional explicit port
 *
 * Leaves public-internet URLs (CDNs, picsum, signed S3 links) untouched.
 */
const LOCAL_HOST_RE =
  /^https?:\/\/(localhost|127\.0\.0\.1|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})(:\d+)?(?=\/)/i;

export function normalizeMediaUrl(url: string | null | undefined): string {
  if (!url) return "";
  const trimmed = url.trim();
  if (!trimmed) return "";
  return trimmed.replace(LOCAL_HOST_RE, "");
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// The old S3 API endpoint that was incorrectly used as R2_PUBLIC_URL.
// Any URL containing this needs to be rewritten to the new public R2 URL.
const OLD_S3_ENDPOINT = "a9c786e2839df3157985b75b9195a5dd.r2.cloudflarestorage.com";
const NEW_R2_PUBLIC = "https://pub-ab447c99540944219d48c799d9d76a8d.r2.dev";

/**
 * Converts an old S3 API endpoint URL to the new public R2 URL.
 * Example: https://...r2.cloudflarestorage.com/mindfulness-media/key
 *   → https://pub-...r2.dev/key
 */
function rewriteOldS3Url(url: string): string {
  if (!url.includes(OLD_S3_ENDPOINT)) return url;
  // Extract the key after the bucket name
  const parts = url.split("/");
  const key = parts.pop() || parts.pop() || "";
  if (!key) return url;
  return `${NEW_R2_PUBLIC}/${key}`;
}

/**
 * Resolves a stored media value (full URL, host-prefixed URL, bare UUID, or
 * relative path) into an absolute URL that can be used in <img src> or
 * <video src>.
 *
 * - Bare UUIDs are mapped to the API content endpoint.
 * - Relative paths are prefixed with API_BASE_URL.
 * - Localhost URLs are normalized to relative paths, then prefixed.
 * - Old S3 API endpoint URLs are rewritten to the new public R2 URL.
 * - Full public URLs (YouTube, R2, etc.) are left untouched.
 */
export function resolveMediaUrl(url: string | null | undefined): string {
  if (!url) return "";
  const v = url.trim();
  if (!v) return "";
  if (UUID_RE.test(v)) {
    return `${API_BASE_URL}/api/upload/media/${v}/content`;
  }
  const normalized = normalizeMediaUrl(v);
  if (normalized.startsWith("/")) {
    return `${API_BASE_URL}${normalized}`;
  }
  // Rewrite old S3 endpoint URLs to the new public R2 URL
  return rewriteOldS3Url(normalized);
}
