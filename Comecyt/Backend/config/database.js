import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

export const pool = mysql.createPool({
  host: process.env.DB_HOST || process.env.MYSQLHOST || 'localhost',
  port: process.env.DB_PORT || process.env.MYSQLPORT || 3306,
  user: process.env.DB_USER || process.env.MYSQLUSER || 'root',
  password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : (process.env.MYSQLPASSWORD || ''),
  database: process.env.DB_NAME || 'bd_comecyt',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Probar conexión
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log("✅ Conectado a MySQL local en phpMyAdmin");
    conn.release();
  } catch (err) {
    console.error("❌ Error conectando a MySQL");
    console.error(err);
  }
})();