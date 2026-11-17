// src/pages/contenido/modulo_1_contenido_29.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../Css/modulo_4_contenido_8_Eval.css";

const API_URL = "http://localhost:4000";
const MODULO_ID = 4;
const NUM_CONTENIDO = 8;
const EVALUACION_ID = 4;
const MAX_INTENTOS = 2;
const TOTAL_PREGUNTAS = 15;
const APROBADO_MIN_PERCENT = 70;

export default function ExamenInstagramModulo4() {
  const navigate = useNavigate();
  const [progresoCargado, setProgresoCargado] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [answers, setAnswers] = useState({});
  const [feedback, setFeedback] = useState({});
  const [quizScore, setQuizScore] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState(false);

  const [intentos, setIntentos] = useState(0);
  const [mejorPuntaje, setMejorPuntaje] = useState(0);
  const [aprobado, setAprobado] = useState(false);
  const [estadoMsg, setEstadoMsg] = useState("");

  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "info",
  });

  const [tiempoRestante, setTiempoRestante] = useState(120);
  const [timerTerminado, setTimerTerminado] = useState(false);
  const [scrolledBottom, setScrolledBottom] = useState(false);
  const [gated, setGated] = useState(true);
  const [progreso, setProgreso] = useState(0);

  // ✅ CAMBIO 1: States nuevos para el fix
  const [totalContenidos, setTotalContenidos] = useState(29);
  const [modulos, setModulos] = useState([]);

  useEffect(() => {
    console.log("🔥 SÍ ENTRA AL COMPONENTE Contenido29 - Examen Final");
  }, []);

  const showToast = (message, type = "info") => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast((t) => ({ ...t, visible: false }));
    }, 2500);
  };

  const correctAnswers = {
    q1: "feedPublico",
    q2: "story24",
    q3: "mejoresAmigos",
    q4: "reelsDesc",
    q5: "dmSolicitudes",
    q6: "hashtagTema",
    q7: "lugaresLocal",
    q8: "recomendacionesInteraccion",
    q9: "interaccionAlgoritmo",
    q10: "profesionalHerramientas",
    q11: "businessInsights",
    q12: "shoppingCatalogo",
    q13: "comentariosFiltro",
    q14: "restringirDiscreto",
    q15: "2faCapaExtra",
  };

  // ✅ CAMBIO 2: useEffect modificado con setModulos y setTotalContenidos
  useEffect(() => {
    const cargarEstado = async () => {
      try {
        const correo = localStorage.getItem("correo");
        if (!correo) {
          setProgresoCargado(true);
          return;
        }

        // Cargar progreso general
        const respProgreso = await axios.post(
          `${API_URL}/api/alumno/progreso`,
          { correo }
        );
        const modulosData = respProgreso.data.modulos || [];
        setModulos(modulosData); // 👈 NUEVO

        const modulo = modulosData.find((m) => m.modulo_id === MODULO_ID);
        if (modulo) {
          setTotalContenidos(modulo.total_contenidos); // 👈 NUEVO
          const p = Number(modulo?.progreso_actual ?? 0);
          setProgreso(p);

          if (p >= NUM_CONTENIDO) {
            setGated(false);
            setTimerTerminado(true);
            setScrolledBottom(true);
          } else {
            setGated(true);
          }
        }

        // Cargar estado del examen
        const { data } = await axios.post(
          `${API_URL}/api/alumno/evaluacion/intentos`,
          { correo, evaluacion_id: EVALUACION_ID }
        );

        setIntentos(data.intentos || 0);
        setMejorPuntaje(data.max_puntaje || 0);
        setAprobado(!!data.aprobado);

        if (data.aprobado) {
          setEstadoMsg("✅ Ya aprobaste este examen. Puedes generar tu certificado.");
        } else if (data.intentos >= MAX_INTENTOS) {
          setEstadoMsg("❌ Has agotado tus intentos. Debes repasar el contenido.");
        } else {
          setEstadoMsg("Resuelve el examen. Necesitas al menos 70% para aprobar.");
        }
      } catch (err) {
        console.error(err);
        showToast("Error al cargar estado del examen", "error");
      } finally {
        setProgresoCargado(true);
      }
    };

    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    cargarEstado();
  }, []);

  useEffect(() => {
    if (!progresoCargado) return;

    if (gated) {
      setTiempoRestante(120);
      setTimerTerminado(false);
    } else {
      setTiempoRestante(0);
      setTimerTerminado(true);
      setScrolledBottom(true);
      return;
    }

    const interval = setInterval(() => {
      setTiempoRestante((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimerTerminado(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gated, progresoCargado]);

  useEffect(() => {
    if (!gated) return;

    const handleScroll = () => {
      const scrollPosition = window.innerHeight + window.scrollY;
      const pageHeight = document.documentElement.offsetHeight;
      if (scrollPosition >= pageHeight - 80) setScrolledBottom(true);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [gated]);

  const puedeIntentar = !aprobado && intentos < MAX_INTENTOS;

  const formatearTiempo = (segundos) => {
    const m = Math.floor(segundos / 60);
    const s = segundos % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAnswers((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!puedeIntentar) return;

    setGuardando(true);
    let score = 0;
    const newFeedback = {};

    Object.keys(correctAnswers).forEach((k) => {
      if (answers[k] === correctAnswers[k]) {
        score++;
        newFeedback[k] = "correct";
      } else {
        newFeedback[k] = "incorrect";
      }
    });

    setQuizScore(score);
    setFeedback(newFeedback);
    setQuizAnswered(true);

    try {
      const correo = localStorage.getItem("correo");
      const { data } = await axios.post(
        `${API_URL}/api/alumno/evaluacion/guardar`,
        {
          correo,
          evaluacion_id: EVALUACION_ID,
          puntaje: score,
        }
      );

      setIntentos(data.intentos);
      setMejorPuntaje(data.max_puntaje);
      setAprobado(!!data.aprobado);

      if (data.aprobado) {
        setEstadoMsg("🎉 ¡Examen aprobado!");
        showToast("Examen aprobado. Ya puedes generar tu certificado.", "success");
      } else {
        showToast("Examen registrado. Puedes intentar de nuevo.", "info");
      }
    } catch (err) {
      console.error(err);
      showToast("Error al guardar examen", "error");
    } finally {
      setGuardando(false);
    }
  };

  // 🔙 Anterior
  const irAnterior = () => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    navigate("/modulo/1/contenido/28"); // ✅ Va al contenido 28
  };

  // ✅ CAMBIO 3: Función generarCertificado con guard y states
  const generarCertificado = async () => {
    if (!aprobado) return;

    setGuardando(true);
    try {
      // Si es el último contenido del módulo, marcamos el módulo como completado
      const correo = localStorage.getItem("correo");
      if (NUM_CONTENIDO >= totalContenidos && correo) {
        console.log('✅ Módulo completado al aprobar examen');

        // Actualizar progreso al máximo
        await axios.post(
          `${API_URL}/api/alumno/progreso/actualizar`,
          {
            correo,
            modulo_id: MODULO_ID,
            progreso_actual: NUM_CONTENIDO,
          }
        );
      }

      navigate("/generar-certificado");
    } catch (err) {
      console.error("Error al marcar módulo completado:", err);
      navigate("/generar-certificado"); // Aún así navegamos
    } finally {
      setGuardando(false);
    }
  };

  if (!progresoCargado) {
    return (
      <div className="igFinal-container">
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '1.2rem',
          color: '#833ab4'
        }}>
          <p>Cargando examen...</p>
        </div>
      </div>
    );
  }



  const finalizarContenido = async () => {
    if (!puedeAvanzar) return;
    setGuardando(true);
    const correo = localStorage.getItem("correo");
    const token = localStorage.getItem("token");

    try {
      const response = await axios.post(
        `${API_URL}/api/alumno/progreso/actualizar`,
        { correo, modulo_id: MODULO_ID, progreso_actual: NUM_CONTENIDO },
        token ? { headers: { Authorization: `Bearer ${token}` } } : {}
      );

      if (response.data?.success) {
        window.scrollTo(0, 0);
        // si es el último contenido, vuelve al inicio
        if (NUM_CONTENIDO >= totalContenidos) {
          navigate("/inicio");
        } else {
          navigate(`/modulo/${MODULO_ID}/contenido/${NUM_CONTENIDO + 1}`);
        }
      } else {
        setToast('Error al guardar progreso. Intenta de nuevo.');
        setTimeout(() => setToast(""), 3000);
      }
    } catch (err) {
      console.error("❌ Error al guardar:", err.response?.data || err);
      setToast('Error de conexión al guardar progreso');
      setTimeout(() => setToast(""), 3000);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="igFinal-container">
      {toast.visible && (
        <div className={`toast toast-${toast.type}`}>{toast.message}</div>
      )}

      <header className="igFinal-header">
        <div className="igFinal-header-inner">
          <h1>Examen Final – Instagram</h1>
        </div>
      </header>

      <section className="intro-card">
        <h2 className="section-title">
          <span className="section-number">8.1</span>
          Instrucciones generales
        </h2>
        <p>{estadoMsg}</p>
        <p className="info-intentos">
          Intentos usados: <strong>{intentos}</strong> de {MAX_INTENTOS}. Mejor
          puntaje: <strong>{mejorPuntaje} / {TOTAL_PREGUNTAS}</strong>
        </p>
      </section>

      <section className="quiz">
        <h2 className="section-title inline">
          <span className="section-number">8.2</span>
          Examen de conocimientos sobre Instagram
        </h2>

        <form className="quiz-form" onSubmit={handleSubmit}>
          <div className={`q ${quizAnswered ? feedback.q1 || "" : ""}`}>
            <label>
              <span className="question-text">
                1) ¿Qué característica diferencia principalmente una publicación del <strong>feed</strong> frente a una Story?
              </span>
              <select name="q1" required onChange={handleChange} disabled={!puedeIntentar}>
                <option value="">Selecciona…</option>
                <option value="feedPublico">El feed queda visible en el perfil (hasta que la borres), la Story es temporal.</option>
                <option value="feed24">El feed dura 24 horas y luego se borra automáticamente.</option>
                <option value="feedSinTexto">En el feed no se permite texto ni descripción.</option>
              </select>
            </label>
            {quizAnswered && feedback.q1 && (
              <p className={`answer-feedback ${feedback.q1}`}>
                {feedback.q1 === "correct" ? "✅ Correcto." : "❗ Recuerda: el feed es más permanente, Stories son temporales."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q2 || "" : ""}`}>
            <label>
              <span className="question-text">
                2) ¿Cuál es el comportamiento típico de una <strong>Story</strong> si no la destacas?
              </span>
              <select name="q2" required onChange={handleChange} disabled={!puedeIntentar}>
                <option value="">Selecciona…</option>
                <option value="story24">Se elimina/oculta para el público después de 24 horas.</option>
                <option value="storyForever">Se queda fija en el perfil para siempre.</option>
                <option value="storySoloDM">Solo se puede ver por DM.</option>
              </select>
            </label>
            {quizAnswered && feedback.q2 && (
              <p className={`answer-feedback ${feedback.q2}`}>
                {feedback.q2 === "correct" ? "✅ Correcto." : "❗ Las Stories normalmente duran 24 horas."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q3 || "" : ""}`}>
            <label>
              <span className="question-text">
                3) Si quieres compartir una Story solo con ciertas personas, ¿qué opción es la más adecuada?
              </span>
              <select name="q3" required onChange={handleChange} disabled={!puedeIntentar}>
                <option value="">Selecciona…</option>
                <option value="mejoresAmigos">Usar “Mejores amigos” (lista) o excluir personas específicas.</option>
                <option value="hashtags">Usar hashtags para limitar el alcance.</option>
                <option value="shopping">Activar Shopping.</option>
              </select>
            </label>
            {quizAnswered && feedback.q3 && (
              <p className={`answer-feedback ${feedback.q3}`}>
                {feedback.q3 === "correct" ? "✅ Correcto." : "❗ La privacidad de Stories se controla con “Mejores amigos” o exclusiones."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q4 || "" : ""}`}>
            <label>
              <span className="question-text">
                4) ¿Qué describe mejor a los <strong>Reels</strong> en Instagram?
              </span>
              <select name="q4" required onChange={handleChange} disabled={!puedeIntentar}>
                <option value="">Selecciona…</option>
                <option value="reelsDesc">Videos cortos pensados para descubrimiento, con audio/efectos y alcance potencial mayor.</option>
                <option value="reelsSoloFoto">Solo permiten fotografías sin música.</option>
                <option value="reelsSoloPrivado">Solo pueden verlos tus seguidores aprobados aunque seas cuenta pública.</option>
              </select>
            </label>
            {quizAnswered && feedback.q4 && (
              <p className={`answer-feedback ${feedback.q4}`}>
                {feedback.q4 === "correct" ? "✅ Correcto." : "❗ Reels se enfocan en video corto y descubrimiento."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q5 || "" : ""}`}>
            <label>
              <span className="question-text">
                5) ¿Qué pasa con los mensajes de alguien que <strong>no te sigue</strong> (en muchos casos)?
              </span>
              <select name="q5" required onChange={handleChange} disabled={!puedeIntentar}>
                <option value="">Selecciona…</option>
                <option value="dmSolicitudes">Llegan como solicitudes de mensaje (no entran directo a tu bandeja principal).</option>
                <option value="dmPublico">Se publican automáticamente en tu perfil.</option>
                <option value="dmBloqueo">Instagram lo bloquea siempre sin avisar.</option>
              </select>
            </label>
            {quizAnswered && feedback.q5 && (
              <p className={`answer-feedback ${feedback.q5}`}>
                {feedback.q5 === "correct" ? "✅ Correcto." : "❗ Normalmente llegan como solicitudes para que tú decidas."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q6 || "" : ""}`}>
            <label>
              <span className="question-text">
                6) ¿Para qué sirve un <strong>hashtag</strong> usado correctamente?
              </span>
              <select name="q6" required onChange={handleChange} disabled={!puedeIntentar}>
                <option value="">Selecciona…</option>
                <option value="hashtagTema">Para clasificar el contenido por tema y facilitar que otros lo encuentren.</option>
                <option value="hashtagPrivado">Para que solo tus amigos puedan ver la publicación.</option>
                <option value="hashtagSinAlcance">No influye en búsqueda ni descubrimiento.</option>
              </select>
            </label>
            {quizAnswered && feedback.q6 && (
              <p className={`answer-feedback ${feedback.q6}`}>
                {feedback.q6 === "correct" ? "✅ Correcto." : "❗ Hashtags ayudan a descubrimiento y clasificación."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q7 || "" : ""}`}>
            <label>
              <span className="question-text">
                7) ¿Qué beneficio práctico tiene buscar por <strong>lugar</strong> (ubicación)?
              </span>
              <select name="q7" required onChange={handleChange} disabled={!puedeIntentar}>
                <option value="">Selecciona…</option>
                <option value="lugaresLocal">Ver contenido de una zona y descubrir negocios/eventos locales.</option>
                <option value="lugaresBorrar">Borrar publicaciones de otros usuarios.</option>
                <option value="lugares2fa">Activar autenticación en dos pasos.</option>
              </select>
            </label>
            {quizAnswered && feedback.q7 && (
              <p className={`answer-feedback ${feedback.q7}`}>
                {feedback.q7 === "correct" ? "✅ Correcto." : "❗ Buscar por lugar ayuda a descubrir contenido local."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q8 || "" : ""}`}>
            <label>
              <span className="question-text">
                8) ¿En qué se basan muchas <strong>recomendaciones</strong> de Instagram (Explorar/Reels)?
              </span>
              <select name="q8" required onChange={handleChange} disabled={!puedeIntentar}>
                <option value="">Selecciona…</option>
                <option value="recomendacionesInteraccion">En tu interacción: lo que ves, guardas, comentas, sigues y el tiempo que pasas mirando.</option>
                <option value="recomendacionesAleatorio">Es completamente aleatorio.</option>
                <option value="recomendacionesSoloPago">Solo recomienda contenido pagado.</option>
              </select>
            </label>
            {quizAnswered && feedback.q8 && (
              <p className={`answer-feedback ${feedback.q8}`}>
                {feedback.q8 === "correct" ? "✅ Correcto." : "❗ Las recomendaciones dependen mucho de tu interacción."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q9 || "" : ""}`}>
            <label>
              <span className="question-text">
                9) ¿Qué acción suele indicar mayor “interés” al algoritmo: <strong>dar like</strong> o <strong>guardar</strong>?
              </span>
              <select name="q9" required onChange={handleChange} disabled={!puedeIntentar}>
                <option value="">Selecciona…</option>
                <option value="interaccionAlgoritmo">Guardar (y compartir) suele indicar interés más fuerte que solo un like.</option>
                <option value="interaccionLike">Like siempre vale más que guardar.</option>
                <option value="interaccionNoImporta">Ninguna interacción importa.</option>
              </select>
            </label>
            {quizAnswered && feedback.q9 && (
              <p className={`answer-feedback ${feedback.q9}`}>
                {feedback.q9 === "correct" ? "✅ Correcto." : "❗ Guardar/compartir suele ser una señal más fuerte."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q10 || "" : ""}`}>
            <label>
              <span className="question-text">
                10) ¿Qué ventaja real tiene cambiar a una cuenta <strong>profesional</strong> (creador/empresa)?
              </span>
              <select name="q10" required onChange={handleChange} disabled={!puedeIntentar}>
                <option value="">Selecciona…</option>
                <option value="profesionalHerramientas">Acceso a herramientas como estadísticas (insights), botones de contacto y opciones de negocio.</option>
                <option value="profesionalPrivada">Obliga a que tu cuenta sea privada.</option>
                <option value="profesionalSinDM">Desactiva completamente los mensajes.</option>
              </select>
            </label>
            {quizAnswered && feedback.q10 && (
              <p className={`answer-feedback ${feedback.q10}`}>
                {feedback.q10 === "correct" ? "✅ Correcto." : "❗ Las cuentas profesionales dan herramientas extra."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q11 || "" : ""}`}>
            <label>
              <span className="question-text">
                11) ¿Qué te permiten ver los <strong>Insights</strong> (estadísticas) en cuentas profesionales?
              </span>
              <select name="q11" required onChange={handleChange} disabled={!puedeIntentar}>
                <option value="">Selecciona…</option>
                <option value="businessInsights">Alcance, interacción, visitas al perfil, y datos generales de audiencia.</option>
                <option value="businessContraseñas">Contraseñas de tus seguidores.</option>
                <option value="businessBorrar">Borrar contenido de otros usuarios.</option>
              </select>
            </label>
            {quizAnswered && feedback.q11 && (
              <p className={`answer-feedback ${feedback.q11}`}>
                {feedback.q11 === "correct" ? "✅ Correcto." : "❗ Insights muestra métricas, no datos sensibles."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q12 || "" : ""}`}>
            <label>
              <span className="question-text">
                12) ¿Qué describe mejor <strong>Instagram Shopping</strong>?
              </span>
              <select name="q12" required onChange={handleChange} disabled={!puedeIntentar}>
                <option value="">Selecciona…</option>
                <option value="shoppingCatalogo">Permite etiquetar productos y conectarlos a un catálogo para facilitar compras/consulta.</option>
                <option value="shoppingDM">Solo sirve para enviar DMs automáticos.</option>
                <option value="shoppingPrivacidad">Es una opción de privacidad para ocultar historias.</option>
              </select>
            </label>
            {quizAnswered && feedback.q12 && (
              <p className={`answer-feedback ${feedback.q12}`}>
                {feedback.q12 === "correct" ? "✅ Correcto." : "❗ Shopping está relacionado con catálogo/productos."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q13 || "" : ""}`}>
            <label>
              <span className="question-text">
                13) Para reducir comentarios ofensivos, ¿qué combinación es la más efectiva?
              </span>
              <select name="q13" required onChange={handleChange} disabled={!puedeIntentar}>
                <option value="">Selecciona…</option>
                <option value="comentariosFiltro">Filtros automáticos + lista de palabras ocultas + control de quién puede comentar.</option>
                <option value="comentariosReels">Solo ver Reels y no publicar.</option>
                <option value="comentariosHashtag">Agregar más hashtags.</option>
              </select>
            </label>
            {quizAnswered && feedback.q13 && (
              <p className={`answer-feedback ${feedback.q13}`}>
                {feedback.q13 === "correct" ? "✅ Correcto." : "❗ La clave está en filtros + palabras + permisos."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q14 || "" : ""}`}>
            <label>
              <span className="question-text">
                14) ¿Qué opción es más “discreta” para controlar a alguien sin que lo note fácilmente?
              </span>
              <select name="q14" required onChange={handleChange} disabled={!puedeIntentar}>
                <option value="">Selecciona…</option>
                <option value="restringirDiscreto">Restringir (sus comentarios pueden ocultarse y los mensajes ir a solicitudes).</option>
                <option value="restringirDiscretoNo">Bloquear (corta todo contacto de forma evidente).</option>
                <option value="restringirDiscretoIgual">No hay diferencia entre restringir y bloquear.</option>
              </select>
            </label>
            {quizAnswered && feedback.q14 && (
              <p className={`answer-feedback ${feedback.q14}`}>
                {feedback.q14 === "correct" ? "✅ Correcto." : "❗ Restringir es la opción discreta."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q15 || "" : ""}`}>
            <label>
              <span className="question-text">
                15) ¿Por qué la <strong>autenticación en dos pasos (2FA)</strong> mejora la seguridad?
              </span>
              <select name="q15" required onChange={handleChange} disabled={!puedeIntentar}>
                <option value="">Selecciona…</option>
                <option value="2faCapaExtra">Porque exige un código extra además de la contraseña, reduciendo riesgo de acceso no autorizado.</option>
                <option value="2faCapaExtraNo">Porque hace tu perfil más bonito.</option>
                <option value="2faCapaExtraIgual">Porque elimina mensajes spam automáticamente.</option>
              </select>
            </label>
            {quizAnswered && feedback.q15 && (
              <p className={`answer-feedback ${feedback.q15}`}>
                {feedback.q15 === "correct" ? "✅ Correcto." : "❗ 2FA agrega una capa extra para iniciar sesión."}
              </p>
            )}
          </div>

          <button type="submit" className="btn-primary" disabled={!puedeIntentar || guardando}>
            {guardando ? "Guardando..." : "Calificar"}
          </button>
        </form>

        {quizAnswered && (
          <div className="quiz-result">
            <p>
              Puntaje: <strong>{quizScore} / {TOTAL_PREGUNTAS}</strong>
            </p>
            <p className={quizScore >= 5 ? "ok" : "warn"}>
              {quizScore >= 5
                ? "¡Excelente! Ya sabes proteger tu cuenta. 🔒✨"
                : "Vas bien. Revisa las tarjetas donde tuviste dudas y vuelve a intentar."}
            </p>
          </div>
        )}
      </section>

      <footer className="contenido-footer">
        <div className="avance-mensaje">
          <p>✅ Este es el último contenido del Módulo 1.</p>
          {aprobado && (
            <p>🎓 Ya puedes generar tu certificado de aprobación.</p>
          )}
        </div>

        <div className="botones-nav">
          <button className="btn-anterior" onClick={irAnterior}>← Anterior</button>
          <button
            className={`btn-siguiente ${!aprobado || guardando ? "btn-siguiente-locked" : ""}`}
            onClick={finalizarContenido}
            disabled={guardando || !puedeAvanzar}
          >
            {guardando ? "Guardando..." : aprobado ? "🎓 Generar Certificado" : "Certificado 🔒"}
          </button>
        </div>
      </footer>
    </div>
  );
}