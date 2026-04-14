const pool = require("../config/db");

const createMessage = async ({ name, email, subject, message }) => {
  const sql = `
    INSERT INTO messages (name, email, subject, message, is_read)
    VALUES (?, ?, ?, ?, 0)
  `;

  const [result] = await pool.query(sql, [name, email, subject, message]);
  return result;
};

const getAllMessages = async () => {
  const sql = `
    SELECT id, name, email, subject, message, is_read, read_at, created_at
    FROM messages
    ORDER BY is_read ASC, created_at DESC
  `;

  const [rows] = await pool.query(sql);
  return rows;
};

const getMessageById = async (id) => {
  const sql = `
    SELECT id, name, email, subject, message, is_read, read_at, created_at
    FROM messages
    WHERE id = ?
    LIMIT 1
  `;

  const [rows] = await pool.query(sql, [id]);
  return rows[0];
};

const updateMessageReadState = async (id, isRead) => {
  const sql = `
    UPDATE messages
    SET is_read = ?, read_at = CASE WHEN ? = 1 THEN NOW() ELSE NULL END
    WHERE id = ?
  `;

  const [result] = await pool.query(sql, [isRead ? 1 : 0, isRead ? 1 : 0, id]);
  return result;
};

const getUnreadCount = async () => {
  const sql = `
    SELECT COUNT(*) AS unread_count
    FROM messages
    WHERE is_read = 0
  `;

  const [[row]] = await pool.query(sql);
  return Number(row.unread_count) || 0;
};

const deleteMessageById = async (id) => {
  const sql = `DELETE FROM messages WHERE id = ?`;
  const [result] = await pool.query(sql, [id]);
  return result;
};

module.exports = {
  createMessage,
  getAllMessages,
  getMessageById,
  updateMessageReadState,
  getUnreadCount,
  deleteMessageById,
};
