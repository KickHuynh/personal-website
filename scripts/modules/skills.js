import { ENABLE_STATIC_FALLBACK } from "../config.js";
import { apiUrl, requestJson } from "./http.js";

const STATIC_DATA_URL = "./data/skills.json";

async function fetchFromApi() {
  const result = await requestJson(apiUrl("/skills"));
  if (!Array.isArray(result?.data)) {
    throw new Error("Invalid API response shape");
  }
  return result.data;
}

async function fetchFromStatic() {
  const response = await fetch(STATIC_DATA_URL);
  if (!response.ok) throw new Error(`Static data not found: ${response.status}`);
  return response.json();
}

async function loadSkillData() {
  try {
    return await fetchFromApi();
  } catch (apiError) {
    if (!ENABLE_STATIC_FALLBACK) throw apiError;
    console.warn("[skills] API unavailable, using static fallback:", apiError.message);
    return fetchFromStatic();
  }
}

function groupByCategory(skills) {
  return skills.reduce((groups, skill) => {
    const key = skill.category?.trim() || "Khac";
    if (!groups[key]) groups[key] = [];
    groups[key].push(skill);
    return groups;
  }, {});
}

function renderSkillCard(skill) {
  return `
    <article class="skill-card">
      <h4 class="skill-name">${skill.name ?? ""}</h4>
      ${skill.level ? `<p class="skill-level">${skill.level}</p>` : ""}
    </article>
  `;
}

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

export async function initSkills(containerId = "skillsList") {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '<p class="state-message">Dang tai ky nang...</p>';

  try {
    const skills = await loadSkillData();

    if (skills.length === 0) {
      container.innerHTML = '<p class="state-message">Chua co ky nang nao.</p>';
      return;
    }

    const grouped = groupByCategory(skills);
    container.innerHTML = Object.entries(grouped)
      .map(([category, items]) => renderCategoryGroup(category, items))
      .join("");
  } catch (error) {
    console.error("[skills] Load error:", error);
    container.innerHTML = '<p class="state-message">Khong the tai ky nang.</p>';
  }
}
