/**
 * app.js — Main portfolio page logic
 *
 * Modules (IIFE-style, no bundler required for dev; imports when bundled):
 *   - Theme toggle (dark / light)
 *   - Mobile navigation menu
 *   - Scroll state (header shadow + back-to-top)
 *   - Active nav link highlighting
 *   - Contact form with validation
 *   - Scroll-reveal animation (IntersectionObserver)
 *   - Typing text animation in hero
 *   - Dynamic projects & skills loaded from API
 */

import { API_BASE } from "./config.js";

document.addEventListener("DOMContentLoaded", () => {
  /* ------------------------------------------------------------------
     DOM References
     ------------------------------------------------------------------ */
  const body = document.body;
  const header = document.getElementById("header");
  const themeToggle = document.getElementById("themeToggle");
  const menuToggle = document.getElementById("menuToggle");
  const navMenu = document.getElementById("navMenu");
  const navLinks = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll("main section[id]");
  const backToTop = document.getElementById("backToTop");
  const contactForm = document.getElementById("contactForm");
  const typingText = document.getElementById("typingText");
  const revealElements = document.querySelectorAll(".reveal");
  const yearEl = document.getElementById("currentYear");

  /* ------------------------------------------------------------------
     Initialisation
     ------------------------------------------------------------------ */
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  initTheme();
  initMobileMenu();
  initScrollState();
  initActiveNavLink();
  initContactForm();
  initRevealAnimation();
  initTypingText();
  loadProjects();
  loadSkills();

  /* ==================================================================
     THEME TOGGLE
     ================================================================== */
  function initTheme() {
    const savedTheme = localStorage.getItem("theme");

    applyTheme(savedTheme === "dark");

    if (!themeToggle) return;

    themeToggle.addEventListener("click", () => {
      const isDark = body.classList.toggle("dark");
      localStorage.setItem("theme", isDark ? "dark" : "light");
      updateThemeIcon(isDark);
    });
  }

  function applyTheme(isDark) {
    if (isDark) {
      body.classList.add("dark");
    } else {
      body.classList.remove("dark");
    }
    updateThemeIcon(isDark);
  }

  function updateThemeIcon(isDark) {
    if (!themeToggle) return;
    // Use Font Awesome icons set in HTML — toggle aria-label for accessibility
    const icon = themeToggle.querySelector("i");
    if (icon) {
      icon.className = isDark ? "fa-solid fa-sun" : "fa-solid fa-moon";
    }
    themeToggle.setAttribute(
      "aria-label",
      isDark ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"
    );
  }

  /* ==================================================================
     MOBILE MENU
     ================================================================== */
  function initMobileMenu() {
    if (!menuToggle || !navMenu) return;

    menuToggle.addEventListener("click", () => {
      const isOpen = navMenu.classList.toggle("show");
      menuToggle.classList.toggle("active", isOpen);
      menuToggle.setAttribute("aria-expanded", String(isOpen));
    });

    // Close menu on nav link click
    navLinks.forEach((link) => {
      link.addEventListener("click", closeMobileMenu);
    });

    // Close menu when clicking outside
    document.addEventListener("click", (event) => {
      if (!navMenu.contains(event.target) && !menuToggle.contains(event.target)) {
        closeMobileMenu();
      }
    });
  }

  function closeMobileMenu() {
    if (!navMenu || !menuToggle) return;
    navMenu.classList.remove("show");
    menuToggle.classList.remove("active");
    menuToggle.setAttribute("aria-expanded", "false");
  }

  /* ==================================================================
     SCROLL STATE (header + back-to-top)
     ================================================================== */
  function initScrollState() {
    if (backToTop) {
      backToTop.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }

    const handleScroll = () => {
      const scrollY = window.scrollY;

      if (header) {
        header.classList.toggle("scrolled", scrollY > 20);
      }

      if (backToTop) {
        backToTop.classList.toggle("show", scrollY > 300);
      }
    };

    handleScroll(); // run once on load
    window.addEventListener("scroll", handleScroll, { passive: true });
  }

  /* ==================================================================
     ACTIVE NAV LINK (scroll spy)
     ================================================================== */
  function initActiveNavLink() {
    if (!sections.length || !navLinks.length) return;

    const updateActiveLink = () => {
      let currentSectionId = "";

      sections.forEach((section) => {
        const sectionTop = section.offsetTop - 140;
        const sectionBottom = sectionTop + section.offsetHeight;

        if (window.scrollY >= sectionTop && window.scrollY < sectionBottom) {
          currentSectionId = section.getAttribute("id");
        }
      });

      // Mark contact as active when scrolled to very bottom
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 5) {
        currentSectionId = "contact";
      }

      navLinks.forEach((link) => {
        const isActive = link.getAttribute("href") === `#${currentSectionId}`;
        link.classList.toggle("active", isActive);
      });
    };

    updateActiveLink();
    window.addEventListener("scroll", updateActiveLink, { passive: true });
  }

  /* ==================================================================
     CONTACT FORM
     ================================================================== */
  function initContactForm() {
    if (!contactForm) return;

    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const subjectInput = document.getElementById("subject");
    const messageInput = document.getElementById("message");
    const formMessage = document.getElementById("formMessage");

    if (!nameInput || !emailInput || !subjectInput || !messageInput || !formMessage) {
      return;
    }

    contactForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const nameValue = nameInput.value.trim();
      const emailValue = emailInput.value.trim();
      const subjectValue = subjectInput.value.trim();
      const messageValue = messageInput.value.trim();

      // Clear previous state
      clearFormMessage(formMessage);

      // Validation
      if (!nameValue || !emailValue || !messageValue) {
        showFormMessage(formMessage, "Vui lòng nhập đầy đủ họ tên, email và nội dung.", "error");
        return;
      }

      if (!isValidEmail(emailValue)) {
        showFormMessage(formMessage, "Email không đúng định dạng.", "error");
        return;
      }

      if (messageValue.length < 10) {
        showFormMessage(formMessage, "Nội dung phải có ít nhất 10 ký tự.", "error");
        return;
      }

      // Submit
      const submitButton = contactForm.querySelector('button[type="submit"]');
      setButtonLoading(submitButton, true, "Đang gửi...");

      try {
        const response = await fetch(`${API_BASE}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: nameValue,
            email: emailValue,
            subject: subjectValue,
            message: messageValue,
          }),
        });

        const result = await response.json();

        if (result.success) {
          showFormMessage(formMessage, "Gửi lời nhắn thành công!", "success");
          contactForm.reset();
        } else {
          showFormMessage(formMessage, result.message || "Gửi thất bại.", "error");
        }
      } catch (error) {
        console.error("Submit contact error:", error);
        showFormMessage(formMessage, "Không thể kết nối tới server.", "error");
      } finally {
        setButtonLoading(submitButton, false, "Gửi lời nhắn");
      }
    });
  }

  /* ==================================================================
     REVEAL ANIMATION
     ================================================================== */
  function initRevealAnimation() {
    if (!revealElements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
            // Unobserve after reveal so it won't re-trigger
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    revealElements.forEach((el) => observer.observe(el));
  }

  /* ==================================================================
     TYPING TEXT (hero role animation)
     ================================================================== */
  function initTypingText() {
    if (!typingText) return;

    const roles = [
      "Developer",
      "Project Manager",
      "Frontend Learner",
      "Web Developer",
    ];

    let currentIndex = 0;

    setInterval(() => {
      currentIndex = (currentIndex + 1) % roles.length;

      // Fade out
      typingText.style.opacity = "0";

      setTimeout(() => {
        typingText.textContent = roles[currentIndex];
        // Fade in
        typingText.style.opacity = "1";
      }, 250);
    }, 2400);
  }

  /* ==================================================================
     DYNAMIC DATA LOADING
     ================================================================== */

  /**
   * Load and render projects from the API.
   */
  async function loadProjects() {
    const projectsList = document.getElementById("projectsList");
    if (!projectsList) return;

    projectsList.innerHTML = `<p class="state-message">Đang tải dự án...</p>`;

    try {
      const response = await fetch(`${API_BASE}/projects`);
      const result = await response.json();

      if (!result.success || !Array.isArray(result.data)) {
        projectsList.innerHTML = `<p class="state-message">Không thể tải danh sách dự án.</p>`;
        return;
      }

      if (result.data.length === 0) {
        projectsList.innerHTML = `<p class="state-message">Chưa có dự án nào.</p>`;
        return;
      }

      projectsList.innerHTML = result.data.map(renderProjectCard).join("");
    } catch (error) {
      console.error("Load projects error:", error);
      projectsList.innerHTML = `<p class="state-message">Không thể kết nối tới server để tải dự án.</p>`;
    }
  }

  /**
   * Load and render skills from the API.
   */
  async function loadSkills() {
    const skillsList = document.getElementById("skillsList");
    if (!skillsList) return;

    skillsList.innerHTML = `<p class="state-message">Đang tải kỹ năng...</p>`;

    try {
      const response = await fetch(`${API_BASE}/skills`);
      const result = await response.json();

      if (!result.success || !Array.isArray(result.data)) {
        skillsList.innerHTML = `<p class="state-message">Không thể tải danh sách kỹ năng.</p>`;
        return;
      }

      if (result.data.length === 0) {
        skillsList.innerHTML = `<p class="state-message">Chưa có kỹ năng nào.</p>`;
        return;
      }

      skillsList.innerHTML = result.data.map(renderSkillCard).join("");
    } catch (error) {
      console.error("Load skills error:", error);
      skillsList.innerHTML = `<p class="state-message">Không thể kết nối tới server để tải kỹ năng.</p>`;
    }
  }

  /* ==================================================================
     TEMPLATE RENDERERS
     ================================================================== */

  /**
   * @param {Object} project
   * @returns {string} HTML string for a project card
   */
  function renderProjectCard(project) {
    const githubLink = project.github_url
      ? `<a href="${project.github_url}" target="_blank" rel="noopener noreferrer" class="btn btn-outline">GitHub</a>`
      : "";

    const demoLink = project.demo_url
      ? `<a href="${project.demo_url}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">Demo</a>`
      : "";

    return `
      <article class="project-card">
        <h3 class="project-title">${project.title ?? ""}</h3>
        <p class="project-description">${project.description ?? ""}</p>
        <p class="project-tech">${project.tech_stack ?? ""}</p>
        <div class="project-links">
          ${githubLink}
          ${demoLink}
        </div>
      </article>
    `;
  }

  /**
   * @param {Object} skill
   * @returns {string} HTML string for a skill card
   */
  function renderSkillCard(skill) {
    return `
      <article class="skill-card">
        <h3 class="skill-name">${skill.name ?? ""}</h3>
        <p class="skill-level">${skill.level ?? ""}</p>
        <p class="skill-category">${skill.category ?? ""}</p>
      </article>
    `;
  }

  /* ==================================================================
     UTILITY HELPERS
     ================================================================== */

  /**
   * Validate email format.
   * @param {string} value
   * @returns {boolean}
   */
  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  /**
   * Show form feedback message using CSS classes.
   * @param {HTMLElement} el
   * @param {string} message
   * @param {'error'|'success'} type
   */
  function showFormMessage(el, message, type) {
    el.textContent = message;
    el.className = `form-message ${type === "success" ? "is-success" : "is-error"}`;
  }

  /**
   * Clear form feedback message.
   * @param {HTMLElement} el
   */
  function clearFormMessage(el) {
    el.textContent = "";
    el.className = "form-message";
  }

  /**
   * Toggle submit button loading state.
   * @param {HTMLButtonElement} button
   * @param {boolean} isLoading
   * @param {string} label
   */
  function setButtonLoading(button, isLoading, label) {
    if (!button) return;
    button.disabled = isLoading;
    button.textContent = label;
  }
});
