export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function renderParagraphs(value, className = "") {
  const content = String(value ?? "").trim();
  if (!content) return "";

  return content
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p class="${className}">${escapeHtml(paragraph)}</p>`)
    .join("");
}

export function renderTextList(items, className = "") {
  if (!Array.isArray(items) || items.length === 0) return "";

  return `
    <ul class="${className}">
      ${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
    </ul>
  `;
}

export function renderTechChips(value) {
  const items = String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (!items.length) return "";

  return `
    <div class="tech-chip-list">
      ${items.map((item) => `<span class="tech-chip">${escapeHtml(item)}</span>`).join("")}
    </div>
  `;
}
