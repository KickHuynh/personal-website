/**
 * modules/nav.js
 * Mobile menu toggle, scroll-spy active nav link,
 * and header/back-to-top scroll state.
 */

/** Close mobile menu */
function closeMobileMenu(menuToggle, navMenu) {
  navMenu.classList.remove("show");
  menuToggle.classList.remove("active");
  menuToggle.setAttribute("aria-expanded", "false");
}

/**
 * Wire up hamburger menu: toggle, close on link click, close on outside click.
 */
export function initMobileMenu() {
  const menuToggle = document.getElementById("menuToggle");
  const navMenu = document.getElementById("navMenu");
  if (!menuToggle || !navMenu) return;

  menuToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("show");
    menuToggle.classList.toggle("active", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  // Close when any nav link is clicked
  navMenu.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => closeMobileMenu(menuToggle, navMenu));
  });

  // Close when clicking outside the menu or toggle
  document.addEventListener("click", (event) => {
    if (!navMenu.contains(event.target) && !menuToggle.contains(event.target)) {
      closeMobileMenu(menuToggle, navMenu);
    }
  });
}

/**
 * Header shadow + back-to-top button visibility on scroll.
 */
export function initScrollState() {
  const header = document.getElementById("header");
  const backToTop = document.getElementById("backToTop");

  if (backToTop) {
    backToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  const onScroll = () => {
    const y = window.scrollY;
    header?.classList.toggle("scrolled", y > 20);
    backToTop?.classList.toggle("show", y > 300);
  };

  onScroll(); // run on load
  window.addEventListener("scroll", onScroll, { passive: true });
}

/**
 * Highlight the nav link corresponding to the currently visible section.
 */
export function initActiveNavLink() {
  const sections = document.querySelectorAll("main section[id]");
  const navLinks = document.querySelectorAll(".nav-link");
  if (!sections.length || !navLinks.length) return;

  const update = () => {
    let current = "";

    sections.forEach((section) => {
      const top = section.offsetTop - 140;
      if (window.scrollY >= top && window.scrollY < top + section.offsetHeight) {
        current = section.id;
      }
    });

    // Snap to "contact" when at bottom of page
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 5) {
      current = "contact";
    }

    navLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${current}`);
    });
  };

  update();
  window.addEventListener("scroll", update, { passive: true });
}
