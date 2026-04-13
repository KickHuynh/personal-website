const pool = require("../config/db");

const getAllProjects = async () => {
  const sql = `
    SELECT id, title, description, tech_stack, github_url, demo_url, image_url, created_at
    FROM projects
    ORDER BY created_at DESC
  `;
  const [rows] = await pool.query(sql);
  return rows;
};

const getProjectById = async (id) => {
  const sql = `
    SELECT id, title, description, tech_stack, github_url, demo_url, image_url, created_at
    FROM projects
    WHERE id = ?
      LIMIT 1
  `;
  const [rows] = await pool.query(sql, [id]);
  return rows[0];
};

const createProject = async ({
                               title,
                               description,
                               tech_stack,
                               github_url,
                               demo_url,
                               image_url
                             }) => {
  const sql = `
    INSERT INTO projects (title, description, tech_stack, github_url, demo_url, image_url)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  const [result] = await pool.query(sql, [
    title,
    description,
    tech_stack,
    github_url,
    demo_url,
    image_url
  ]);

  return result;
};

const updateProjectById = async (
  id,
  { title, description, tech_stack, github_url, demo_url, image_url }
) => {
  const sql = `
    UPDATE projects
    SET title = ?, description = ?, tech_stack = ?, github_url = ?, demo_url = ?, image_url = ?
    WHERE id = ?
  `;

  const [result] = await pool.query(sql, [
    title,
    description,
    tech_stack,
    github_url,
    demo_url,
    image_url,
    id
  ]);

  return result;
};

const deleteProjectById = async (id) => {
  const sql = `DELETE FROM projects WHERE id = ?`;
  const [result] = await pool.query(sql, [id]);
  return result;
};

module.exports = {
  getAllProjects,
  getProjectById,
  createProject,
  updateProjectById,
  deleteProjectById
};
