/**
 * config.js — Frontend configuration
 */

function resolveApiBase() {
  const runtimeApiBase = window.__APP_CONFIG__?.apiBase;
  if (runtimeApiBase) {
    return String(runtimeApiBase).replace(/\/$/, "");
  }

  const metaTag = document.querySelector('meta[name="api-base"]');
  if (metaTag?.content) {
    return metaTag.content.replace(/\/$/, "");
  }

  return "http://localhost:5000/api";
}

export const API_BASE = resolveApiBase();
export const ENABLE_STATIC_FALLBACK = true;
export const API_TIMEOUT_MS = 5000;
