import { trackProjectView } from "./analytics.js";
import { escapeHtml, renderParagraphs, renderTechChips, renderTextList } from "./html.js";
import { loadProjectBySlug } from "./projects-data.js";

function renderFact(label, value) {
  if (!value) return "";
  return `
    <div class="project-fact">
      <span class="project-fact__label">${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
    </div>
  `;
}

function renderLinkButton(url, label, variant = "outline", iconClass = "") {
  if (!url) return "";
  const icon = iconClass ? `<i class="${iconClass}" aria-hidden="true"></i>` : "";
  return `
    <a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" class="btn btn-${variant}">
      ${icon}${label}
    </a>
  `;
}

function renderSection(title, content) {
  if (!content) return "";
  return `
    <section class="project-section card reveal">
      <div class="project-section__heading">
        <p class="section-tag">${escapeHtml(title)}</p>
      </div>
      <div class="project-section__body">${content}</div>
    </section>
  `;
}

function renderGallery(images) {
  if (!images.length) return "";
  return `
    <div class="project-gallery">
      ${images.map((imageUrl, index) => `
        <figure class="project-gallery__item">
          <img src="${escapeHtml(imageUrl)}" alt="Screenshot ${index + 1}" loading="lazy" />
        </figure>
      `).join("")}
    </div>
  `;
}

function renderProjectDetail(project) {
  const heroImage = project.image_url
    ? `<div class="project-hero__media card"><img src="${escapeHtml(project.image_url)}" alt="${escapeHtml(project.title)}" loading="lazy" /></div>`
    : `<div class="project-hero__media card project-hero__media--placeholder" aria-hidden="true"><span>Case Study</span></div>`;

  return `
    <div class="project-breadcrumbs reveal">
      <a href="index.html">Trang chu</a>
      <span>/</span>
      <a href="index.html#projects">Du an</a>
      <span>/</span>
      <strong>${escapeHtml(project.title)}</strong>
    </div>

    <section class="project-hero-detail reveal">
      <div class="project-hero-detail__content">
        <p class="section-tag">${project.featured ? "Featured Case Study" : "Case Study"}</p>
        <h1>${escapeHtml(project.title)}</h1>
        <p class="project-hero-detail__summary">${escapeHtml(project.short_description)}</p>
        ${renderTechChips(project.tech_stack)}
        <div class="project-link-group">
          <a href="index.html#projects" class="btn btn-outline">Quay lai danh sach</a>
          ${renderLinkButton(project.demo_url, "Xem Demo", "primary", "fa-solid fa-arrow-up-right-from-square")}
          ${renderLinkButton(project.github_url, "Xem GitHub", "outline", "fa-brands fa-github")}
        </div>
      </div>
      ${heroImage}
    </section>

    <section class="project-facts-grid reveal">
      ${renderFact("Vai tro", project.role)}
      ${renderFact("Quy mo", project.team_size)}
      ${renderFact("Thoi gian", project.duration)}
      ${renderFact("Trang thai", project.status === "draft" ? "Draft" : "Published")}
    </section>

    <div class="project-detail-grid">
      ${renderSection("Overview", renderParagraphs(project.case_study_summary || project.short_description, "project-copy"))}
      ${renderSection("Problem", renderParagraphs(project.problem, "project-copy"))}
      ${renderSection("Solution", renderParagraphs(project.solution, "project-copy"))}
      ${renderSection("Impact", renderParagraphs(project.impact, "project-copy"))}
      ${renderSection("Architecture", renderParagraphs(project.architecture, "project-copy"))}
      ${renderSection("Challenges", renderTextList(project.challenges, "detail-list"))}
      ${renderSection("Learnings", renderTextList(project.learnings, "detail-list"))}
      ${renderSection("Gallery", renderGallery(project.gallery))}
    </div>
  `;
}

function renderState(message) {
  return `<div class="card detail-state">${escapeHtml(message)}</div>`;
}

export async function initProjectDetailPage(rootId = "projectDetailRoot") {
  const root = document.getElementById(rootId);
  if (!root) return;

  const slug = new URLSearchParams(window.location.search).get("slug")?.trim();
  if (!slug) {
    root.innerHTML = renderState("Thieu slug du an. Hay quay lai trang portfolio de chon case study.");
    return;
  }

  root.innerHTML = renderState("Dang tai case study...");

  try {
    const project = await loadProjectBySlug(slug);
    document.title = `${project.title} | Case Study`;

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", project.short_description);
    }

    root.innerHTML = renderProjectDetail(project);
    trackProjectView(project.slug);
  } catch (error) {
    console.error("[project-detail] Load error:", error);
    root.innerHTML = renderState("Khong the tai case study nay vao luc nay.");
  }
}
