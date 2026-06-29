import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

// Determinar la URL de conexión (usa la del .env o la predeterminada de Render)
const connectionString = process.env.DATABASE_URL || "postgresql://agora_comecyt_user:5URTzhfPOCVRfzOjVwJlqRHXbfqsQ7Iq@dpg-d8o67136sc1c73bb6ps0-a/agora_comecyt";

// Configuración del pool de PostgreSQL
const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000, // Aumentado a 5s para evitar timeouts en Railway
  ssl: {
    rejectUnauthorized: false // <--- Forzamos esto siempre para entornos cloud
  }
};

// Usar SSL en entornos externos como Railway o Render
const isProduction = process.env.NODE_ENV === "production";
const needsSsl = isProduction || connectionString.includes(".render.com") || connectionString.includes(".railway.internal");

if (needsSsl) {
  poolConfig.ssl = {
    rejectUnauthorized: false
  };
}

const pgPool = new pg.Pool(poolConfig);

// Función auxiliar para traducir consultas SQL de formato MySQL a PostgreSQL
function translateSqlToPg(sql, values) {
  if (typeof sql !== "string") return { sql, values };

  let pgSql = sql;
  let pgValues = values || [];

  // 1. Traducción de Inserts Bulk/Múltiples (ej. VALUES? con arreglos anidados)
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
    // 2. Traducción estándar de placeholders (? -> $1, $2, etc.)
    if (Array.isArray(pgValues) && pgValues.length > 0) {
      let index = 1;
      pgSql = pgSql.replace(/\?/g, () => `$${index++}`);
    }
  }

  // 3. MySQL SET FOREIGN_KEY_CHECKS a no-op en PostgreSQL
  if (/foreign_key_checks/i.test(pgSql)) {
    pgSql = "SELECT 1";
  }

  // 4. Traducción de INSERT IGNORE a ON CONFLICT DO NOTHING
  if (/insert\s+ignore\s+into/i.test(pgSql)) {
    pgSql = pgSql.replace(/insert\s+ignore\s+into/i, "INSERT INTO");
    if (!/on\s+conflict/i.test(pgSql)) {
      pgSql = pgSql.trim().replace(/;+$/, "") + " ON CONFLICT DO NOTHING";
    }
  }

  // 5. Traducción de ON DUPLICATE KEY UPDATE a ON CONFLICT DO UPDATE SET
  if (/on\s+duplicate\s+key\s+update/i.test(pgSql)) {
    if (/progreso_modulos/i.test(pgSql)) {
      if (/VALUES\(progreso_actual\)/i.test(pgSql)) {
        pgSql = pgSql.replace(
          /on\s+duplicate\s+key\s+update[\s\S]+/i,
          "ON CONFLICT (correo, modulo_id) DO UPDATE SET progreso_actual = EXCLUDED.progreso_actual, fecha_actualizacion = CURRENT_TIMESTAMP"
        );
      } else {
        pgSql = pgSql.replace(
          /on\s+duplicate\s+key\s+update[\s\S]+/i,
          "ON CONFLICT (correo, modulo_id) DO UPDATE SET progreso_actual = EXCLUDED.progreso_actual"
        );
      }
    }
  }

  // 6. Agregar RETURNING * a consultas INSERT para obtener el insertId
  if (/^\s*insert\s+/i.test(pgSql) && !/returning/i.test(pgSql)) {
    pgSql = pgSql.trim().replace(/;+$/, "") + " RETURNING *";
  }

  return { sql: pgSql, values: pgValues };
}

// Envuelve el resultado de pg para imitar el formato [rows, fields] de mysql2
function wrapResult(res) {
  const rows = res.rows || [];
  
  // Agregar propiedades de metadatos para compatibilidad
  rows.affectedRows = res.rowCount || 0;
  
  if (res.rows && res.rows.length > 0) {
    const firstRow = res.rows[0];
    const idKey = Object.keys(firstRow).find(key => key === "id" || key.endsWith("_id"));
    if (idKey) {
      rows.insertId = Number(firstRow[idKey]);
    } else {
      rows.insertId = 0;
    }
  } else {
    rows.insertId = 0;
  }
  
  return [rows, res.fields];
}

// Exportación del objeto pool compatible
export const pool = {
  query: async function (sql, values) {
    let queryText = sql;
    let queryParams = values;
    if (typeof sql === "object" && sql !== null) {
      queryText = sql.text;
      queryParams = sql.values;
    }

    const { sql: pgSql, values: pgValues } = translateSqlToPg(queryText, queryParams);
    
    console.log(`[PG-DB] Ejecutando pool.query:\n  Original: ${queryText}\n  Traducido: ${pgSql}`);
    if (pgValues.length > 0) {
      console.log(`  Parámetros:`, pgValues);
    }

    const res = await pgPool.query(pgSql, pgValues);
    return wrapResult(res);
  },
  
  execute: async function (sql, values) {
    return this.query(sql, values);
  },

  getConnection: async function () {
    console.log(`[PG-DB] Obteniendo conexión del cliente...`);
    const client = await pgPool.connect();
    
    return {
      query: async function (sql, values) {
        const { sql: pgSql, values: pgValues } = translateSqlToPg(sql, values);
        console.log(`[PG-DB] Ejecutando client.query:\n  Original: ${sql}\n  Traducido: ${pgSql}`);
        if (pgValues.length > 0) {
          console.log(`  Parámetros:`, pgValues);
        }
        const res = await client.query(pgSql, pgValues);
        return wrapResult(res);
      },
      execute: async function (sql, values) {
        return this.query(sql, values);
      },
      beginTransaction: async function () {
        console.log(`[PG-DB] Transacción: BEGIN`);
        await client.query("BEGIN");
      },
      commit: async function () {
        console.log(`[PG-DB] Transacción: COMMIT`);
        await client.query("COMMIT");
      },
      rollback: async function () {
        console.log(`[PG-DB] Transacción: ROLLBACK`);
        await client.query("ROLLBACK");
      },
      release: function () {
        console.log(`[PG-DB] Liberando conexión de cliente...`);
        client.release();
      }
    };
  },

  end: async function () {
    console.log(`[PG-DB] Cerrando el pool...`);
    await pgPool.end();
  }
};

// Probar conexión al iniciar
pgPool.connect()
  .then(client => {
    console.log(`✅ [PG-DB] Conectado exitosamente a PostgreSQL (Render)`);
    client.release();
  })
  .catch(err => {
    console.error("❌ [PG-DB] ERROR DE CONEXIÓN A POSTGRESQL:");
    console.error("❌ [PG-DB] Código:", err.code);
    console.error("❌ [PG-DB] Mensaje:", err.message);
  });
