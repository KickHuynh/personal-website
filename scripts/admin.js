import {
  escapeHtml,
  renderParagraphs,
  renderTechChips,
  renderTextList,
} from "./modules/html.js";
import { apiUrl, requestJson } from "./modules/http.js";

const state = {
  dashboardCounts: {
    projects: 0,
    skills: 0,
    messages: 0,
    unreadMessages: 0,
    pageViews: 0,
    projectViews: 0,
    projectClicks: 0,
    contactSubmissions: 0,
  },
  projects: [],
  skills: [],
  messages: [],
  analytics: null,
  previewVisible: true,
  slugDirty: false,
};

function getToken() {
  return localStorage.getItem("admin_token");
}

function getAdminUser() {
  try {
    const raw = localStorage.getItem("admin_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    localStorage.removeItem("admin_user");
    return null;
  }
}

function saveAuth(token, user) {
  localStorage.setItem("admin_token", token);
  localStorage.setItem("admin_user", JSON.stringify(user));
}

function clearAuth() {
  localStorage.removeItem("admin_token");
  localStorage.removeItem("admin_user");
}

function authHeaders() {
  return { Authorization: `Bearer ${getToken()}` };
}

function parseLines(value) {
  return String(value ?? "")
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function slugify(value) {
  return String(value ?? "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function formatDateTime(value) {
  if (!value) return "Khong ro";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Khong ro";
  return date.toLocaleString("vi-VN");
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Khong the doc file da chon"));
    reader.readAsDataURL(file);
  });
}

function setStatus(el, message, type = "info") {
  if (!el) return;
  el.textContent = message;
  el.className = `admin-status is-${type}`;
}

function clearStatus(el) {
  if (!el) return;
  el.textContent = "";
  el.className = "admin-status";
}

function updateDashboardCounts(refs, nextCounts = {}) {
  state.dashboardCounts = { ...state.dashboardCounts, ...nextCounts };
  refs.projectsCount.textContent = state.dashboardCounts.projects;
  refs.skillsCount.textContent = state.dashboardCounts.skills;
  refs.messagesCount.textContent = state.dashboardCounts.messages;
  refs.unreadMessagesCount.textContent = state.dashboardCounts.unreadMessages;
  refs.pageViewsCount.textContent = state.dashboardCounts.pageViews;
  refs.projectViewsCount.textContent = state.dashboardCounts.projectViews;
  refs.projectClicksCount.textContent = state.dashboardCounts.projectClicks;
  refs.contactSubmissionsCount.textContent = state.dashboardCounts.contactSubmissions;
}

function showDashboard(refs) {
  const user = getAdminUser();
  refs.loginSection.classList.add("hidden");
  refs.dashboardSection.classList.remove("hidden");
  refs.analyticsSection.classList.remove("hidden");
  refs.projectSection.classList.remove("hidden");
  refs.skillSection.classList.remove("hidden");
  refs.messageSection.classList.remove("hidden");

  if (user) {
    refs.adminWelcome.textContent = `Xin chao, ${user.full_name} (${user.role})`;
  }
}

function showLogin(refs) {
  refs.loginSection.classList.remove("hidden");
  refs.dashboardSection.classList.add("hidden");
  refs.analyticsSection.classList.add("hidden");
  refs.projectSection.classList.add("hidden");
  refs.skillSection.classList.add("hidden");
  refs.messageSection.classList.add("hidden");
}

function handleAuthError(error, refs, statusEl) {
  if (error.status === 401 || error.status === 403) {
    clearAuth();
    showLogin(refs);
    setStatus(refs.loginMessage, "Phien dang nhap da het han hoac ban khong con quyen truy cap.", "error");
    if (statusEl && statusEl !== refs.loginMessage) {
      setStatus(statusEl, "Ban can dang nhap lai de tiep tuc.", "error");
    }
    return true;
  }
  return false;
}

function getProjectPayload(refs) {
  return {
    title: refs.projectTitle.value.trim(),
    slug: refs.projectSlug.value.trim() || slugify(refs.projectTitle.value),
    short_description: refs.projectShortDescription.value.trim(),
    case_study_summary: refs.projectCaseStudySummary.value.trim(),
    role: refs.projectRole.value.trim(),
    team_size: refs.projectTeamSize.value.trim(),
    duration: refs.projectDuration.value.trim(),
    problem: refs.projectProblem.value.trim(),
    solution: refs.projectSolution.value.trim(),
    impact: refs.projectImpact.value.trim(),
    architecture: refs.projectArchitecture.value.trim(),
    tech_stack: refs.projectTechStack.value.trim(),
    github_url: refs.projectGithubUrl.value.trim(),
    demo_url: refs.projectDemoUrl.value.trim(),
    image_url: refs.projectImageUrl.value.trim(),
    gallery: parseLines(refs.projectGallery.value),
    challenges: parseLines(refs.projectChallenges.value),
    learnings: parseLines(refs.projectLearnings.value),
    featured: refs.projectFeatured.checked,
    status: refs.projectStatus.value,
    sort_order: Number(refs.projectSortOrder.value || 0),
  };
}

function updateImagePreview(refs, imageUrl = refs.projectImageUrl.value.trim()) {
  if (!imageUrl) {
    refs.projectImagePreview.innerHTML = '<p class="admin-empty">Chua co hero image.</p>';
    return;
  }

  refs.projectImagePreview.innerHTML = `
    <figure class="admin-inline-preview__image card">
      <img src="${escapeHtml(imageUrl)}" alt="Project hero preview" loading="lazy" />
    </figure>
  `;
}

function renderPreviewCard(project) {
  const media = project.image_url
    ? `<div class="project-card__media"><img src="${escapeHtml(project.image_url)}" alt="${escapeHtml(project.title)}" loading="lazy" /></div>`
    : `<div class="project-card__media project-card__media--placeholder" aria-hidden="true"><span>${project.featured ? "Featured" : "Case Study"}</span></div>`;
  const meta = [project.role, project.duration, project.team_size].filter(Boolean).join(" • ");

  return `
    <article class="project-card admin-preview-card">
      ${media}
      <div class="project-card__content">
        <div class="project-card__top">
          ${project.featured ? '<span class="project-pill">Featured</span>' : ""}
          <h3 class="project-title">${escapeHtml(project.title || "Untitled project")}</h3>
          <p class="project-description">${escapeHtml(project.short_description || "Them mo ta ngan de preview homepage card.")}</p>
        </div>
        ${meta ? `<div class="project-meta"><span>${escapeHtml(meta)}</span></div>` : ""}
        ${renderTechChips(project.tech_stack)}
      </div>
    </article>
  `;
}
function renderPreviewDetail(project) {
  const facts = [
    project.role ? `<div class="project-fact"><span class="project-fact__label">Vai tro</span><strong>${escapeHtml(project.role)}</strong></div>` : "",
    project.team_size ? `<div class="project-fact"><span class="project-fact__label">Quy mo</span><strong>${escapeHtml(project.team_size)}</strong></div>` : "",
    project.duration ? `<div class="project-fact"><span class="project-fact__label">Thoi gian</span><strong>${escapeHtml(project.duration)}</strong></div>` : "",
    `<div class="project-fact"><span class="project-fact__label">Trang thai</span><strong>${escapeHtml(project.status || "published")}</strong></div>`,
  ].join("");

  return `
    <div class="admin-preview-detail">
      <section class="project-hero-detail">
        <div class="project-hero-detail__content">
          <p class="section-tag">${project.featured ? "Featured Case Study" : "Case Study"}</p>
          <h1>${escapeHtml(project.title || "Untitled project")}</h1>
          <p class="project-hero-detail__summary">${escapeHtml(project.short_description || "Them mo ta ngan de xem preview detail page.")}</p>
          ${renderTechChips(project.tech_stack)}
        </div>
      </section>
      <section class="project-facts-grid">${facts}</section>
      ${project.case_study_summary ? `<section class="project-section card"><div class="project-section__body">${renderParagraphs(project.case_study_summary, "project-copy")}</div></section>` : ""}
      ${project.problem ? `<section class="project-section card"><div class="project-section__body">${renderParagraphs(project.problem, "project-copy")}</div></section>` : ""}
      ${project.solution ? `<section class="project-section card"><div class="project-section__body">${renderParagraphs(project.solution, "project-copy")}</div></section>` : ""}
      ${project.challenges.length ? `<section class="project-section card"><div class="project-section__body">${renderTextList(project.challenges, "detail-list")}</div></section>` : ""}
    </div>
  `;
}

function refreshProjectPreview(refs) {
  const project = getProjectPayload(refs);
  refs.projectCardPreview.innerHTML = renderPreviewCard(project);
  refs.projectDetailPreview.innerHTML = renderPreviewDetail(project);
  updateImagePreview(refs, project.image_url);
}

function resetProjectForm(refs) {
  refs.projectForm.reset();
  refs.projectId.value = "";
  refs.projectFormHeading.textContent = "Tao Case Study";
  refs.projectSubmitBtn.textContent = "Luu Case Study";
  refs.projectCancelBtn.classList.add("hidden");
  refs.projectStatus.value = "published";
  refs.projectSortOrder.value = "0";
  refs.projectFeatured.checked = false;
  refs.projectImageFile.value = "";
  state.slugDirty = false;
  clearStatus(refs.projectImageUploadStatus);
  clearStatus(refs.projectMessage);
  refreshProjectPreview(refs);
}

function fillProjectForm(project, refs) {
  refs.projectId.value = project.id;
  refs.projectTitle.value = project.title || "";
  refs.projectSlug.value = project.slug || "";
  refs.projectShortDescription.value = project.short_description || "";
  refs.projectCaseStudySummary.value = project.case_study_summary || "";
  refs.projectRole.value = project.role || "";
  refs.projectTeamSize.value = project.team_size || "";
  refs.projectDuration.value = project.duration || "";
  refs.projectProblem.value = project.problem || "";
  refs.projectSolution.value = project.solution || "";
  refs.projectImpact.value = project.impact || "";
  refs.projectArchitecture.value = project.architecture || "";
  refs.projectTechStack.value = project.tech_stack || "";
  refs.projectGithubUrl.value = project.github_url || "";
  refs.projectDemoUrl.value = project.demo_url || "";
  refs.projectImageUrl.value = project.image_url || "";
  refs.projectGallery.value = (project.gallery || []).join("\n");
  refs.projectChallenges.value = (project.challenges || []).join("\n");
  refs.projectLearnings.value = (project.learnings || []).join("\n");
  refs.projectFeatured.checked = Boolean(project.featured);
  refs.projectStatus.value = project.status || "published";
  refs.projectSortOrder.value = String(project.sort_order ?? 0);
  refs.projectFormHeading.textContent = `Chinh sua: ${project.title}`;
  refs.projectSubmitBtn.textContent = "Cap nhat Case Study";
  refs.projectCancelBtn.classList.remove("hidden");
  state.slugDirty = Boolean(project.slug);
  clearStatus(refs.projectImageUploadStatus);
  clearStatus(refs.projectMessage);
  refreshProjectPreview(refs);
  refs.projectSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

function getSkillPayload(refs) {
  return {
    name: refs.skillName.value.trim(),
    level: refs.skillLevel.value.trim(),
    category: refs.skillCategory.value.trim(),
  };
}

function resetSkillForm(refs) {
  refs.skillForm.reset();
  refs.skillId.value = "";
  refs.skillFormHeading.textContent = "Them Skill";
  refs.skillSubmitBtn.textContent = "Luu Skill";
  refs.skillCancelBtn.classList.add("hidden");
  clearStatus(refs.skillMessage);
}

function fillSkillForm(skill, refs) {
  refs.skillId.value = skill.id;
  refs.skillName.value = skill.name || "";
  refs.skillLevel.value = skill.level || "";
  refs.skillCategory.value = skill.category || "";
  refs.skillFormHeading.textContent = `Chinh sua: ${skill.name}`;
  refs.skillSubmitBtn.textContent = "Cap nhat Skill";
  refs.skillCancelBtn.classList.remove("hidden");
  clearStatus(refs.skillMessage);
  refs.skillSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderProjectItem(project) {
  const meta = [project.role, project.duration, project.team_size].filter(Boolean).join(" • ");
  const badges = [
    `<span class="admin-badge admin-badge--${project.status === "draft" ? "muted" : "success"}">${escapeHtml(project.status)}</span>`,
    project.featured ? '<span class="admin-badge admin-badge--info">featured</span>' : "",
  ].filter(Boolean).join("");

  return `
    <article class="admin-item" data-id="${project.id}">
      <div class="admin-item__header">
        <div>
          <h3>${escapeHtml(project.title)}</h3>
          <p class="admin-meta">/${escapeHtml(project.slug)}</p>
        </div>
        <div class="admin-item-badges">${badges}</div>
      </div>
      <p class="admin-item__excerpt">${escapeHtml(project.short_description || "Chua co mo ta ngan.")}</p>
      ${meta ? `<p class="admin-meta">${escapeHtml(meta)}</p>` : ""}
      <div class="admin-item-actions">
        <a class="btn btn-outline" href="project.html?slug=${encodeURIComponent(project.slug)}" target="_blank" rel="noopener noreferrer">Xem</a>
        <button class="btn btn-outline" type="button" data-action="edit-project" data-id="${project.id}">Sua</button>
        <button class="btn btn-outline" type="button" data-action="toggle-project-status" data-id="${project.id}">${project.status === "draft" ? "Publish" : "Move to draft"}</button>
        <button class="btn btn-outline" type="button" data-action="toggle-project-featured" data-id="${project.id}">${project.featured ? "Bo featured" : "Set featured"}</button>
        <button class="btn btn-outline" type="button" data-action="delete-project" data-id="${project.id}">Xoa</button>
      </div>
    </article>
  `;
}

function renderSkillItem(skill) {
  const meta = [skill.level, skill.category].filter(Boolean).join(" • ");

  return `
    <article class="admin-item" data-id="${skill.id}">
      <h3>${escapeHtml(skill.name)}</h3>
      ${meta ? `<p class="admin-meta">${escapeHtml(meta)}</p>` : ""}
      <div class="admin-item-actions">
        <button class="btn btn-outline" type="button" data-action="edit-skill" data-id="${skill.id}">Sua</button>
        <button class="btn btn-outline" type="button" data-action="delete-skill" data-id="${skill.id}">Xoa</button>
      </div>
    </article>
  `;
}

function renderMessageItem(message) {
  const badge = message.is_read
    ? '<span class="admin-badge admin-badge--muted">read</span>'
    : '<span class="admin-badge admin-badge--info">unread</span>';

  return `
    <article class="admin-item ${message.is_read ? "" : "admin-item--unread"}" data-id="${message.id}">
      <div class="admin-item__header">
        <div>
          <h3>${escapeHtml(message.subject || "Khong co chu de")}</h3>
          <p class="admin-meta"><strong>${escapeHtml(message.name || "")}</strong> • ${escapeHtml(message.email || "")}</p>
        </div>
        <div class="admin-item-badges">${badge}</div>
      </div>
      <p class="admin-meta">Gui luc: ${escapeHtml(formatDateTime(message.created_at))}</p>
      ${message.read_at ? `<p class="admin-meta">Da doc luc: ${escapeHtml(formatDateTime(message.read_at))}</p>` : ""}
      <p class="admin-item__excerpt">${escapeHtml(message.message || "")}</p>
      <div class="admin-item-actions">
        <button class="btn btn-outline" type="button" data-action="toggle-message-read" data-id="${message.id}">${message.is_read ? "Danh dau chua doc" : "Danh dau da doc"}</button>
        <button class="btn btn-outline" type="button" data-action="delete-message" data-id="${message.id}">Xoa</button>
      </div>
    </article>
  `;
}
function renderAnalyticsTopProjects(items) {
  if (!items.length) {
    return '<p class="admin-empty">Chua co du lieu project views.</p>';
  }

  return items.map((item) => `
    <article class="admin-mini-card">
      <strong>${escapeHtml(item.project_slug || "unknown-project")}</strong>
      <p class="admin-meta">${escapeHtml(String(item.views || 0))} views</p>
    </article>
  `).join("");
}

function renderAnalyticsEvents(items) {
  if (!items.length) {
    return '<p class="admin-empty">Chua co recent events.</p>';
  }

  return items.map((item) => `
    <article class="admin-mini-card">
      <strong>${escapeHtml(item.event_type)}</strong>
      <p class="admin-meta">${escapeHtml(item.project_slug || item.page_path || "/")}</p>
      <p class="admin-meta">${escapeHtml(formatDateTime(item.created_at))}</p>
    </article>
  `).join("");
}

async function loadProjects(refs, { silent = false } = {}) {
  try {
    if (!silent) setStatus(refs.projectListStatus, "Dang tai project...", "info");
    const result = await requestJson(apiUrl("/projects/admin/all"), { headers: authHeaders() });
    state.projects = Array.isArray(result.data) ? result.data : [];
    refs.adminProjectsList.innerHTML = state.projects.length
      ? state.projects.map(renderProjectItem).join("")
      : '<p class="admin-empty">Chua co project nao.</p>';
    updateDashboardCounts(refs, { projects: state.projects.length });
    setStatus(refs.projectListStatus, `Da tai ${state.projects.length} project.`, "success");
  } catch (error) {
    if (handleAuthError(error, refs, refs.projectListStatus)) return;
    refs.adminProjectsList.innerHTML = '<p class="admin-empty">Khong the tai danh sach project.</p>';
    setStatus(refs.projectListStatus, error.message || "Khong the tai project.", "error");
  }
}

async function loadSkills(refs, { silent = false } = {}) {
  try {
    if (!silent) setStatus(refs.skillListStatus, "Dang tai skill...", "info");
    const result = await requestJson(apiUrl("/skills"));
    state.skills = Array.isArray(result.data) ? result.data : [];
    refs.adminSkillsList.innerHTML = state.skills.length
      ? state.skills.map(renderSkillItem).join("")
      : '<p class="admin-empty">Chua co skill nao.</p>';
    updateDashboardCounts(refs, { skills: state.skills.length });
    setStatus(refs.skillListStatus, `Da tai ${state.skills.length} skill.`, "success");
  } catch (error) {
    refs.adminSkillsList.innerHTML = '<p class="admin-empty">Khong the tai danh sach skill.</p>';
    setStatus(refs.skillListStatus, error.message || "Khong the tai skill.", "error");
  }
}

async function loadMessages(refs, { silent = false } = {}) {
  try {
    if (!silent) setStatus(refs.messageStatus, "Dang tai inbox...", "info");
    const result = await requestJson(apiUrl("/messages"), { headers: authHeaders() });
    state.messages = Array.isArray(result.data) ? result.data : [];
    const unreadCount = Number(result.meta?.unread_count || 0);
    refs.messagesList.innerHTML = state.messages.length
      ? state.messages.map(renderMessageItem).join("")
      : '<p class="admin-empty">Inbox hien dang trong.</p>';
    updateDashboardCounts(refs, {
      messages: state.messages.length,
      unreadMessages: unreadCount,
    });
    setStatus(refs.messageStatus, `Da tai ${state.messages.length} message.`, "success");
  } catch (error) {
    if (handleAuthError(error, refs, refs.messageStatus)) return;
    refs.messagesList.innerHTML = '<p class="admin-empty">Khong the tai inbox.</p>';
    setStatus(refs.messageStatus, error.message || "Khong the tai message.", "error");
  }
}

async function loadAnalytics(refs) {
  try {
    const result = await requestJson(apiUrl("/analytics/summary"), { headers: authHeaders() });
    state.analytics = result.data || {};
    refs.analyticsTopProjects.innerHTML = renderAnalyticsTopProjects(state.analytics.top_projects || []);
    refs.analyticsRecentEvents.innerHTML = renderAnalyticsEvents(state.analytics.recent_events || []);
    updateDashboardCounts(refs, {
      pageViews: Number(state.analytics.totals?.page_views || 0),
      projectViews: Number(state.analytics.totals?.project_views || 0),
      projectClicks: Number(state.analytics.totals?.project_clicks || 0),
      contactSubmissions: Number(state.analytics.totals?.contact_submissions || 0),
    });
  } catch (error) {
    if (handleAuthError(error, refs, refs.loginMessage)) return;
    refs.analyticsTopProjects.innerHTML = '<p class="admin-empty">Khong the tai analytics.</p>';
    refs.analyticsRecentEvents.innerHTML = '<p class="admin-empty">Khong the tai recent events.</p>';
  }
}

async function loadAllDashboardData(refs) {
  await Promise.allSettled([
    loadProjects(refs, { silent: true }),
    loadSkills(refs, { silent: true }),
    loadMessages(refs, { silent: true }),
    loadAnalytics(refs),
  ]);
}

async function handleLogin(event, refs) {
  event.preventDefault();
  const email = refs.loginEmail.value.trim();
  const password = refs.loginPassword.value.trim();
  setStatus(refs.loginMessage, "Dang dang nhap...", "info");

  try {
    const result = await requestJson(apiUrl("/auth/login"), {
      method: "POST",
      body: { email, password },
    });

    saveAuth(result.data.token, result.data.user);
    refs.loginForm.reset();
    showDashboard(refs);
    setStatus(refs.loginMessage, "Dang nhap thanh cong", "success");
    await loadAllDashboardData(refs);
  } catch (error) {
    setStatus(refs.loginMessage, error.message || "Dang nhap that bai", "error");
  }
}

function handleLogout(refs) {
  clearAuth();
  showLogin(refs);
  resetProjectForm(refs);
  resetSkillForm(refs);
  updateDashboardCounts(refs, {
    projects: 0,
    skills: 0,
    messages: 0,
    unreadMessages: 0,
    pageViews: 0,
    projectViews: 0,
    projectClicks: 0,
    contactSubmissions: 0,
  });
}

async function saveProject(event, refs) {
  event.preventDefault();
  const payload = getProjectPayload(refs);
  const projectId = refs.projectId.value;

  if (!payload.title || !payload.short_description || !payload.slug) {
    setStatus(refs.projectMessage, "Title, slug va mo ta ngan la bat buoc.", "error");
    return;
  }

  const isEditing = Boolean(projectId);
  setStatus(refs.projectMessage, isEditing ? "Dang cap nhat case study..." : "Dang tao case study...", "info");

  try {
    await requestJson(apiUrl(isEditing ? `/projects/${projectId}` : "/projects"), {
      method: isEditing ? "PUT" : "POST",
      headers: authHeaders(),
      body: payload,
    });

    setStatus(refs.projectMessage, isEditing ? "Cap nhat case study thanh cong" : "Tao case study thanh cong", "success");
    resetProjectForm(refs);
    await loadProjects(refs, { silent: true });
  } catch (error) {
    if (!handleAuthError(error, refs, refs.projectMessage)) {
      setStatus(refs.projectMessage, error.message || "Khong the luu case study", "error");
    }
  }
}
async function editProject(id, refs) {
  const project = state.projects.find((item) => String(item.id) === String(id));
  if (project) {
    fillProjectForm(project, refs);
    return;
  }

  try {
    const result = await requestJson(apiUrl(`/projects/${id}`), { headers: authHeaders() });
    fillProjectForm(result.data, refs);
  } catch (error) {
    if (!handleAuthError(error, refs, refs.projectMessage)) {
      setStatus(refs.projectMessage, error.message || "Khong the tai project de chinh sua", "error");
    }
  }
}

async function uploadProjectImage(refs) {
  const file = refs.projectImageFile.files?.[0];
  if (!file) {
    setStatus(refs.projectImageUploadStatus, "Hay chon mot file anh truoc khi upload.", "error");
    return;
  }

  if (file.size > 3 * 1024 * 1024) {
    setStatus(refs.projectImageUploadStatus, "Anh qua lon. Nen giu duoi 3MB.", "error");
    return;
  }

  try {
    setStatus(refs.projectImageUploadStatus, "Dang upload anh...", "info");
    const dataUrl = await readFileAsDataUrl(file);
    const result = await requestJson(apiUrl("/uploads/image"), {
      method: "POST",
      headers: authHeaders(),
      body: { data_url: dataUrl, filename: file.name },
    });
    refs.projectImageUrl.value = result.data.url || "";
    setStatus(refs.projectImageUploadStatus, "Upload anh thanh cong.", "success");
    refreshProjectPreview(refs);
  } catch (error) {
    if (!handleAuthError(error, refs, refs.projectImageUploadStatus)) {
      setStatus(refs.projectImageUploadStatus, error.message || "Khong the upload anh", "error");
    }
  }
}

async function deleteProject(id, refs) {
  const project = state.projects.find((item) => String(item.id) === String(id));
  if (!confirm(`Ban co chac muon xoa ${project?.title || "project"} khong?`)) return;

  try {
    await requestJson(apiUrl(`/projects/${id}`), {
      method: "DELETE",
      headers: authHeaders(),
    });
    await loadProjects(refs, { silent: true });
  } catch (error) {
    if (!handleAuthError(error, refs, refs.projectListStatus)) {
      setStatus(refs.projectListStatus, error.message || "Khong the xoa project", "error");
    }
  }
}

async function toggleProjectStatus(id, refs) {
  const project = state.projects.find((item) => String(item.id) === String(id));
  if (!project) return;

  try {
    await requestJson(apiUrl(`/projects/${id}/status`), {
      method: "PATCH",
      headers: authHeaders(),
      body: { status: project.status === "draft" ? "published" : "draft" },
    });
    await loadProjects(refs, { silent: true });
  } catch (error) {
    if (!handleAuthError(error, refs, refs.projectListStatus)) {
      setStatus(refs.projectListStatus, error.message || "Khong the doi trang thai project", "error");
    }
  }
}

async function toggleProjectFeatured(id, refs) {
  const project = state.projects.find((item) => String(item.id) === String(id));
  if (!project) return;

  try {
    await requestJson(apiUrl(`/projects/${id}/featured`), {
      method: "PATCH",
      headers: authHeaders(),
      body: { featured: !project.featured },
    });
    await loadProjects(refs, { silent: true });
  } catch (error) {
    if (!handleAuthError(error, refs, refs.projectListStatus)) {
      setStatus(refs.projectListStatus, error.message || "Khong the doi featured state", "error");
    }
  }
}

async function saveSkill(event, refs) {
  event.preventDefault();
  const payload = getSkillPayload(refs);
  const skillId = refs.skillId.value;

  if (!payload.name) {
    setStatus(refs.skillMessage, "Ten skill la bat buoc.", "error");
    return;
  }

  const isEditing = Boolean(skillId);
  setStatus(refs.skillMessage, isEditing ? "Dang cap nhat skill..." : "Dang them skill...", "info");

  try {
    await requestJson(apiUrl(isEditing ? `/skills/${skillId}` : "/skills"), {
      method: isEditing ? "PUT" : "POST",
      headers: authHeaders(),
      body: payload,
    });

    setStatus(refs.skillMessage, isEditing ? "Cap nhat skill thanh cong" : "Them skill thanh cong", "success");
    resetSkillForm(refs);
    await loadSkills(refs, { silent: true });
  } catch (error) {
    if (!handleAuthError(error, refs, refs.skillMessage)) {
      setStatus(refs.skillMessage, error.message || "Khong the luu skill", "error");
    }
  }
}

async function editSkill(id, refs) {
  const skill = state.skills.find((item) => String(item.id) === String(id));
  if (skill) {
    fillSkillForm(skill, refs);
    return;
  }

  try {
    const result = await requestJson(apiUrl(`/skills/${id}`), { headers: authHeaders() });
    fillSkillForm(result.data, refs);
  } catch (error) {
    if (!handleAuthError(error, refs, refs.skillMessage)) {
      setStatus(refs.skillMessage, error.message || "Khong the tai skill de chinh sua", "error");
    }
  }
}

async function deleteSkill(id, refs) {
  const skill = state.skills.find((item) => String(item.id) === String(id));
  if (!confirm(`Ban co chac muon xoa ${skill?.name || "skill"} khong?`)) return;

  try {
    await requestJson(apiUrl(`/skills/${id}`), {
      method: "DELETE",
      headers: authHeaders(),
    });
    await loadSkills(refs, { silent: true });
  } catch (error) {
    if (!handleAuthError(error, refs, refs.skillListStatus)) {
      setStatus(refs.skillListStatus, error.message || "Khong the xoa skill", "error");
    }
  }
}

async function toggleMessageRead(id, refs) {
  const message = state.messages.find((item) => String(item.id) === String(id));
  if (!message) return;

  try {
    await requestJson(apiUrl(`/messages/${id}/read`), {
      method: "PATCH",
      headers: authHeaders(),
      body: { is_read: !message.is_read },
    });
    await loadMessages(refs, { silent: true });
  } catch (error) {
    if (!handleAuthError(error, refs, refs.messageStatus)) {
      setStatus(refs.messageStatus, error.message || "Khong the cap nhat message", "error");
    }
  }
}

async function deleteMessage(id, refs) {
  const message = state.messages.find((item) => String(item.id) === String(id));
  if (!confirm(`Ban co chac muon xoa message tu ${message?.name || message?.email || "nguoi dung"} khong?`)) return;

  try {
    await requestJson(apiUrl(`/messages/${id}`), {
      method: "DELETE",
      headers: authHeaders(),
    });
    await loadMessages(refs, { silent: true });
  } catch (error) {
    if (!handleAuthError(error, refs, refs.messageStatus)) {
      setStatus(refs.messageStatus, error.message || "Khong the xoa message", "error");
    }
  }
}
function bindListActions(refs) {
  refs.adminProjectsList.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    const id = Number(button.dataset.id);
    if (!Number.isFinite(id)) return;

    if (button.dataset.action === "edit-project") await editProject(id, refs);
    if (button.dataset.action === "toggle-project-status") await toggleProjectStatus(id, refs);
    if (button.dataset.action === "toggle-project-featured") await toggleProjectFeatured(id, refs);
    if (button.dataset.action === "delete-project") await deleteProject(id, refs);
  });

  refs.adminSkillsList.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    const id = Number(button.dataset.id);
    if (!Number.isFinite(id)) return;

    if (button.dataset.action === "edit-skill") await editSkill(id, refs);
    if (button.dataset.action === "delete-skill") await deleteSkill(id, refs);
  });

  refs.messagesList.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    const id = Number(button.dataset.id);
    if (!Number.isFinite(id)) return;

    if (button.dataset.action === "toggle-message-read") await toggleMessageRead(id, refs);
    if (button.dataset.action === "delete-message") await deleteMessage(id, refs);
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  const refs = {
    loginSection: document.getElementById("loginSection"),
    dashboardSection: document.getElementById("dashboardSection"),
    analyticsSection: document.getElementById("analyticsSection"),
    projectSection: document.getElementById("projectSection"),
    skillSection: document.getElementById("skillSection"),
    messageSection: document.getElementById("messageSection"),
    loginForm: document.getElementById("loginForm"),
    loginEmail: document.getElementById("loginEmail"),
    loginPassword: document.getElementById("loginPassword"),
    loginMessage: document.getElementById("loginMessage"),
    logoutBtn: document.getElementById("logoutBtn"),
    adminWelcome: document.getElementById("adminWelcome"),
    projectsCount: document.getElementById("projectsCount"),
    skillsCount: document.getElementById("skillsCount"),
    messagesCount: document.getElementById("messagesCount"),
    unreadMessagesCount: document.getElementById("unreadMessagesCount"),
    pageViewsCount: document.getElementById("pageViewsCount"),
    projectViewsCount: document.getElementById("projectViewsCount"),
    projectClicksCount: document.getElementById("projectClicksCount"),
    contactSubmissionsCount: document.getElementById("contactSubmissionsCount"),
    analyticsTopProjects: document.getElementById("analyticsTopProjects"),
    analyticsRecentEvents: document.getElementById("analyticsRecentEvents"),
    refreshAnalyticsBtn: document.getElementById("refreshAnalyticsBtn"),
    projectForm: document.getElementById("projectForm"),
    projectId: document.getElementById("projectId"),
    projectFormHeading: document.getElementById("projectFormHeading"),
    projectSubmitBtn: document.getElementById("projectSubmitBtn"),
    projectCancelBtn: document.getElementById("projectCancelBtn"),
    togglePreviewBtn: document.getElementById("togglePreviewBtn"),
    previewSection: document.getElementById("previewSection"),
    projectCardPreview: document.getElementById("projectCardPreview"),
    projectDetailPreview: document.getElementById("projectDetailPreview"),
    projectImageFile: document.getElementById("projectImageFile"),
    uploadProjectImageBtn: document.getElementById("uploadProjectImageBtn"),
    projectImageUploadStatus: document.getElementById("projectImageUploadStatus"),
    projectImagePreview: document.getElementById("projectImagePreview"),
    projectMessage: document.getElementById("projectMessage"),
    projectListStatus: document.getElementById("projectListStatus"),
    adminProjectsList: document.getElementById("adminProjectsList"),
    projectStatus: document.getElementById("projectStatus"),
    projectSortOrder: document.getElementById("projectSortOrder"),
    projectFeatured: document.getElementById("projectFeatured"),
    projectTitle: document.getElementById("projectTitle"),
    projectSlug: document.getElementById("projectSlug"),
    projectShortDescription: document.getElementById("projectShortDescription"),
    projectCaseStudySummary: document.getElementById("projectCaseStudySummary"),
    projectRole: document.getElementById("projectRole"),
    projectTeamSize: document.getElementById("projectTeamSize"),
    projectDuration: document.getElementById("projectDuration"),
    projectProblem: document.getElementById("projectProblem"),
    projectSolution: document.getElementById("projectSolution"),
    projectImpact: document.getElementById("projectImpact"),
    projectArchitecture: document.getElementById("projectArchitecture"),
    projectTechStack: document.getElementById("projectTechStack"),
    projectGithubUrl: document.getElementById("projectGithubUrl"),
    projectDemoUrl: document.getElementById("projectDemoUrl"),
    projectImageUrl: document.getElementById("projectImageUrl"),
    projectGallery: document.getElementById("projectGallery"),
    projectChallenges: document.getElementById("projectChallenges"),
    projectLearnings: document.getElementById("projectLearnings"),
    loadProjectsBtn: document.getElementById("loadProjectsBtn"),
    skillForm: document.getElementById("skillForm"),
    skillId: document.getElementById("skillId"),
    skillFormHeading: document.getElementById("skillFormHeading"),
    skillSubmitBtn: document.getElementById("skillSubmitBtn"),
    skillCancelBtn: document.getElementById("skillCancelBtn"),
    skillMessage: document.getElementById("skillMessage"),
    skillListStatus: document.getElementById("skillListStatus"),
    adminSkillsList: document.getElementById("adminSkillsList"),
    skillName: document.getElementById("skillName"),
    skillLevel: document.getElementById("skillLevel"),
    skillCategory: document.getElementById("skillCategory"),
    loadSkillsBtn: document.getElementById("loadSkillsBtn"),
    messageStatus: document.getElementById("messageStatus"),
    messagesList: document.getElementById("messagesList"),
    loadMessagesBtn: document.getElementById("loadMessagesBtn"),
  };

  resetProjectForm(refs);
  resetSkillForm(refs);
  updateDashboardCounts(refs, state.dashboardCounts);
  bindListActions(refs);

  const previewFields = [
    refs.projectTitle, refs.projectSlug, refs.projectStatus, refs.projectSortOrder,
    refs.projectRole, refs.projectTeamSize, refs.projectDuration, refs.projectTechStack,
    refs.projectGithubUrl, refs.projectDemoUrl, refs.projectImageUrl, refs.projectShortDescription,
    refs.projectCaseStudySummary, refs.projectProblem, refs.projectSolution, refs.projectImpact,
    refs.projectArchitecture, refs.projectGallery, refs.projectChallenges, refs.projectLearnings,
  ];

  previewFields.forEach((field) => {
    field.addEventListener("input", () => {
      if (field === refs.projectTitle && !state.slugDirty) {
        refs.projectSlug.value = slugify(refs.projectTitle.value);
      }
      if (field === refs.projectSlug) {
        state.slugDirty = refs.projectSlug.value.trim().length > 0;
      }
      refreshProjectPreview(refs);
    });
  });

  refs.projectFeatured.addEventListener("change", () => refreshProjectPreview(refs));
  refs.projectStatus.addEventListener("change", () => refreshProjectPreview(refs));
  refs.projectForm.addEventListener("submit", (event) => saveProject(event, refs));
  refs.projectCancelBtn.addEventListener("click", () => resetProjectForm(refs));
  refs.loadProjectsBtn.addEventListener("click", () => loadProjects(refs));
  refs.uploadProjectImageBtn.addEventListener("click", () => uploadProjectImage(refs));
  refs.togglePreviewBtn.addEventListener("click", () => {
    state.previewVisible = !state.previewVisible;
    refs.previewSection.classList.toggle("hidden", !state.previewVisible);
    refs.togglePreviewBtn.textContent = state.previewVisible ? "An preview" : "Hien preview";
  });

  refs.skillForm.addEventListener("submit", (event) => saveSkill(event, refs));
  refs.skillCancelBtn.addEventListener("click", () => resetSkillForm(refs));
  refs.loadSkillsBtn.addEventListener("click", () => loadSkills(refs));
  refs.loadMessagesBtn.addEventListener("click", () => loadMessages(refs));
  refs.refreshAnalyticsBtn.addEventListener("click", () => loadAnalytics(refs));
  refs.loginForm.addEventListener("submit", (event) => handleLogin(event, refs));
  refs.logoutBtn.addEventListener("click", () => handleLogout(refs));

  if (getToken()) {
    showDashboard(refs);
    await loadAllDashboardData(refs);
  } else {
    showLogin(refs);
  }
});
