/**
 * modules/skills.js
 * Load and render the skills section, grouped by category.
 *
 * Data strategy (same as projects.js):
 *  1. Live API  → `${API_BASE}/skills`
 *  2. Static    → `./data/skills.json`
 */

import { API_BASE, ENABLE_STATIC_FALLBACK, API_TIMEOUT_MS } from "../config.js";

const STATIC_DATA_URL = "./data/skills.json";

/* ------------------------------------------------------------------
   Data fetching
   ------------------------------------------------------------------ */

async function fetchFromApi() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE}/skills`, {
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

async function fetchFromStatic() {
  const response = await fetch(STATIC_DATA_URL);
  if (!response.ok) throw new Error(`Static data not found: ${response.status}`);
  return await response.json();
}

async function loadSkillData() {
  try {
    return await fetchFromApi();
  } catch (apiError) {
    if (!ENABLE_STATIC_FALLBACK) throw apiError;
    console.warn("[skills] API unavailable, using static fallback:", apiError.message);
    return await fetchFromStatic();
  }
}

/* ------------------------------------------------------------------
   Grouping
   ------------------------------------------------------------------ */

/**
 * Group flat skills array by their category.
 * Skills without a category go into "Khác".
 * @param {Array} skills
 * @returns {Object} { [category]: skill[] }
 */
function groupByCategory(skills) {
  return skills.reduce((groups, skill) => {
    const key = skill.category?.trim() || "Khác";
    if (!groups[key]) groups[key] = [];
    groups[key].push(skill);
    return groups;
  }, {});
}

/* ------------------------------------------------------------------
   Rendering
   ------------------------------------------------------------------ */

/**
 * Render a single skill card.
 * @param {Object} skill
 * @returns {string}
 */
function renderSkillCard(skill) {
  return `
    <article class="skill-card">
      <h4 class="skill-name">${skill.name ?? ""}</h4>
      ${skill.level ? `<p class="skill-level">${skill.level}</p>` : ""}
    </article>
  `;
}

/**
 * Render a category group (heading + cards grid).
 * @param {string} category
 * @param {Array} skills
 * @returns {string}
 */
function renderCategoryGroup(category, skills) {
  return `
    <div class="skill-group">
      <h3 class="skill-group__title">${category}</h3>
      <div class="skill-group__grid">
        ${skills.map(renderSkillCard).join("")}
      </div>
    </div>
  `;
}

/* ------------------------------------------------------------------
   Public API
   ------------------------------------------------------------------ */

/**
 * Initialize the skills section: fetch, group by category, and render.
 * @param {string} [containerId="skillsList"]
 */
export async function initSkills(containerId = "skillsList") {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `<p class="state-message">Đang tải kỹ năng...</p>`;

  try {
    const skills = await loadSkillData();

    if (skills.length === 0) {
      container.innerHTML = `<p class="state-message">Chưa có kỹ năng nào.</p>`;
      return;
    }

    const grouped = groupByCategory(skills);
    container.innerHTML = Object.entries(grouped)
      .map(([category, items]) => renderCategoryGroup(category, items))
      .join("");
  } catch (error) {
    console.error("[skills] Load error:", error);
    container.innerHTML = `<p class="state-message">Không thể tải kỹ năng.</p>`;
  }
}
