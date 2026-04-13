/**
 * modules/theme.js
 * Dark / light theme toggle with localStorage persistence.
 */

const THEME_KEY = "theme";

/** Apply theme class and update icon */
function applyTheme(isDark) {
  document.body.classList.toggle("dark", isDark);
  updateIcon(isDark);
}

/** Swap moon ↔ sun icon and aria-label on the toggle button */
function updateIcon(isDark) {
  const btn = document.getElementById("themeToggle");
  if (!btn) return;

  const icon = btn.querySelector("i");
  if (icon) {
    icon.className = isDark ? "fa-solid fa-sun" : "fa-solid fa-moon";
  }
  btn.setAttribute(
    "aria-label",
    isDark ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"
  );
}

/**
 * Initialize theme from localStorage and wire up toggle button.
 */
export function initTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);
  applyTheme(savedTheme === "dark");

  const btn = document.getElementById("themeToggle");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const isDark = document.body.classList.toggle("dark");
    localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
    updateIcon(isDark);
  });
}
