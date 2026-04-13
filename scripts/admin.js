/**
 * admin.js — Admin panel logic
 *
 * Handles:
 *   - Auth (login / logout / session persistence via localStorage)
 *   - Projects CRUD (create, list, edit, delete)
 *   - Skills CRUD (create, list, edit, delete)
 *   - Messages list & delete
 *
 * All API calls use API_BASE from config.js.
 * Status messages use CSS classes (is-info / is-success / is-error / is-muted)
 * instead of inline style.color.
 */

import { API_BASE } from "./config.js";

/* ============================================================
   AUTH HELPERS
   ============================================================ */

/** @returns {string|null} */
function getToken() {
  return localStorage.getItem("admin_token");
}

/** @returns {Object|null} */
function getAdminUser() {
  try {
    const raw = localStorage.getItem("admin_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    // Malformed data — clear it
    localStorage.removeItem("admin_user");
    return null;
  }
}

/** @param {string} token @param {Object} user */
function saveAuth(token, user) {
  localStorage.setItem("admin_token", token);
  localStorage.setItem("admin_user", JSON.stringify(user));
}

function clearAuth() {
  localStorage.removeItem("admin_token");
  localStorage.removeItem("admin_user");
}

/* ============================================================
   STATUS MESSAGE HELPERS
   ============================================================ */

/**
 * Set a status element's text and visual state.
 * @param {HTMLElement} el
 * @param {string} message
 * @param {'info'|'success'|'error'|'muted'} type
 */
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

/* ============================================================
   UI VISIBILITY
   ============================================================ */

function showDashboard(refs) {
  const user = getAdminUser();

  refs.loginSection.classList.add("hidden");
  refs.dashboardSection.classList.remove("hidden");
  refs.projectSection.classList.remove("hidden");
  refs.skillSection.classList.remove("hidden");
  refs.messageSection.classList.remove("hidden");

  if (user && refs.adminWelcome) {
    refs.adminWelcome.textContent = `Xin chào, ${user.full_name} (${user.role})`;
  }
}

function showLogin(refs) {
  refs.loginSection.classList.remove("hidden");
  refs.dashboardSection.classList.add("hidden");
  refs.projectSection.classList.add("hidden");
  refs.skillSection.classList.add("hidden");
  refs.messageSection.classList.add("hidden");
}

/* ============================================================
   AUTH HANDLERS
   ============================================================ */

async function handleLogin(event, refs) {
  event.preventDefault();

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  setStatus(refs.loginMessage, "Đang đăng nhập...", "info");

  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();

    if (!result.success) {
      setStatus(refs.loginMessage, result.message || "Đăng nhập thất bại", "error");
      return;
    }

    saveAuth(result.data.token, result.data.user);
    setStatus(refs.loginMessage, "Đăng nhập thành công", "success");
    refs.loginForm.reset();
    showDashboard(refs);
  } catch (error) {
    console.error("Login error:", error);
    setStatus(refs.loginMessage, "Không thể kết nối tới server", "error");
  }
}

function handleLogout(refs) {
  clearAuth();
  showLogin(refs);
}

/* ============================================================
   PROJECTS
   ============================================================ */

async function handleCreateProject(event, refs) {
  event.preventDefault();

  const token = getToken();
  if (!token) {
    setStatus(refs.projectMessage, "Bạn chưa đăng nhập", "error");
    return;
  }

  const payload = {
    title: document.getElementById("projectTitle").value.trim(),
    description: document.getElementById("projectDescription").value.trim(),
    tech_stack: document.getElementById("projectTechStack").value.trim(),
    github_url: document.getElementById("projectGithubUrl").value.trim(),
    demo_url: document.getElementById("projectDemoUrl").value.trim(),
    image_url: document.getElementById("projectImageUrl").value.trim(),
  };

  setStatus(refs.projectMessage, "Đang thêm project...", "info");

  try {
    const response = await fetch(`${API_BASE}/projects`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!result.success) {
      setStatus(refs.projectMessage, result.message || "Thêm project thất bại", "error");
      return;
    }

    setStatus(refs.projectMessage, "Thêm project thành công", "success");
    refs.projectForm.reset();
    loadProjects(refs);
  } catch (error) {
    console.error("Create project error:", error);
    setStatus(refs.projectMessage, "Không thể kết nối tới server", "error");
  }
}

async function loadProjects(refs) {
  setStatus(refs.projectListStatus, "Đang tải project...", "info");
  refs.adminProjectsList.innerHTML = "";

  try {
    const response = await fetch(`${API_BASE}/projects`);
    const result = await response.json();

    if (!result.success) {
      setStatus(refs.projectListStatus, "Không thể tải project", "error");
      return;
    }

    const projects = result.data || [];

    if (projects.length === 0) {
      setStatus(refs.projectListStatus, "Chưa có project nào", "muted");
      refs.adminProjectsList.innerHTML = `<p class="admin-empty">Danh sách trống</p>`;
      return;
    }

    setStatus(refs.projectListStatus, `Đã tải ${projects.length} project`, "success");
    refs.adminProjectsList.innerHTML = projects
      .map((item) => renderAdminProjectItem(item))
      .join("");

    // Attach action buttons via event delegation on the list
    attachListActionListeners(refs.adminProjectsList, "project", refs);
  } catch (error) {
    console.error("Load projects error:", error);
    setStatus(refs.projectListStatus, "Không thể kết nối tới server", "error");
  }
}

async function deleteProject(id, refs) {
  const token = getToken();
  if (!token) return;

  if (!confirm("Bạn có chắc muốn xóa project này không?")) return;

  try {
    const response = await fetch(`${API_BASE}/projects/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    const result = await response.json();

    if (!result.success) {
      alert(result.message || "Xóa project thất bại");
      return;
    }

    loadProjects(refs);
  } catch (error) {
    console.error("Delete project error:", error);
    alert("Không thể kết nối tới server");
  }
}

async function openEditProject(id, refs) {
  try {
    const response = await fetch(`${API_BASE}/projects/${id}`);
    const result = await response.json();

    if (!result.success) {
      alert(result.message || "Không tải được project");
      return;
    }

    const item = result.data;

    document.getElementById("editProjectId").value = item.id;
    document.getElementById("editProjectTitle").value = item.title || "";
    document.getElementById("editProjectDescription").value = item.description || "";
    document.getElementById("editProjectTechStack").value = item.tech_stack || "";
    document.getElementById("editProjectGithubUrl").value = item.github_url || "";
    document.getElementById("editProjectDemoUrl").value = item.demo_url || "";
    document.getElementById("editProjectImageUrl").value = item.image_url || "";

    clearStatus(refs.editProjectMessage);
    refs.editProjectSection.classList.remove("hidden");
    refs.editProjectSection.scrollIntoView({ behavior: "smooth" });
  } catch (error) {
    console.error("Edit project load error:", error);
    alert("Không thể kết nối tới server");
  }
}

async function handleUpdateProject(event, refs) {
  event.preventDefault();

  const token = getToken();
  if (!token) {
    setStatus(refs.editProjectMessage, "Bạn chưa đăng nhập", "error");
    return;
  }

  const id = document.getElementById("editProjectId").value;
  const payload = {
    title: document.getElementById("editProjectTitle").value.trim(),
    description: document.getElementById("editProjectDescription").value.trim(),
    tech_stack: document.getElementById("editProjectTechStack").value.trim(),
    github_url: document.getElementById("editProjectGithubUrl").value.trim(),
    demo_url: document.getElementById("editProjectDemoUrl").value.trim(),
    image_url: document.getElementById("editProjectImageUrl").value.trim(),
  };

  setStatus(refs.editProjectMessage, "Đang cập nhật project...", "info");

  try {
    const response = await fetch(`${API_BASE}/projects/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!result.success) {
      setStatus(refs.editProjectMessage, result.message || "Cập nhật project thất bại", "error");
      return;
    }

    setStatus(refs.editProjectMessage, "Cập nhật project thành công", "success");
    loadProjects(refs);

    setTimeout(() => hideEditProjectForm(refs), 800);
  } catch (error) {
    console.error("Update project error:", error);
    setStatus(refs.editProjectMessage, "Không thể kết nối tới server", "error");
  }
}

function hideEditProjectForm(refs) {
  refs.editProjectSection.classList.add("hidden");
  refs.editProjectForm.reset();
  clearStatus(refs.editProjectMessage);
}

/* ============================================================
   SKILLS
   ============================================================ */

async function handleCreateSkill(event, refs) {
  event.preventDefault();

  const token = getToken();
  if (!token) {
    setStatus(refs.skillMessage, "Bạn chưa đăng nhập", "error");
    return;
  }

  const payload = {
    name: document.getElementById("skillName").value.trim(),
    level: document.getElementById("skillLevel").value.trim(),
    category: document.getElementById("skillCategory").value.trim(),
  };

  setStatus(refs.skillMessage, "Đang thêm skill...", "info");

  try {
    const response = await fetch(`${API_BASE}/skills`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!result.success) {
      setStatus(refs.skillMessage, result.message || "Thêm skill thất bại", "error");
      return;
    }

    setStatus(refs.skillMessage, "Thêm skill thành công", "success");
    refs.skillForm.reset();
    loadSkills(refs);
  } catch (error) {
    console.error("Create skill error:", error);
    setStatus(refs.skillMessage, "Không thể kết nối tới server", "error");
  }
}

async function loadSkills(refs) {
  setStatus(refs.skillListStatus, "Đang tải skill...", "info");
  refs.adminSkillsList.innerHTML = "";

  try {
    const response = await fetch(`${API_BASE}/skills`);
    const result = await response.json();

    if (!result.success) {
      setStatus(refs.skillListStatus, "Không thể tải skill", "error");
      return;
    }

    const skills = result.data || [];

    if (skills.length === 0) {
      setStatus(refs.skillListStatus, "Chưa có skill nào", "muted");
      refs.adminSkillsList.innerHTML = `<p class="admin-empty">Danh sách trống</p>`;
      return;
    }

    setStatus(refs.skillListStatus, `Đã tải ${skills.length} skill`, "success");
    refs.adminSkillsList.innerHTML = skills
      .map((item) => renderAdminSkillItem(item))
      .join("");

    attachListActionListeners(refs.adminSkillsList, "skill", refs);
  } catch (error) {
    console.error("Load skills error:", error);
    setStatus(refs.skillListStatus, "Không thể kết nối tới server", "error");
  }
}

async function deleteSkill(id, refs) {
  const token = getToken();
  if (!token) return;

  if (!confirm("Bạn có chắc muốn xóa skill này không?")) return;

  try {
    const response = await fetch(`${API_BASE}/skills/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    const result = await response.json();

    if (!result.success) {
      alert(result.message || "Xóa skill thất bại");
      return;
    }

    loadSkills(refs);
  } catch (error) {
    console.error("Delete skill error:", error);
    alert("Không thể kết nối tới server");
  }
}

async function openEditSkill(id, refs) {
  try {
    const response = await fetch(`${API_BASE}/skills/${id}`);
    const result = await response.json();

    if (!result.success) {
      alert(result.message || "Không tải được skill");
      return;
    }

    const item = result.data;

    document.getElementById("editSkillId").value = item.id;
    document.getElementById("editSkillName").value = item.name || "";
    document.getElementById("editSkillLevel").value = item.level || "";
    document.getElementById("editSkillCategory").value = item.category || "";

    clearStatus(refs.editSkillMessage);
    refs.editSkillSection.classList.remove("hidden");
    refs.editSkillSection.scrollIntoView({ behavior: "smooth" });
  } catch (error) {
    console.error("Edit skill load error:", error);
    alert("Không thể kết nối tới server");
  }
}

async function handleUpdateSkill(event, refs) {
  event.preventDefault();

  const token = getToken();
  if (!token) {
    setStatus(refs.editSkillMessage, "Bạn chưa đăng nhập", "error");
    return;
  }

  const id = document.getElementById("editSkillId").value;
  const payload = {
    name: document.getElementById("editSkillName").value.trim(),
    level: document.getElementById("editSkillLevel").value.trim(),
    category: document.getElementById("editSkillCategory").value.trim(),
  };

  setStatus(refs.editSkillMessage, "Đang cập nhật skill...", "info");

  try {
    const response = await fetch(`${API_BASE}/skills/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!result.success) {
      setStatus(refs.editSkillMessage, result.message || "Cập nhật skill thất bại", "error");
      return;
    }

    setStatus(refs.editSkillMessage, "Cập nhật skill thành công", "success");
    loadSkills(refs);

    setTimeout(() => hideEditSkillForm(refs), 800);
  } catch (error) {
    console.error("Update skill error:", error);
    setStatus(refs.editSkillMessage, "Không thể kết nối tới server", "error");
  }
}

function hideEditSkillForm(refs) {
  refs.editSkillSection.classList.add("hidden");
  refs.editSkillForm.reset();
  clearStatus(refs.editSkillMessage);
}

/* ============================================================
   MESSAGES
   ============================================================ */

async function loadMessages(refs) {
  const token = getToken();

  if (!token) {
    setStatus(refs.messageStatus, "Bạn chưa đăng nhập", "error");
    return;
  }

  setStatus(refs.messageStatus, "Đang tải lời nhắn...", "info");
  refs.messagesList.innerHTML = "";

  try {
    const response = await fetch(`${API_BASE}/messages`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const result = await response.json();

    if (!result.success) {
      setStatus(refs.messageStatus, result.message || "Không thể tải lời nhắn", "error");
      return;
    }

    const messages = result.data || [];

    if (messages.length === 0) {
      setStatus(refs.messageStatus, "Chưa có lời nhắn nào.", "muted");
      refs.messagesList.innerHTML = `<p class="admin-empty">Danh sách trống</p>`;
      return;
    }

    setStatus(refs.messageStatus, `Đã tải ${messages.length} lời nhắn`, "success");
    refs.messagesList.innerHTML = messages
      .map((item) => renderAdminMessageItem(item))
      .join("");

    attachListActionListeners(refs.messagesList, "message", refs);
  } catch (error) {
    console.error("Load messages error:", error);
    setStatus(refs.messageStatus, "Không thể kết nối tới server", "error");
  }
}

async function deleteMessage(id, refs) {
  const token = getToken();
  if (!token) return;

  if (!confirm("Bạn có chắc muốn xóa lời nhắn này không?")) return;

  try {
    const response = await fetch(`${API_BASE}/messages/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    const result = await response.json();

    if (!result.success) {
      alert(result.message || "Xóa lời nhắn thất bại");
      return;
    }

    loadMessages(refs);
  } catch (error) {
    console.error("Delete message error:", error);
    alert("Không thể kết nối tới server");
  }
}

/* ============================================================
   TEMPLATE RENDERERS
   ============================================================ */

function renderAdminProjectItem(item) {
  return `
    <article class="admin-item" data-id="${item.id}">
      <h3>${item.title ?? ""}</h3>
      <p class="admin-meta">${item.tech_stack || "Không có tech stack"}</p>
      <p>${item.description ?? ""}</p>
      <div class="admin-item-actions">
        <button class="btn btn-outline" type="button" data-action="edit" data-type="project" data-id="${item.id}">Sửa</button>
        <button class="btn btn-outline" type="button" data-action="delete" data-type="project" data-id="${item.id}">Xóa</button>
      </div>
    </article>
  `;
}

function renderAdminSkillItem(item) {
  const meta = [item.level, item.category ? `- ${item.category}` : ""].filter(Boolean).join(" ");
  return `
    <article class="admin-item" data-id="${item.id}">
      <h3>${item.name ?? ""}</h3>
      <p class="admin-meta">${meta}</p>
      <div class="admin-item-actions">
        <button class="btn btn-outline" type="button" data-action="edit" data-type="skill" data-id="${item.id}">Sửa</button>
        <button class="btn btn-outline" type="button" data-action="delete" data-type="skill" data-id="${item.id}">Xóa</button>
      </div>
    </article>
  `;
}

function renderAdminMessageItem(item) {
  const subject = item.subject || "Không có chủ đề";
  const sentAt = new Date(item.created_at).toLocaleString("vi-VN");
  return `
    <article class="admin-item" data-id="${item.id}">
      <h3>${subject}</h3>
      <p class="admin-meta"><strong>${item.name ?? ""}</strong> — ${item.email ?? ""}</p>
      <p class="admin-meta">Thời gian: ${sentAt}</p>
      <p>${item.message ?? ""}</p>
      <div class="admin-item-actions">
        <button class="btn btn-outline" type="button" data-action="delete" data-type="message" data-id="${item.id}">Xóa</button>
      </div>
    </article>
  `;
}

/* ============================================================
   EVENT DELEGATION for dynamic list buttons
   ============================================================ */

/**
 * Attach delegated click listeners to action buttons inside a rendered list.
 * Reads data-action, data-type, data-id from button dataset.
 * @param {HTMLElement} listEl
 * @param {'project'|'skill'|'message'} type
 * @param {Object} refs
 */
function attachListActionListeners(listEl, type, refs) {
  listEl.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    const action = button.dataset.action;
    const id = Number(button.dataset.id);

    if (type === "project") {
      if (action === "edit") openEditProject(id, refs);
      if (action === "delete") deleteProject(id, refs);
    }

    if (type === "skill") {
      if (action === "edit") openEditSkill(id, refs);
      if (action === "delete") deleteSkill(id, refs);
    }

    if (type === "message") {
      if (action === "delete") deleteMessage(id, refs);
    }
  });
}

/* ============================================================
   INIT
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  // Collect all DOM references once
  const refs = {
    loginSection: document.getElementById("loginSection"),
    dashboardSection: document.getElementById("dashboardSection"),
    projectSection: document.getElementById("projectSection"),
    skillSection: document.getElementById("skillSection"),
    messageSection: document.getElementById("messageSection"),
    editProjectSection: document.getElementById("editProjectSection"),
    editSkillSection: document.getElementById("editSkillSection"),

    loginForm: document.getElementById("loginForm"),
    loginMessage: document.getElementById("loginMessage"),
    adminWelcome: document.getElementById("adminWelcome"),

    projectForm: document.getElementById("projectForm"),
    projectMessage: document.getElementById("projectMessage"),
    projectListStatus: document.getElementById("projectListStatus"),
    adminProjectsList: document.getElementById("adminProjectsList"),

    editProjectForm: document.getElementById("editProjectForm"),
    editProjectMessage: document.getElementById("editProjectMessage"),

    skillForm: document.getElementById("skillForm"),
    skillMessage: document.getElementById("skillMessage"),
    skillListStatus: document.getElementById("skillListStatus"),
    adminSkillsList: document.getElementById("adminSkillsList"),

    editSkillForm: document.getElementById("editSkillForm"),
    editSkillMessage: document.getElementById("editSkillMessage"),

    messageStatus: document.getElementById("messageStatus"),
    messagesList: document.getElementById("messagesList"),
  };

  // Check session
  if (getToken()) {
    showDashboard(refs);
  } else {
    showLogin(refs);
  }

  // Event listeners (pass refs so handlers can reference elements)
  refs.loginForm.addEventListener("submit", (e) => handleLogin(e, refs));
  document.getElementById("logoutBtn").addEventListener("click", () => handleLogout(refs));

  refs.projectForm.addEventListener("submit", (e) => handleCreateProject(e, refs));
  document.getElementById("loadProjectsBtn").addEventListener("click", () => loadProjects(refs));
  refs.editProjectForm.addEventListener("submit", (e) => handleUpdateProject(e, refs));
  document.getElementById("cancelEditProjectBtn").addEventListener("click", () => hideEditProjectForm(refs));

  refs.skillForm.addEventListener("submit", (e) => handleCreateSkill(e, refs));
  document.getElementById("loadSkillsBtn").addEventListener("click", () => loadSkills(refs));
  refs.editSkillForm.addEventListener("submit", (e) => handleUpdateSkill(e, refs));
  document.getElementById("cancelEditSkillBtn").addEventListener("click", () => hideEditSkillForm(refs));

  document.getElementById("loadMessagesBtn").addEventListener("click", () => loadMessages(refs));
});
