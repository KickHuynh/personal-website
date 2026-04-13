const bcrypt = require("bcryptjs");
const pool = require("./src/config/db");

async function createAdmin() {
  try {
    const fullName = "Huynh Ngoc Tai";
    const email = "huynhngoctai205@gmail.com";
    const plainPassword = "admin123";

    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const sql = `
      INSERT INTO users (full_name, email, password, role)
      VALUES (?, ?, ?, ?)
    `;

    const [result] = await pool.query(sql, [
      fullName,
      email,
      hashedPassword,
      "admin"
    ]);

    console.log("Tạo admin thành công:", result.insertId);
    process.exit();
  } catch (error) {
    console.error("Lỗi tạo admin:", error.message);
    process.exit(1);
  }
}

createAdmin();
