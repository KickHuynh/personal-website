function toCleanString(value) {
  if (value == null) return "";
  return String(value).trim();
}

function slugify(value) {
  return toCleanString(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function parseLines(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => toCleanString(item))
      .filter(Boolean);
  }

  return toCleanString(value)
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseJsonArray(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => toCleanString(item))
      .filter(Boolean);
  }

  if (typeof value !== "string" || value.trim() === "") {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => toCleanString(item))
        .filter(Boolean);
    }
  } catch {
    // Fallback to newline-separated input.
  }

  return parseLines(value);
}

function serializeJsonArray(value) {
  return JSON.stringify(parseJsonArray(value));
}

function normalizeFeatured(value) {
  return value === true || value === "true" || value === 1 || value === "1" ? 1 : 0;
}

function normalizeSortOrder(value) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : 0;
}

function normalizeStatus(value) {
  return value === "draft" ? "draft" : "published";
}

function normalizeProjectPayload(body) {
  const title = toCleanString(body.title);
  const shortDescription = toCleanString(body.short_description || body.description);
  const slug = slugify(body.slug || title);

  return {
    title,
    slug,
    description: shortDescription,
    case_study_summary: toCleanString(body.case_study_summary),
    role: toCleanString(body.role),
    team_size: toCleanString(body.team_size),
    duration: toCleanString(body.duration),
    problem: toCleanString(body.problem),
    solution: toCleanString(body.solution),
    impact: toCleanString(body.impact),
    architecture: toCleanString(body.architecture),
    tech_stack: toCleanString(body.tech_stack),
    github_url: toCleanString(body.github_url),
    demo_url: toCleanString(body.demo_url),
    image_url: toCleanString(body.image_url),
    gallery_json: serializeJsonArray(body.gallery),
    challenges_json: serializeJsonArray(body.challenges),
    learnings_json: serializeJsonArray(body.learnings),
    featured: normalizeFeatured(body.featured),
    status: normalizeStatus(body.status),
    sort_order: normalizeSortOrder(body.sort_order),
  };
}

function formatProjectRecord(record) {
  if (!record) return null;

  return {
    id: record.id,
    slug: record.slug || slugify(record.title || ""),
    title: record.title || "",
    short_description: record.description || "",
    case_study_summary: record.case_study_summary || "",
    role: record.role || "",
    team_size: record.team_size || "",
    duration: record.duration || "",
    problem: record.problem || "",
    solution: record.solution || "",
    impact: record.impact || "",
    architecture: record.architecture || "",
    tech_stack: record.tech_stack || "",
    github_url: record.github_url || "",
    demo_url: record.demo_url || "",
    image_url: record.image_url || "",
    gallery: parseJsonArray(record.gallery_json),
    challenges: parseJsonArray(record.challenges_json),
    learnings: parseJsonArray(record.learnings_json),
    featured: Boolean(record.featured),
    status: record.status || "published",
    sort_order: Number(record.sort_order) || 0,
    created_at: record.created_at,
    updated_at: record.updated_at,
  };
}

module.exports = {
  formatProjectRecord,
  normalizeProjectPayload,
  slugify,
};
