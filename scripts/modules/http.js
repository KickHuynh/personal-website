import { API_BASE, API_TIMEOUT_MS } from "../config.js";

export function apiUrl(path) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${normalizedPath}`;
}

export async function requestJson(url, options = {}) {
  const {
    method = "GET",
    body,
    headers = {},
    timeoutMs = API_TIMEOUT_MS,
  } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method,
      headers: {
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    const isJson = response.headers.get("content-type")?.includes("application/json");
    const result = isJson ? await response.json() : null;

    if (!response.ok || result?.success === false) {
      const error = new Error(result?.message || `Yeu cau that bai voi ma ${response.status}`);
      error.status = response.status;
      error.data = result;
      throw error;
    }

    return result;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Yeu cau bi timeout");
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
