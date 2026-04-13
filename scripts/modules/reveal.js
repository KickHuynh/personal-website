/**
 * modules/reveal.js
 * Scroll-triggered reveal animation (IntersectionObserver)
 * and typing text animation in the hero section.
 */

/**
 * Observe .reveal elements and add `.active` class when they enter viewport.
 * Each element is unobserved after animating — no repeated triggers.
 */
export function initRevealAnimation() {
  const elements = document.querySelectorAll(".reveal");
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
          observer.unobserve(entry.target); // animate once
        }
      });
    },
    { threshold: 0.15 }
  );

  elements.forEach((el) => observer.observe(el));
}

/**
 * Cycle through role strings in the hero typing element with a fade transition.
 * Reads target element by id="typingText".
 */
export function initTypingText() {
  const el = document.getElementById("typingText");
  if (!el) return;

  const roles = [
    "Developer",
    "Project Manager",
    "Frontend Learner",
    "Web Developer",
  ];

  let index = 0;

  setInterval(() => {
    index = (index + 1) % roles.length;
    el.style.opacity = "0";

    setTimeout(() => {
      el.textContent = roles[index];
      el.style.opacity = "1";
    }, 250);
  }, 2400);
}
