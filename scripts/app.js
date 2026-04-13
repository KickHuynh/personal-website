/**
 * app.js — Portfolio main entry point
 *
 * Tất cả logic đã được tách ra các modules:
 *   modules/theme.js        — dark/light mode
 *   modules/nav.js          — mobile menu, scroll spy, back-to-top
 *   modules/reveal.js       — scroll reveal animation, typing text
 *   modules/projects.js     — load + render projects (API + static fallback)
 *   modules/skills.js       — load + render skills (API + static fallback)
 *   modules/contact-form.js — form validation + submission
 *
 * File này chỉ làm một việc: import và khởi động các module trên.
 */

import { initTheme }        from "./modules/theme.js";
import { initMobileMenu, initScrollState, initActiveNavLink } from "./modules/nav.js";
import { initRevealAnimation, initTypingText }                from "./modules/reveal.js";
import { initProjects }     from "./modules/projects.js";
import { initSkills }       from "./modules/skills.js";
import { initContactForm }  from "./modules/contact-form.js";

document.addEventListener("DOMContentLoaded", () => {
  // Set footer year
  const yearEl = document.getElementById("currentYear");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Init all features
  initTheme();
  initMobileMenu();
  initScrollState();
  initActiveNavLink();
  initRevealAnimation();
  initTypingText();
  initContactForm();

  // Async data loading (non-blocking)
  initProjects();
  initSkills();
});
