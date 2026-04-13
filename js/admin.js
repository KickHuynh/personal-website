const API_BASE = "http://localhost:5000/api";

const editProjectSection = document.getElementById("editProjectSection");
const editProjectForm = document.getElementById("editProjectForm");
const editProjectMessage = document.getElementById("editProjectMessage");
const cancelEditProjectBtn = document.getElementById("cancelEditProjectBtn");

const editSkillSection = document.getElementById("editSkillSection");
const editSkillForm = document.getElementById("editSkillForm");
const editSkillMessage = document.getElementById("editSkillMessage");
const cancelEditSkillBtn = document.getElementById("cancelEditSkillBtn");

const loginSection = document.getElementById("loginSection");
const dashboardSection = document.getElementById("dashboardSection");
const projectSection = document.getElementById("projectSection");
const skillSection = document.getElementById("skillSection");
const messageSection = document.getElementById("messageSection");

const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");
const adminWelcome = document.getElementById("adminWelcome");
const logoutBtn = document.getElementById("logoutBtn");

const projectForm = document.getElementById("projectForm");
const projectMessage = document.getElementById("projectMessage");
const loadProjectsBtn = document.getElementById("loadProjectsBtn");
const projectListStatus = document.getElementById("projectListStatus");
const adminProjectsList = document.getElementById("adminProjectsList");

const skillForm = document.getElementById("skillForm");
const skillMessage = document.getElementById("skillMessage");
const loadSkillsBtn = document.getElementById("loadSkillsBtn");
const skillListStatus = document.getElementById("skillListStatus");
const adminSkillsList = document.getElementById("adminSkillsList");

const loadMessagesBtn = document.getElementById("loadMessagesBtn");
const messageStatus = document.getElementById("messageStatus");
const messagesList = document.getElementById("messagesList");

function getToken() {
  return localStorage.getItem("admin_token");
}

function getAdminUser() {
  const raw = localStorage.getItem("admin_user");
  return raw ? JSON.parse(raw) : null;
}

function saveAuth(token, user) {
  localStorage.setItem("admin_token", token);
  localStorage.setItem("admin_user", JSON.stringify(user));
}

function clearAuth() {
  localStorage.removeItem("admin_token");
  localStorage.removeItem("admin_user");
}

function showDashboard() {
  const user = getAdminUser();

  loginSection.classList.add("hidden");
  dashboardSection.classList.remove("hidden");
  projectSection.classList.remove("hidden");
  skillSection.classList.remove("hidden");
  messageSection.classList.remove("hidden");

  if (user) {
    adminWelcome.textContent = `Xin chào, ${user.full_name} (${user.role})`;
  }
}

function showLogin() {
  loginSection.classList.remove("hidden");
  dashboardSection.classList.add("hidden");
  projectSection.classList.add("hidden");
  skillSection.classList.add("hidden");
  messageSection.classList.add("hidden");
}

async function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  loginMessage.textContent = "Đang đăng nhập...";
  loginMessage.style.color = "#2563eb";

  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const result = await response.json();

    if (!result.success) {
      loginMessage.textContent = result.message || "Đăng nhập thất bại";
      loginMessage.style.color = "#dc2626";
      return;
    }

    saveAuth(result.data.token, result.data.user);
    loginMessage.textContent = "Đăng nhập thành công";
    loginMessage.style.color = "#16a34a";
    loginForm.reset();
    showDashboard();
  } catch (error) {
    console.error("Login error:", error);
    loginMessage.textContent = "Không thể kết nối tới server";
    loginMessage.style.color = "#dc2626";
  }
}

async function handleCreateProject(event) {
  event.preventDefault();

  const token = getToken();
  if (!token) {
    projectMessage.textContent = "Bạn chưa đăng nhập";
    projectMessage.style.color = "#dc2626";
    return;
  }

  const payload = {
    title: document.getElementById("projectTitle").value.trim(),
    description: document.getElementById("projectDescription").value.trim(),
    tech_stack: document.getElementById("projectTechStack").value.trim(),
    github_url: document.getElementById("projectGithubUrl").value.trim(),
    demo_url: document.getElementById("projectDemoUrl").value.trim(),
    image_url: document.getElementById("projectImageUrl").value.trim()
  };

  projectMessage.textContent = "Đang thêm project...";
  projectMessage.style.color = "#2563eb";

  try {
    const response = await fetch(`${API_BASE}/projects`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!result.success) {
      projectMessage.textContent = result.message || "Thêm project thất bại";
      projectMessage.style.color = "#dc2626";
      return;
    }

    projectMessage.textContent = "Thêm project thành công";
    projectMessage.style.color = "#16a34a";
    projectForm.reset();
    loadProjects();
  } catch (error) {
    console.error("Create project error:", error);
    projectMessage.textContent = "Không thể kết nối tới server";
    projectMessage.style.color = "#dc2626";
  }
}

async function handleCreateSkill(event) {
  event.preventDefault();

  const token = getToken();
  if (!token) {
    skillMessage.textContent = "Bạn chưa đăng nhập";
    skillMessage.style.color = "#dc2626";
    return;
  }

  const payload = {
    name: document.getElementById("skillName").value.trim(),
    level: document.getElementById("skillLevel").value.trim(),
    category: document.getElementById("skillCategory").value.trim()
  };

  skillMessage.textContent = "Đang thêm skill...";
  skillMessage.style.color = "#2563eb";

  try {
    const response = await fetch(`${API_BASE}/skills`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!result.success) {
      skillMessage.textContent = result.message || "Thêm skill thất bại";
      skillMessage.style.color = "#dc2626";
      return;
    }

    skillMessage.textContent = "Thêm skill thành công";
    skillMessage.style.color = "#16a34a";
    skillForm.reset();
    loadSkills();
  } catch (error) {
    console.error("Create skill error:", error);
    skillMessage.textContent = "Không thể kết nối tới server";
    skillMessage.style.color = "#dc2626";
  }
}

async function loadProjects() {
  projectListStatus.textContent = "Đang tải project...";
  projectListStatus.style.color = "#2563eb";
  adminProjectsList.innerHTML = "";

  try {
    const response = await fetch(`${API_BASE}/projects`);
    const result = await response.json();

    if (!result.success) {
      projectListStatus.textContent = "Không thể tải project";
      projectListStatus.style.color = "#dc2626";
      return;
    }

    const projects = result.data || [];

    if (projects.length === 0) {
      projectListStatus.textContent = "Chưa có project nào";
      projectListStatus.style.color = "#64748b";
      adminProjectsList.innerHTML = `<p class="admin-empty">Danh sách trống</p>`;
      return;
    }

    projectListStatus.textContent = `Đã tải ${projects.length} project`;
    projectListStatus.style.color = "#16a34a";

    adminProjectsList.innerHTML = projects
      .map((item) => {
        return `
          <article class="admin-item">
            <h3>${item.title}</h3>
            <p class="admin-meta">${item.tech_stack || "Không có tech stack"}</p>
            <p>${item.description}</p>
            <div class="admin-item-actions">
              <button class="btn btn-outline" type="button" onclick="editProject(${item.id})">Sửa</button>
              <button class="btn btn-outline" type="button" onclick="deleteProject(${item.id})">Xóa</button>
            </div>
          </article>
        `;
      })
      .join("");
  } catch (error) {
    console.error("Load projects error:", error);
    projectListStatus.textContent = "Không thể kết nối tới server";
    projectListStatus.style.color = "#dc2626";
  }
}

async function loadSkills() {
  skillListStatus.textContent = "Đang tải skill...";
  skillListStatus.style.color = "#2563eb";
  adminSkillsList.innerHTML = "";

  try {
    const response = await fetch(`${API_BASE}/skills`);
    const result = await response.json();

    if (!result.success) {
      skillListStatus.textContent = "Không thể tải skill";
      skillListStatus.style.color = "#dc2626";
      return;
    }

    const skills = result.data || [];

    if (skills.length === 0) {
      skillListStatus.textContent = "Chưa có skill nào";
      skillListStatus.style.color = "#64748b";
      adminSkillsList.innerHTML = `<p class="admin-empty">Danh sách trống</p>`;
      return;
    }

    skillListStatus.textContent = `Đã tải ${skills.length} skill`;
    skillListStatus.style.color = "#16a34a";

    adminSkillsList.innerHTML = skills
      .map((item) => {
        return `
          <article class="admin-item">
            <h3>${item.name}</h3>
            <p class="admin-meta">${item.level || ""} ${item.category ? "- " + item.category : ""}</p>
            <div class="admin-item-actions">
              <button class="btn btn-outline" type="button" onclick="editSkill(${item.id})">Sửa</button>
              <button class="btn btn-outline" type="button" onclick="deleteSkill(${item.id})">Xóa</button>            </div>
          </article>
        `;
      })
      .join("");
  } catch (error) {
    console.error("Load skills error:", error);
    skillListStatus.textContent = "Không thể kết nối tới server";
    skillListStatus.style.color = "#dc2626";
  }
}

async function loadMessages() {
  const token = getToken();

  if (!token) {
    messageStatus.textContent = "Bạn chưa đăng nhập";
    messageStatus.style.color = "#dc2626";
    return;
  }

  messageStatus.textContent = "Đang tải lời nhắn...";
  messageStatus.style.color = "#2563eb";
  messagesList.innerHTML = "";

  try {
    const response = await fetch(`${API_BASE}/messages`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const result = await response.json();

    if (!result.success) {
      messageStatus.textContent = result.message || "Không thể tải lời nhắn";
      messageStatus.style.color = "#dc2626";
      return;
    }

    const messages = result.data || [];

    if (messages.length === 0) {
      messageStatus.textContent = "Chưa có lời nhắn nào.";
      messageStatus.style.color = "#64748b";
      messagesList.innerHTML = `<p class="admin-empty">Danh sách trống</p>`;
      return;
    }

    messageStatus.textContent = `Đã tải ${messages.length} lời nhắn`;
    messageStatus.style.color = "#16a34a";

    messagesList.innerHTML = messages
      .map((item) => {
        return `
          <article class="admin-item">
            <h3>${item.subject ? item.subject : "Không có chủ đề"}</h3>
            <p class="admin-meta"><strong>${item.name}</strong> - ${item.email}</p>
            <p class="admin-meta">Thời gian: ${new Date(item.created_at).toLocaleString("vi-VN")}</p>
            <p>${item.message}</p>
            <div class="admin-item-actions">
              <button class="btn btn-outline" type="button" onclick="deleteMessage(${item.id})">Xóa</button>
            </div>
          </article>
        `;
      })
      .join("");
  } catch (error) {
    console.error("Load messages error:", error);
    messageStatus.textContent = "Không thể kết nối tới server";
    messageStatus.style.color = "#dc2626";
  }
}

async function deleteProject(id) {
  const token = getToken();
  if (!token) return;

  const confirmed = confirm("Bạn có chắc muốn xóa project này không?");
  if (!confirmed) return;

  try {
    const response = await fetch(`${API_BASE}/projects/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const result = await response.json();

    if (!result.success) {
      alert(result.message || "Xóa project thất bại");
      return;
    }

    loadProjects();
  } catch (error) {
    console.error("Delete project error:", error);
    alert("Không thể kết nối tới server");
  }
}

async function deleteSkill(id) {
  const token = getToken();
  if (!token) return;

  const confirmed = confirm("Bạn có chắc muốn xóa skill này không?");
  if (!confirmed) return;

  try {
    const response = await fetch(`${API_BASE}/skills/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const result = await response.json();

    if (!result.success) {
      alert(result.message || "Xóa skill thất bại");
      return;
    }

    loadSkills();
  } catch (error) {
    console.error("Delete skill error:", error);
    alert("Không thể kết nối tới server");
  }
}

async function deleteMessage(id) {
  const token = getToken();
  if (!token) return;

  const confirmed = confirm("Bạn có chắc muốn xóa lời nhắn này không?");
  if (!confirmed) return;

  try {
    const response = await fetch(`${API_BASE}/messages/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const result = await response.json();

    if (!result.success) {
      alert(result.message || "Xóa lời nhắn thất bại");
      return;
    }

    loadMessages();
  } catch (error) {
    console.error("Delete message error:", error);
    alert("Không thể kết nối tới server");
  }
}

function handleLogout() {
  clearAuth();
  showLogin();
}

document.addEventListener("DOMContentLoaded", () => {
  const token = getToken();

  if (token) {
    showDashboard();
  } else {
    showLogin();
  }

  loginForm.addEventListener("submit", handleLogin);
  projectForm.addEventListener("submit", handleCreateProject);
  skillForm.addEventListener("submit", handleCreateSkill);
  logoutBtn.addEventListener("click", handleLogout);
  loadProjectsBtn.addEventListener("click", loadProjects);
  loadSkillsBtn.addEventListener("click", loadSkills);
  loadMessagesBtn.addEventListener("click", loadMessages);
  editProjectForm.addEventListener("submit", handleUpdateProject);
  editSkillForm.addEventListener("submit", handleUpdateSkill);

  cancelEditProjectBtn.addEventListener("click", hideEditProjectForm);
  cancelEditSkillBtn.addEventListener("click", hideEditSkillForm);

  window.deleteProject = deleteProject;
  window.deleteSkill = deleteSkill;
  window.deleteMessage = deleteMessage;
  window.editProject = editProject;
  window.editSkill = editSkill;


  function hideEditProjectForm() {
    editProjectSection.classList.add("hidden");
    editProjectForm.reset();
    editProjectMessage.textContent = "";
  }

  function hideEditSkillForm() {
    editSkillSection.classList.add("hidden");
    editSkillForm.reset();
    editSkillMessage.textContent = "";
  }

  async function editProject(id) {
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

      editProjectMessage.textContent = "";
      editProjectSection.classList.remove("hidden");
      editProjectSection.scrollIntoView({ behavior: "smooth" });
    } catch (error) {
      console.error("Edit project load error:", error);
      alert("Không thể kết nối tới server");
    }
  }
  async function handleUpdateProject(event) {
    event.preventDefault();

    const token = getToken();
    if (!token) {
      editProjectMessage.textContent = "Bạn chưa đăng nhập";
      editProjectMessage.style.color = "#dc2626";
      return;
    }

    const id = document.getElementById("editProjectId").value;

    const payload = {
      title: document.getElementById("editProjectTitle").value.trim(),
      description: document.getElementById("editProjectDescription").value.trim(),
      tech_stack: document.getElementById("editProjectTechStack").value.trim(),
      github_url: document.getElementById("editProjectGithubUrl").value.trim(),
      demo_url: document.getElementById("editProjectDemoUrl").value.trim(),
      image_url: document.getElementById("editProjectImageUrl").value.trim()
    };

    editProjectMessage.textContent = "Đang cập nhật project...";
    editProjectMessage.style.color = "#2563eb";

    try {
      const response = await fetch(`${API_BASE}/projects/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!result.success) {
        editProjectMessage.textContent = result.message || "Cập nhật project thất bại";
        editProjectMessage.style.color = "#dc2626";
        return;
      }

      editProjectMessage.textContent = "Cập nhật project thành công";
      editProjectMessage.style.color = "#16a34a";
      loadProjects();

      setTimeout(() => {
        hideEditProjectForm();
      }, 800);
    } catch (error) {
      console.error("Update project error:", error);
      editProjectMessage.textContent = "Không thể kết nối tới server";
      editProjectMessage.style.color = "#dc2626";
    }
  }

  async function editSkill(id) {
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

      editSkillMessage.textContent = "";
      editSkillSection.classList.remove("hidden");
      editSkillSection.scrollIntoView({ behavior: "smooth" });
    } catch (error) {
      console.error("Edit skill load error:", error);
      alert("Không thể kết nối tới server");
    }
  }
  async function handleUpdateSkill(event) {
    event.preventDefault();

    const token = getToken();
    if (!token) {
      editSkillMessage.textContent = "Bạn chưa đăng nhập";
      editSkillMessage.style.color = "#dc2626";
      return;
    }

    const id = document.getElementById("editSkillId").value;

    const payload = {
      name: document.getElementById("editSkillName").value.trim(),
      level: document.getElementById("editSkillLevel").value.trim(),
      category: document.getElementById("editSkillCategory").value.trim()
    };

    editSkillMessage.textContent = "Đang cập nhật skill...";
    editSkillMessage.style.color = "#2563eb";

    try {
      const response = await fetch(`${API_BASE}/skills/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!result.success) {
        editSkillMessage.textContent = result.message || "Cập nhật skill thất bại";
        editSkillMessage.style.color = "#dc2626";
        return;
      }

      editSkillMessage.textContent = "Cập nhật skill thành công";
      editSkillMessage.style.color = "#16a34a";
      loadSkills();

      setTimeout(() => {
        hideEditSkillForm();
      }, 800);
    } catch (error) {
      console.error("Update skill error:", error);
      editSkillMessage.textContent = "Không thể kết nối tới server";
      editSkillMessage.style.color = "#dc2626";
    }
  }
});
