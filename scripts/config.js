/**
 * config.js — Frontend configuration
 *
 * API_BASE được resolve theo thứ tự ưu tiên:
 *  1. <meta name="api-base" content="..."> trong HTML
 *     → Cách linh hoạt nhất: thay đổi URL khi deploy mà không cần rebuild
 *  2. Fallback về localhost cho local development
 *
 * Cách dùng khi deploy production:
 *   Thêm vào index.html và admin.html:
 *   <meta name="api-base" content="https://your-api.railway.app/api">
 */

function resolveApiBase() {
  const metaTag = document.querySelector('meta[name="api-base"]');
  if (metaTag?.content && metaTag.content !== "") {
    return metaTag.content.replace(/\/$/, ""); // trim trailing slash
  }
  return "http://localhost:5000/api";
}

/** Base URL cho tất cả API calls */
export const API_BASE = resolveApiBase();

/**
 * Nếu true, khi API lỗi sẽ tự động fallback về data/ JSON files.
 * Set false nếu bạn KHÔNG muốn hiển thị static data khi backend offline.
 */
export const ENABLE_STATIC_FALLBACK = true;

/** Timeout (ms) cho API requests — sau đó fallback về static data */
export const API_TIMEOUT_MS = 5000;
