import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// En tu archivo config/database.js
export const pool = mysql.createPool({
  host: process.env.MYSQLHOST,
  port: process.env.MYSQLPORT,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: 'railway', // <--- CAMBIA ESTO por el nombre real de tu base de datos
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
