import { ENABLE_STATIC_FALLBACK } from "../config.js";
import { apiUrl, requestJson } from "./http.js";

const STATIC_DATA_URL = "./data/projects.json";

function slugify(value) {
  return String(value ?? "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function normalizeArray(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value !== "string") return [];

  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeProject(project) {
  return {
    id: project.id,
    slug: project.slug || slugify(project.title),
    title: project.title || "",
    short_description: project.short_description || project.description || "",
    case_study_summary: project.case_study_summary || "",
    role: project.role || "",
    team_size: project.team_size || "",
    duration: project.duration || "",
    problem: project.problem || "",
    solution: project.solution || "",
    impact: project.impact || "",
    architecture: project.architecture || "",
    tech_stack: project.tech_stack || "",
    github_url: project.github_url || "",
    demo_url: project.demo_url || "",
    image_url: project.image_url || "",
    gallery: normalizeArray(project.gallery),
    challenges: normalizeArray(project.challenges),
    learnings: normalizeArray(project.learnings),
    featured: Boolean(project.featured),
    status: project.status || "published",
    sort_order: Number(project.sort_order) || 0,
    created_at: project.created_at || "",
    updated_at: project.updated_at || "",
  };
}

async function fetchProjectsFromApi() {
  const result = await requestJson(apiUrl("/projects"));
  return Array.isArray(result?.data) ? result.data.map(normalizeProject) : [];
}

async function fetchProjectBySlugFromApi(slug) {
  const result = await requestJson(apiUrl(`/projects/slug/${encodeURIComponent(slug)}`));
  return normalizeProject(result?.data);
}

async function fetchProjectsFromStatic() {
  const response = await fetch(STATIC_DATA_URL);
  if (!response.ok) {
    throw new Error(`Khong tim thay static data: ${response.status}`);
  }

  const data = await response.json();
  return Array.isArray(data) ? data.map(normalizeProject) : [];
}

export async function loadProjectsData() {
  try {
    return await fetchProjectsFromApi();
  } catch (error) {
    if (!ENABLE_STATIC_FALLBACK) throw error;
    console.warn("[projects-data] API unavailable, using static fallback:", error.message);
    return fetchProjectsFromStatic();
  }
}

export async function loadProjectBySlug(slug) {
  try {
    return await fetchProjectBySlugFromApi(slug);
  } catch (error) {
    if (!ENABLE_STATIC_FALLBACK) throw error;
    console.warn("[projects-data] Detail API unavailable, using static fallback:", error.message);
    const projects = await fetchProjectsFromStatic();
    const project = projects.find((item) => item.slug === slug);

    if (!project) {
      throw new Error("Khong tim thay case study");
    }

    return project;
  }
}
