const pool = require("../config/db");

const findUserByEmail = async (email) => {
  const sql = `
    SELECT id, full_name, email, password, role
    FROM users
    WHERE email = ?
    LIMIT 1
  `;

  const [rows] = await pool.query(sql, [email]);
  return rows[0];
};

module.exports = {
  findUserByEmail
};
