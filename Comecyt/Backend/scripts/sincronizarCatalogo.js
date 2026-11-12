import { pool } from "../config/database.js";
import { catalogo, coincideTitulo } from "../services/catalogo.js";

const aplicar = process.argv.includes("--aplicar");
let db;
try {
  const alcance = process.argv.find(arg => arg.startsWith("--modulo="));
  const ids = alcance ? new Set(alcance.slice("--modulo=".length).split(",").map(Number)) : null;
  const seleccion = ids ? catalogo.filter(modulo => ids.has(modulo.id)) : catalogo;
  if (ids && seleccion.length !== ids.size) throw new Error("Alguno de los módulos indicados no existe en el catálogo.");

  db = await pool.getConnection();
  await db.beginTransaction();
  const [actuales] = await db.query(`
    SELECT modulo_id, titulo, total_contenidos FROM MODULO ORDER BY modulo_id${aplicar ? " FOR UPDATE" : ""}
  `);
  const idsDefinidos = new Set(catalogo.map(modulo => modulo.id));

  for (const modulo of seleccion) {
    const actual = actuales.find(item => item.modulo_id === modulo.id);
    const corresponde = item => coincideTitulo(modulo, item.titulo);
    if (actual && !corresponde(actual)) {
      throw new Error(`El ID ${modulo.id} ya corresponde a «${actual.titulo}» en MySQL.`);
    }
    const duplicado = actuales.find(item => item.modulo_id !== modulo.id && corresponde(item));
    if (duplicado) {
      throw new Error(`«${modulo.titulo}» ya usa el ID ${duplicado.modulo_id} en MySQL.`);
    }

    const [lecciones] = await db.query(
      "SELECT numero FROM CONTENIDO WHERE modulo_id = ?", [modulo.id]
    );
    const numeros = new Set(lecciones.map(leccion => leccion.numero));
    if (numeros.size !== lecciones.length || [...numeros].some(numero => numero < 1 || numero > modulo.lecciones.length)) {
      throw new Error(`El módulo ${modulo.id} tiene números de lección duplicados o fuera del catálogo.`);
    }

    console.log(`${modulo.id}. ${modulo.titulo} | ${numeros.size}/${modulo.lecciones.length} lecciones registradas`);
    if (!aplicar) continue;
    if (!actual) {
      await db.query("INSERT INTO MODULO (modulo_id, titulo, descripcion, total_contenidos) VALUES (?, ?, ?, ?)",
        [modulo.id, modulo.titulo, modulo.descripcion, modulo.lecciones.length]);
    } else if (actual.total_contenidos !== modulo.lecciones.length || actual.titulo !== modulo.titulo) {
      await db.query("UPDATE MODULO SET titulo = ?, total_contenidos = ? WHERE modulo_id = ?",
        [modulo.titulo, modulo.lecciones.length, modulo.id]);
    }

    for (const [indice, leccion] of modulo.lecciones.entries()) {
      const numero = indice + 1;
      if (numeros.has(numero)) continue;
      await db.query("INSERT INTO CONTENIDO (modulo_id, numero, titulo, tipo) VALUES (?, ?, ?, ?)",
        [modulo.id, numero, leccion.nombre, leccion.evaluacion ? "evaluacion" : "contenido"]);
    }
  }

  // Las evaluaciones antiguas envían identificadores fijos desde sus componentes.
  const [evaluaciones] = await db.query("SELECT evaluacion_id, modulo_id, puntaje FROM EVALUACION WHERE evaluacion_id BETWEEN 1 AND 4");
  for (const modulo of seleccion.filter(item => item.id <= 4)) {
    const evaluacion = evaluaciones.find(item => item.evaluacion_id === modulo.id);
    if (evaluacion && evaluacion.modulo_id !== modulo.id) {
      throw new Error(`La evaluación ${evaluacion.evaluacion_id} pertenece al módulo ${evaluacion.modulo_id}.`);
    }
    if (evaluacion && evaluacion.puntaje !== 15) {
      throw new Error(`La evaluación ${evaluacion.evaluacion_id} tiene un puntaje máximo distinto de 15.`);
    }
    if (!evaluacion && aplicar) {
      const leccion = modulo.lecciones.find(item => item.evaluacion);
      await db.query("INSERT INTO EVALUACION (evaluacion_id, modulo_id, titulo, puntaje) VALUES (?, ?, ?, ?)",
        [modulo.id, modulo.id, leccion.nombre, 15]);
    }
  }

  for (const modulo of seleccion) {
    for (const leccion of modulo.lecciones.filter(item => item.puntajeMaximo)) {
      const [filas] = await db.query("SELECT titulo, puntaje FROM EVALUACION WHERE modulo_id = ?", [modulo.id]);
      if (filas.length && (filas.length !== 1 || filas[0].titulo !== leccion.nombre || filas[0].puntaje !== leccion.puntajeMaximo)) {
        throw new Error(`La evaluación registrada para el módulo ${modulo.id} difiere del catálogo.`);
      }
      if (!filas.length && aplicar) {
        await db.query("INSERT INTO EVALUACION (modulo_id, titulo, puntaje) VALUES (?, ?, ?)",
          [modulo.id, leccion.nombre, leccion.puntajeMaximo]);
      }
    }
  }

  for (const item of actuales.filter(item => !idsDefinidos.has(item.modulo_id))) {
    console.log(`ID ocupado fuera del catálogo React: ${item.modulo_id} (${item.titulo})`);
  }
  if (aplicar) await db.commit();
  else await db.rollback();
  console.log(aplicar ? "Catálogo sincronizado." : "Revisión de catálogo completada.");
} catch (error) {
  if (db) await db.rollback();
  console.error(error.message);
  process.exitCode = 1;
} finally {
  db?.release();
  await pool.end();
}
