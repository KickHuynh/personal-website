/**
 * modules/projects.js
 * Load and render the projects section.
 *
 * Data strategy (priority order):
 *  1. Live API  → `${API_BASE}/projects`   (real-time, requires backend)
 *  2. Static    → `./data/projects.json`   (always available, deploy-safe)
 *
 * If the API call fails or times out, the module transparently falls back
 * to the local JSON file — the portfolio is NEVER blank.
 */

import { API_BASE, ENABLE_STATIC_FALLBACK, API_TIMEOUT_MS } from "../config.js";

const STATIC_DATA_URL = "./data/projects.json";

/* ------------------------------------------------------------------
   Data fetching
   ------------------------------------------------------------------ */

/**
 * Fetch from API with a timeout.
 * @returns {Promise<Array>}
 * @throws {Error} if fetch fails or response is not valid
 */
async function fetchFromApi() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE}/projects`, {
      signal: controller.signal,
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const result = await response.json();
    if (!result.success || !Array.isArray(result.data)) {
      throw new Error("Invalid API response shape");
    }

    return result.data;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Fetch from local static JSON file.
 * @returns {Promise<Array>}
 */
async function fetchFromStatic() {
  const response = await fetch(STATIC_DATA_URL);
  if (!response.ok) throw new Error(`Static data not found: ${response.status}`);
  return await response.json();
}

/**
 * Load projects: API first, static fallback if API fails.
 * @returns {Promise<Array>}
 */
async function loadProjectData() {
  try {
    return await fetchFromApi();
  } catch (apiError) {
    if (!ENABLE_STATIC_FALLBACK) throw apiError;
    console.warn("[projects] API unavailable, using static fallback:", apiError.message);
    return await fetchFromStatic();
  }
}

/* ------------------------------------------------------------------
   Rendering
   ------------------------------------------------------------------ */

/**
 * Render a single project card to HTML string.
 * @param {Object} project
 * @returns {string}
 */
function renderCard(project) {
  const githubLink = project.github_url
    ? `<a href="${project.github_url}" target="_blank" rel="noopener noreferrer" class="btn btn-outline">
         <i class="fa-brands fa-github" aria-hidden="true"></i> GitHub
       </a>`
    : "";

  const demoLink = project.demo_url
    ? `<a href="${project.demo_url}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
         <i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i> Demo
       </a>`
    : "";

  return `
    <article class="project-card">
      <h3 class="project-title">${project.title ?? ""}</h3>
      <p class="project-description">${project.description ?? ""}</p>
      ${project.tech_stack ? `<p class="project-tech">${project.tech_stack}</p>` : ""}
      ${githubLink || demoLink ? `<div class="project-links">${githubLink}${demoLink}</div>` : ""}
    </article>
  `;
}

/* ------------------------------------------------------------------
   Public API
   ------------------------------------------------------------------ */

/**
 * Initialize the projects section: fetch data and render cards.
 * @param {string} [containerId="projectsList"]
 */
export async function initProjects(containerId = "projectsList") {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `<p class="state-message">Đang tải dự án...</p>`;

  try {
    const projects = await loadProjectData();

    if (projects.length === 0) {
      container.innerHTML = `<p class="state-message">Chưa có dự án nào.</p>`;
      return;
    }

    container.innerHTML = projects.map(renderCard).join("");
  } catch (error) {
    console.error("[projects] Load error:", error);
    container.innerHTML = `<p class="state-message">Không thể tải dự án.</p>`;
  }
}
