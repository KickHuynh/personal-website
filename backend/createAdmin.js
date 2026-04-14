const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const pool = require("./src/config/db");

dotenv.config();

async function createAdmin() {
  try {
    const fullName = process.env.ADMIN_FULL_NAME;
    const email = process.env.ADMIN_EMAIL;
    const plainPassword = process.env.ADMIN_PASSWORD;

    if (!fullName || !email || !plainPassword) {
      throw new Error("Thieu ADMIN_FULL_NAME, ADMIN_EMAIL hoac ADMIN_PASSWORD trong .env");
    }

    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    const sql = `
      INSERT INTO users (full_name, email, password, role)
      VALUES (?, ?, ?, ?)
    `;

    const [result] = await pool.query(sql, [
      fullName,
      email,
      hashedPassword,
      "admin",
    ]);

    console.log("Tao admin thanh cong:", result.insertId);
    process.exit();
  } catch (error) {
    console.error("Loi tao admin:", error.message);
    process.exit(1);
  }
}

createAdmin();
