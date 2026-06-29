import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

export const pool = mysql.createPool({
  host: process.env.MYSQLHOST,
  port: process.env.MYSQLPORT,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Probar conexión
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log("✅ Conectado a MySQL Railway");
    conn.release();
  } catch (err) {
    console.error("❌ Error conectando a MySQL");
    console.error(err);
  }
})();
