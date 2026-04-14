import { initTheme } from "./modules/theme.js";
import { initMobileMenu, initScrollState, initActiveNavLink } from "./modules/nav.js";
import { initRevealAnimation, initTypingText } from "./modules/reveal.js";
import { initProjects } from "./modules/projects.js";
import { initSkills } from "./modules/skills.js";
import { initContactForm } from "./modules/contact-form.js";
import { trackPageView } from "./modules/analytics.js";

document.addEventListener("DOMContentLoaded", () => {
  const yearEl = document.getElementById("currentYear");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  initTheme();
  initMobileMenu();
  initScrollState();
  initActiveNavLink();
  initRevealAnimation();
  initTypingText();
  initContactForm();
  initProjects();
  initSkills();
  trackPageView(window.location.pathname || "/");
});
