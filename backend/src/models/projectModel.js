const pool = require("../config/db");

const PROJECT_FIELDS = `
  id,
  slug,
  title,
  description,
  case_study_summary,
  role,
  team_size,
  duration,
  problem,
  solution,
  impact,
  architecture,
  tech_stack,
  github_url,
  demo_url,
  image_url,
  gallery_json,
  challenges_json,
  learnings_json,
  featured,
  status,
  sort_order,
  created_at,
  updated_at
`;

const listProjects = async ({ includeDrafts = false } = {}) => {
  const whereClause = includeDrafts ? "" : "WHERE status = 'published'";
  const sql = `
    SELECT ${PROJECT_FIELDS}
    FROM projects
    ${whereClause}
    ORDER BY featured DESC, sort_order ASC, created_at DESC
  `;
  const [rows] = await pool.query(sql);
  return rows;
};

const getProjectById = async (id) => {
  const sql = `
    SELECT ${PROJECT_FIELDS}
    FROM projects
    WHERE id = ?
    LIMIT 1
  `;
  const [rows] = await pool.query(sql, [id]);
  return rows[0];
};

const getProjectBySlug = async (slug, { includeDrafts = false } = {}) => {
  const draftClause = includeDrafts ? "" : "AND status = 'published'";
  const sql = `
    SELECT ${PROJECT_FIELDS}
    FROM projects
    WHERE slug = ?
    ${draftClause}
    LIMIT 1
  `;
  const [rows] = await pool.query(sql, [slug]);
  return rows[0];
};

const createProject = async ({
  title,
  slug,
  description,
  case_study_summary,
  role,
  team_size,
  duration,
  problem,
  solution,
  impact,
  architecture,
  tech_stack,
  github_url,
  demo_url,
  image_url,
  gallery_json,
  challenges_json,
  learnings_json,
  featured,
  status,
  sort_order,
}) => {
  const sql = `
    INSERT INTO projects (
      title,
      slug,
      description,
      case_study_summary,
      role,
      team_size,
      duration,
      problem,
      solution,
      impact,
      architecture,
      tech_stack,
      github_url,
      demo_url,
      image_url,
      gallery_json,
      challenges_json,
      learnings_json,
      featured,
      status,
      sort_order
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const [result] = await pool.query(sql, [
    title,
    slug,
    description,
    case_study_summary,
    role,
    team_size,
    duration,
    problem,
    solution,
    impact,
    architecture,
    tech_stack,
    github_url,
    demo_url,
    image_url,
    gallery_json,
    challenges_json,
    learnings_json,
    featured,
    status,
    sort_order,
  ]);

  return result;
};

const updateProjectById = async (
  id,
  {
    title,
    slug,
    description,
    case_study_summary,
    role,
    team_size,
    duration,
    problem,
    solution,
    impact,
    architecture,
    tech_stack,
    github_url,
    demo_url,
    image_url,
    gallery_json,
    challenges_json,
    learnings_json,
    featured,
    status,
    sort_order,
  }
) => {
  const sql = `
    UPDATE projects
    SET
      title = ?,
      slug = ?,
      description = ?,
      case_study_summary = ?,
      role = ?,
      team_size = ?,
      duration = ?,
      problem = ?,
      solution = ?,
      impact = ?,
      architecture = ?,
      tech_stack = ?,
      github_url = ?,
      demo_url = ?,
      image_url = ?,
      gallery_json = ?,
      challenges_json = ?,
      learnings_json = ?,
      featured = ?,
      status = ?,
      sort_order = ?
    WHERE id = ?
  `;

  const [result] = await pool.query(sql, [
    title,
    slug,
    description,
    case_study_summary,
    role,
    team_size,
    duration,
    problem,
    solution,
    impact,
    architecture,
    tech_stack,
    github_url,
    demo_url,
    image_url,
    gallery_json,
    challenges_json,
    learnings_json,
    featured,
    status,
    sort_order,
    id,
  ]);

  return result;
};

const updateProjectStatusById = async (id, status) => {
  const sql = `
    UPDATE projects
    SET status = ?
    WHERE id = ?
  `;

  const [result] = await pool.query(sql, [status, id]);
  return result;
};

const updateProjectFeaturedById = async (id, featured) => {
  const sql = `
    UPDATE projects
    SET featured = ?
    WHERE id = ?
  `;

  const [result] = await pool.query(sql, [featured ? 1 : 0, id]);
  return result;
};

const deleteProjectById = async (id) => {
  const sql = `DELETE FROM projects WHERE id = ?`;
  const [result] = await pool.query(sql, [id]);
  return result;
};

module.exports = {
  listProjects,
  getProjectById,
  getProjectBySlug,
  createProject,
  updateProjectById,
  updateProjectStatusById,
  updateProjectFeaturedById,
  deleteProjectById,
};
