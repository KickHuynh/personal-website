import { initMobileMenu, initScrollState } from "./modules/nav.js";
import { initProjectDetailPage } from "./modules/project-detail.js";
import { initRevealAnimation } from "./modules/reveal.js";
import { initTheme } from "./modules/theme.js";

document.addEventListener("DOMContentLoaded", async () => {
  const yearEl = document.getElementById("currentYear");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  initTheme();
  initMobileMenu();
  initScrollState();
  await initProjectDetailPage();
  initRevealAnimation();
});
