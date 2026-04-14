import { apiUrl, requestJson } from "./http.js";

export async function trackEvent({ eventType, pagePath, projectSlug = null, metadata = null }) {
  try {
    await requestJson(apiUrl("/analytics"), {
      method: "POST",
      body: {
        event_type: eventType,
        page_path: pagePath || window.location.pathname,
        project_slug: projectSlug,
        metadata,
      },
      timeoutMs: 2500,
    });
  } catch (error) {
    console.warn("[analytics] track failed:", error.message);
  }
}

export function trackPageView(pagePath = window.location.pathname) {
  return trackEvent({ eventType: "page_view", pagePath });
}

export function trackProjectClick(projectSlug, metadata = null) {
  return trackEvent({
    eventType: "project_click",
    pagePath: window.location.pathname,
    projectSlug,
    metadata,
  });
}

export function trackProjectView(projectSlug) {
  return trackEvent({
    eventType: "project_view",
    pagePath: window.location.pathname,
    projectSlug,
  });
}
