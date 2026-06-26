import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

// Determinar la URL de conexión
const connectionString = process.env.DATABASE_URL || "postgresql://agora_comecyt_user:5URTzhfPOCVRfzOjVwJlqRHXbfqsQ7Iq@dpg-d8o67136sc1c73bb6ps0-a/agora_comecyt";

// Configuración del pool de PostgreSQL
const poolConfig = {
  connectionString,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: {
    rejectUnauthorized: false
  }
};

const pgPool = new pg.Pool(poolConfig);

// Función auxiliar para traducir consultas SQL
function translateSqlToPg(sql, values) {
  if (typeof sql !== "string") return { sql, values };

  let pgSql = sql;
  let pgValues = values || [];

  if (
    (pgSql.includes("VALUES?") || pgSql.includes("VALUES ?")) &&
    Array.isArray(pgValues) &&
    pgValues.length === 1 &&
    Array.isArray(pgValues[0]) &&
    Array.isArray(pgValues[0][0])
  ) {
    const rows = pgValues[0];
    const flatValues = [];
    const valuePlaceholders = [];
    let paramIndex = 1;

    for (const row of rows) {
      const rowPlaceholders = [];
      for (const val of row) {
        flatValues.push(val);
        rowPlaceholders.push(`$${paramIndex++}`);
      }
      valuePlaceholders.push(`(${rowPlaceholders.join(", ")})`);
    }

    pgSql = pgSql.replace(/VALUES\s*\?/i, "VALUES " + valuePlaceholders.join(", "));
    pgValues = flatValues;
  } else {
    if (Array.isArray(pgValues) && pgValues.length > 0) {
      let index = 1;
      pgSql = pgSql.replace(/\?/g, () => `$${index++}`);
    }
  }

  if (/foreign_key_checks/i.test(pgSql)) pgSql = "SELECT 1";

  if (/insert\s+ignore\s+into/i.test(pgSql)) {
    pgSql = pgSql.replace(/insert\s+ignore\s+into/i, "INSERT INTO");
    if (!/on\s+conflict/i.test(pgSql)) pgSql = pgSql.trim().replace(/;+$/, "") + " ON CONFLICT DO NOTHING";
  }

  if (/on\s+duplicate\s+key\s+update/i.test(pgSql)) {
    if (/progreso_modulos/i.test(pgSql)) {
      pgSql = pgSql.replace(
        /on\s+duplicate\s+key\s+update[\s\S]+/i,
        /VALUES\(progreso_actual\)/i.test(pgSql) 
          ? "ON CONFLICT (correo, modulo_id) DO UPDATE SET progreso_actual = EXCLUDED.progreso_actual, fecha_actualizacion = CURRENT_TIMESTAMP"
          : "ON CONFLICT (correo, modulo_id) DO UPDATE SET progreso_actual = EXCLUDED.progreso_actual"
      );
    }
  }

  if (/^\s*insert\s+/i.test(pgSql) && !/returning/i.test(pgSql)) {
    pgSql = pgSql.trim().replace(/;+$/, "") + " RETURNING *";
  }

  return { sql: pgSql, values: pgValues };
}

function wrapResult(res) {
  const rows = res.rows || [];
  rows.affectedRows = res.rowCount || 0;
  rows.insertId = (res.rows && res.rows.length > 0) ? Number(res.rows[0].id || res.rows[0][Object.keys(res.rows[0]).find(k => k.endsWith("_id"))] || 0) : 0;
  return [rows, res.fields];
}

export const pool = {
  query: async (sql, values) => {
    const q = (typeof sql === "object") ? { text: sql.text, values: sql.values } : translateSqlToPg(sql, values);
    const res = await pgPool.query(q.sql, q.values);
    return wrapResult(res);
  },
  execute: async (sql, values) => pool.query(sql, values),
  getConnection: async () => {
    const client = await pgPool.connect();
    return {
      query: async (sql, values) => wrapResult(await client.query(translateSqlToPg(sql, values).sql, translateSqlToPg(sql, values).values)),
      execute: async (sql, values) => pool.getConnection().then(c => c.query(sql, values)),
      beginTransaction: async () => await client.query("BEGIN"),
      commit: async () => await client.query("COMMIT"),
      rollback: async () => await client.query("ROLLBACK"),
      release: () => client.release()
    };
  },
  end: async () => await pgPool.end()
};

pgPool.connect().then(c => { console.log("✅ Conectado a Postgres"); c.release(); }).catch(e => console.error("❌ Error:", e.message));
