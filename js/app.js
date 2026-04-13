document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const header = document.getElementById("header");
  const themeToggle = document.getElementById("themeToggle");
  const menuToggle = document.getElementById("menuToggle");
  const navMenu = document.getElementById("navMenu");
  const navLinks = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll("main section[id]");
  const backToTop = document.getElementById("backToTop");
  const form = document.getElementById("contactForm");
  const typingText = document.getElementById("typingText");
  const revealElements = document.querySelectorAll(".reveal");
  const yearEl = document.getElementById("currentYear");

  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  initTheme();
  initMobileMenu();
  initScrollState();
  initActiveNavLink();
  //initProjectFilter();
  initContactForm();
  initRevealAnimation();
  initTypingText();
  loadProjects();
  loadSkills();

  function initTheme() {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {
      body.classList.add("dark");
      if (themeToggle) themeToggle.textContent = "☀️";
    } else {
      body.classList.remove("dark");
      if (themeToggle) themeToggle.textContent = "🌙";
    }

    if (!themeToggle) return;

    themeToggle.addEventListener("click", () => {
      body.classList.toggle("dark");
      const isDark = body.classList.contains("dark");

      localStorage.setItem("theme", isDark ? "dark" : "light");
      themeToggle.textContent = isDark ? "☀️" : "🌙";
    });
  }

  function initMobileMenu() {
    if (!menuToggle || !navMenu) return;

    menuToggle.addEventListener("click", () => {
      menuToggle.classList.toggle("active");
      navMenu.classList.toggle("show");
    });

    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        menuToggle.classList.remove("active");
        navMenu.classList.remove("show");
      });
    });

    document.addEventListener("click", (event) => {
      const clickedInsideMenu = navMenu.contains(event.target);
      const clickedToggle = menuToggle.contains(event.target);

      if (!clickedInsideMenu && !clickedToggle) {
        navMenu.classList.remove("show");
        menuToggle.classList.remove("active");
      }
    });
  }

  function initScrollState() {
    if (backToTop) {
      backToTop.addEventListener("click", () => {
        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });
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

    handleScroll();
    window.addEventListener("scroll", handleScroll);
  }

  function initActiveNavLink() {
    if (!sections.length || !navLinks.length) return;

    const updateActiveLink = () => {
      let currentSectionId = "";

      sections.forEach((section) => {
        const sectionTop = section.offsetTop - 140;
        const sectionHeight = section.offsetHeight;

        if (
          window.scrollY >= sectionTop &&
          window.scrollY < sectionTop + sectionHeight
        ) {
          currentSectionId = section.getAttribute("id");
        }
      });

      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 5) {
        currentSectionId = "contact";
      }

      navLinks.forEach((link) => {
        link.classList.remove("active");

        if (link.getAttribute("href") === `#${currentSectionId}`) {
          link.classList.add("active");
        }
      });
    };

    updateActiveLink();
    window.addEventListener("scroll", updateActiveLink);
  }

  function initProjectFilter() {
    const filterButtons = document.querySelectorAll(".filter-btn");
    const projectCards = document.querySelectorAll(".project-card");

    if (!filterButtons.length || !projectCards.length) return;

    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const filterValue = button.dataset.filter;

        filterButtons.forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");

        projectCards.forEach((card) => {
          const category = card.dataset.category;
          const shouldShow = filterValue === "all" || category === filterValue;

          card.style.display = shouldShow ? "block" : "none";
        });
      });
    });
  }

  function initContactForm() {
    if (!form) return;

    const name = document.getElementById("name");
    const email = document.getElementById("email");
    const subject = document.getElementById("subject");
    const message = document.getElementById("message");
    const formMessage = document.getElementById("formMessage");

    if (!name || !email || !subject || !message || !formMessage) {
      return;
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const nameValue = name.value.trim();
      const emailValue = email.value.trim();
      const subjectValue = subject.value.trim();
      const messageValue = message.value.trim();

      formMessage.textContent = "";

      if (!nameValue || !emailValue || !messageValue) {
        formMessage.textContent = "Vui lòng nhập đầy đủ họ tên, email và nội dung.";
        formMessage.style.color = "#dc2626";
        return;
      }

      if (!isValidEmail(emailValue)) {
        formMessage.textContent = "Email không đúng định dạng.";
        formMessage.style.color = "#dc2626";
        return;
      }

      if (messageValue.length < 10) {
        formMessage.textContent = "Nội dung phải có ít nhất 10 ký tự.";
        formMessage.style.color = "#dc2626";
        return;
      }

      const submitButton = form.querySelector('button[type="submit"]');
      submitButton.disabled = true;
      submitButton.textContent = "Đang gửi...";

      try {
        const response = await fetch("http://localhost:5000/api/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: nameValue,
            email: emailValue,
            subject: subjectValue,
            message: messageValue
          })
        });

        const result = await response.json();

        if (result.success) {
          formMessage.textContent = "Gửi lời nhắn thành công!";
          formMessage.style.color = "#16a34a";
          form.reset();
        } else {
          formMessage.textContent = result.message || "Gửi thất bại.";
          formMessage.style.color = "#dc2626";
        }
      } catch (error) {
        console.error("Submit contact error:", error);
        formMessage.textContent = "Không thể kết nối tới server.";
        formMessage.style.color = "#dc2626";
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Gửi lời nhắn";
      }
    });
  }

  function initRevealAnimation() {
    if (!revealElements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
          }
        });
      },
      { threshold: 0.15 }
    );

    revealElements.forEach((element) => observer.observe(element));
  }

  function initTypingText() {
    if (!typingText) return;

    const roles = [
      "Developer",
      "Project Manager",
      "Frontend Learner",
      "Web Developer"
    ];

    let currentIndex = 0;

    setInterval(() => {
      currentIndex = (currentIndex + 1) % roles.length;
      typingText.style.opacity = "0";

      setTimeout(() => {
        typingText.textContent = roles[currentIndex];
        typingText.style.opacity = "1";
      }, 220);
    }, 2200);
  }

  function setError(input, errorElement, message) {
    input.classList.add("input-error");
    input.classList.remove("input-success");
    errorElement.textContent = message;
  }

  function setSuccess(input, errorElement) {
    input.classList.remove("input-error");
    input.classList.add("input-success");
    errorElement.textContent = "";
  }

  function clearValidationState(input, errorElement) {
    input.classList.remove("input-error");
    input.classList.remove("input-success");
    errorElement.textContent = "";
  }

  function isValidEmail(value) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(value);
  }
  async function loadProjects() {
    const projectsList = document.getElementById("projectsList");
    if (!projectsList) return;

    projectsList.innerHTML = "<p>Đang tải dự án...</p>";

    try {
      const response = await fetch("http://localhost:5000/api/projects");
      const result = await response.json();

      if (!result.success || !Array.isArray(result.data)) {
        projectsList.innerHTML = "<p>Không thể tải danh sách dự án.</p>";
        return;
      }

      if (result.data.length === 0) {
        projectsList.innerHTML = "<p>Chưa có dự án nào.</p>";
        return;
      }

      projectsList.innerHTML = result.data
        .map((project) => {
          return `
          <article class="project-card">
            <div class="project-content">
              <h3 class="project-title">${project.title ?? ""}</h3>
              <p class="project-description">${project.description ?? ""}</p>
              <p class="project-tech">${project.tech_stack ?? ""}</p>

              <div class="project-links">
                ${
            project.github_url
              ? `<a href="${project.github_url}" target="_blank" class="btn btn-outline">GitHub</a>`
              : ""
          }
                ${
            project.demo_url
              ? `<a href="${project.demo_url}" target="_blank" class="btn btn-primary">Demo</a>`
              : ""
          }
              </div>
            </div>
          </article>
        `;
        })
        .join("");

      initProjectFilter();
    } catch (error) {
      console.error("Load projects error:", error);
      projectsList.innerHTML = "<p>Không thể kết nối tới server để tải dự án.</p>";
    }
  }
  async function loadSkills() {
    const skillsList = document.getElementById("skillsList");
    if (!skillsList) return;

    skillsList.innerHTML = "<p>Đang tải kỹ năng...</p>";

    try {
      const response = await fetch("http://localhost:5000/api/skills");
      const result = await response.json();

      if (!result.success || !Array.isArray(result.data)) {
        skillsList.innerHTML = "<p>Không thể tải danh sách kỹ năng.</p>";
        return;
      }

      if (result.data.length === 0) {
        skillsList.innerHTML = "<p>Chưa có kỹ năng nào.</p>";
        return;
      }

      skillsList.innerHTML = result.data
        .map((skill) => {
          return `
          <article class="skill-card">
            <h3 class="skill-name">${skill.name ?? ""}</h3>
            <p class="skill-level">${skill.level ?? ""}</p>
            <p class="skill-category">${skill.category ?? ""}</p>
          </article>
        `;
        })
        .join("");
    } catch (error) {
      console.error("Load skills error:", error);
      skillsList.innerHTML = "<p>Không thể kết nối tới server để tải kỹ năng.</p>";
    }
  }
});


