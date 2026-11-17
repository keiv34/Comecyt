import { catalogo } from "./catalogo.js";
import { evaluacionGuiada, MINIMO_APROBACION } from "./evaluacionesGuiadas.js";

export const MINIMO_EVALUACION_CLASICA = 70;

export async function modulosAprobados(db, alumnoId) {
  const [resultados] = await db.query(`
    SELECT e.evaluacion_id, e.modulo_id, e.titulo, e.puntaje AS maximo, MAX(r.puntaje) AS mejor
    FROM RESULTADO r JOIN EVALUACION e ON e.evaluacion_id = r.evaluacion_id
    WHERE r.alumno_id = ?
    GROUP BY e.evaluacion_id, e.modulo_id, e.titulo, e.puntaje
  `, [alumnoId]);

  return new Set(catalogo.filter(modulo => {
    if (!modulo.lecciones.some(leccion => leccion.evaluacion)) return true;
    const examen = evaluacionGuiada(modulo.id);
    return resultados.some(resultado => {
      if (resultado.modulo_id !== modulo.id || resultado.maximo <= 0) return false;
      if (examen) {
        return resultado.titulo === examen.nombre && resultado.maximo === examen.puntajeMaximo &&
          resultado.mejor >= MINIMO_APROBACION;
      }
      return resultado.evaluacion_id === modulo.id &&
        resultado.mejor * 100 >= MINIMO_EVALUACION_CLASICA * resultado.maximo;
    });
  }).map(modulo => modulo.id));
}
