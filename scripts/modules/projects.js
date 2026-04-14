import { trackProjectClick } from "./analytics.js";
import { escapeHtml, renderTechChips } from "./html.js";
import { loadProjectsData } from "./projects-data.js";

function renderProjectCard(project) {
  const projectImage = project.image_url
    ? `
        <div class="project-card__media">
          <img src="${escapeHtml(project.image_url)}" alt="${escapeHtml(project.title)}" loading="lazy" />
        </div>
      `
    : `
        <div class="project-card__media project-card__media--placeholder" aria-hidden="true">
          <span>${project.featured ? "Featured" : "Case Study"}</span>
        </div>
      `;

  const metaItems = [project.role, project.duration, project.team_size]
    .filter(Boolean)
    .map((item) => `<span>${escapeHtml(item)}</span>`)
    .join("");

  return `
    <article class="project-card">
      ${projectImage}
      <div class="project-card__content">
        <div class="project-card__top">
          ${project.featured ? '<span class="project-pill">Featured</span>' : ""}
          <h3 class="project-title">${escapeHtml(project.title)}</h3>
          <p class="project-description">${escapeHtml(project.short_description)}</p>
        </div>

        ${metaItems ? `<div class="project-meta">${metaItems}</div>` : ""}
        ${renderTechChips(project.tech_stack)}

        <div class="project-links">
          <a href="project.html?slug=${encodeURIComponent(project.slug)}" class="btn btn-primary" data-track-project-click="${escapeHtml(project.slug)}">
            Doc case study
          </a>
          ${
            project.github_url
              ? `<a href="${escapeHtml(project.github_url)}" target="_blank" rel="noopener noreferrer" class="btn btn-outline">
                  <i class="fa-brands fa-github" aria-hidden="true"></i> GitHub
                </a>`
              : ""
          }
          ${
            project.demo_url
              ? `<a href="${escapeHtml(project.demo_url)}" target="_blank" rel="noopener noreferrer" class="btn btn-outline">
                  <i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i> Demo
                </a>`
              : ""
          }
        </div>
      </div>
    </article>
  `;
}

export async function initProjects(containerId = "projectsList") {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '<p class="state-message">Dang tai case study...</p>';

  try {
    const projects = await loadProjectsData();

    if (!projects.length) {
      container.innerHTML = '<p class="state-message">Chua co case study nao.</p>';
      return;
    }

    container.innerHTML = projects.map(renderProjectCard).join("");
    container.addEventListener("click", (event) => {
      const link = event.target.closest("[data-track-project-click]");
      if (!link) return;
      trackProjectClick(link.dataset.trackProjectClick);
    });
  } catch (error) {
    console.error("[projects] Load error:", error);
    container.innerHTML = '<p class="state-message">Khong the tai danh sach case study.</p>';
  }
}
