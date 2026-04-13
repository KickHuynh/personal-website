const pool = require("../config/db");

const getAllSkills = async () => {
  const sql = `
    SELECT id, name, level, category, created_at
    FROM skills
    ORDER BY created_at DESC
  `;
  const [rows] = await pool.query(sql);
  return rows;
};

const getSkillById = async (id) => {
  const sql = `
    SELECT id, name, level, category, created_at
    FROM skills
    WHERE id = ?
    LIMIT 1
  `;
  const [rows] = await pool.query(sql, [id]);
  return rows[0];
};

const createSkill = async ({ name, level, category }) => {
  const sql = `
    INSERT INTO skills (name, level, category)
    VALUES (?, ?, ?)
  `;
  const [result] = await pool.query(sql, [name, level, category]);
  return result;
};

const updateSkillById = async (id, { name, level, category }) => {
  const sql = `
    UPDATE skills
    SET name = ?, level = ?, category = ?
    WHERE id = ?
  `;
  const [result] = await pool.query(sql, [name, level, category, id]);
  return result;
};

const deleteSkillById = async (id) => {
  const sql = `DELETE FROM skills WHERE id = ?`;
  const [result] = await pool.query(sql, [id]);
  return result;
};

module.exports = {
  getAllSkills,
  getSkillById,
  createSkill,
  updateSkillById,
  deleteSkillById
};
