const pool = require("../config/db");

const createMessage = async ({ name, email, subject, message }) => {
  const sql = `
    INSERT INTO messages (name, email, subject, message)
    VALUES (?, ?, ?, ?)
  `;

  const [result] = await pool.query(sql, [name, email, subject, message]);
  return result;
};

const getAllMessages = async () => {
  const sql = `
    SELECT id, name, email, subject, message, created_at
    FROM messages
    ORDER BY created_at DESC
  `;

  const [rows] = await pool.query(sql);
  return rows;
};

const deleteMessageById = async (id) => {
  const sql = `DELETE FROM messages WHERE id = ?`;
  const [result] = await pool.query(sql, [id]);
  return result;
};

module.exports = {
  createMessage,
  getAllMessages,
  deleteMessageById
};
