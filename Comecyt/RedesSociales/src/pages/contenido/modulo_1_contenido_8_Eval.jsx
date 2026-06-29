// src/pages/contenido/modulo_1_contenido_8_Eval.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../Css/modulo_1_contenido_8_Eval.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const MODULO_ID = 1;
const NUM_CONTENIDO = 8;
const EVALUACION_ID = 1;
const MAX_INTENTOS = 5;
const TOTAL_PREGUNTAS = 15;
const APROBADO_MIN_PERCENT = 70;

export default function ContenidoGmailExamenFinal() {
  const [answers, setAnswers] = useState({});
  const [feedback, setFeedback] = useState({});
  const [quizScore, setQuizScore] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState(false);

  const [intentos, setIntentos] = useState(0);
  const [mejorPuntaje, setMejorPuntaje] = useState(0);
  const [aprobado, setAprobado] = useState(false);
  const [estadoMsg, setEstadoMsg] = useState("");
  const [loading, setLoading] = useState(true);

  const [totalContenidos, setTotalContenidos] = useState(8);
  const [modulos, setModulos] = useState([]);

  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "info",
  });

  const navigate = useNavigate();
  const [progresoCargado, setProgresoCargado] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const showToast = (message, type = "info") => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 2500);
  };

  const correctAnswers = {
    q1: "almacenamiento",
    q2: "usuarioDominio",
    q3: "separa",
    q4: "tomlinson",
    q5: "serviciosGoogle",
    q6: "verificacion",
    q7: "fechaNacimiento",
    q8: "pideOtro",
    q9: "bandeja",
    q10: "filtrar",
    q11: "adjuntos",
    q12: "profeAdjuntos",
    q13: "spam",
    q14: "incompleto",
    q15: "ccVisibleCcoOculta",
  };

  useEffect(() => {
    console.log("🔥 SÍ ENTRA AL COMPONENTE Contenido8");
  }, []);

  useEffect(() => {
    const cargarEstadoEvaluacion = async () => {
      try {
        setLoading(true);
        const correo = localStorage.getItem("correo");
        if (!correo) {
          setEstadoMsg("No se encontró usuario. Inicia sesión.");
          setLoading(false);
          return;
        }

        const { data } = await axios.post(
          `${API_URL}/api/alumno/evaluacion/intentos`,
          { correo, evaluacion_id: EVALUACION_ID }
        );

        const resProgreso = await axios.post(`${API_URL}/api/alumno/progreso`, { correo });
        const modulosData = resProgreso.data.modulos || [];
        setModulos(modulosData);

        const datosMod1 = modulosData.find((m) => m.modulo_id === MODULO_ID);
        if (datosMod1) {
          setTotalContenidos(datosMod1.total_contenidos);
        }

        const intentosDB = data.intentos || 0;
        const maxDB = data.max_puntaje || 0;
        const aprobadoDB = !!data.aprobado;

        setIntentos(intentosDB);
        setMejorPuntaje(maxDB);
        setAprobado(aprobadoDB);

        if (aprobadoDB) {
          setEstadoMsg(
            "Ya habías aprobado este examen. Puedes avanzar al siguiente módulo."
          );
        } else if (intentosDB >= MAX_INTENTOS) {
          setEstadoMsg(
            "Has usado tus 5 intentos. Debes repasar el módulo para volver a intentarlo."
          );
        } else {
          setEstadoMsg(
            "Resuelve el examen. Necesitas más de 70% para completar el módulo."
          );
        }
      } catch (err) {
        console.error("Error al cargar estado de la evaluación:", err);
        setEstadoMsg("No se pudo cargar el estado. Usando modo local.");
        setIntentos(0);
        setMejorPuntaje(0);
        setAprobado(false);
      } finally {
        setLoading(false);
      }
    };

    cargarEstadoEvaluacion();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAnswers((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const puedeIntentar = !aprobado && intentos < MAX_INTENTOS;
  const puedeAvanzar = aprobado;

  const handleQuizSubmit = async (e) => {
    e.preventDefault();
    if (!puedeIntentar) return;

    let score = 0;
    const newFeedback = {};

    Object.keys(correctAnswers).forEach((key) => {
      if (answers[key] === correctAnswers[key]) {
        score++;
        newFeedback[key] = "correct";
      } else {
        newFeedback[key] = "incorrect";
      }
    });

    setQuizScore(score);
    setFeedback(newFeedback);
    setQuizAnswered(true);

    const puntajeRaw = score;
    const porcentaje = (score / TOTAL_PREGUNTAS) * 100;

    try {
      const correo = localStorage.getItem("correo");
      if (!correo) {
        showToast("Error: No hay sesión activa", "error");
        return;
      }

      const { data } = await axios.post(
        `${API_URL}/api/alumno/evaluacion/resultado`,
        {
          correo,
          evaluacion_id: EVALUACION_ID,
          puntaje: puntajeRaw,
        }
      );

      setIntentos(data.intentos || intentos + 1);
      setMejorPuntaje(data.max_puntaje || Math.max(mejorPuntaje, puntajeRaw));
      setAprobado(!!data.aprobado);

      // ✅ FIX: Solo marcamos MÓDULO 1 como completado, NO tocamos el 2
      if (data.aprobado || porcentaje >= APROBADO_MIN_PERCENT) {
        await axios.post(`${API_URL}/api/alumno/progreso/actualizar`, {
          correo,
          modulo_id: MODULO_ID,
          progreso_actual: NUM_CONTENIDO
        });

        console.log("💾 Módulo 1 completado al 100%");
        localStorage.setItem("progreso_mod1", "8");

        setAprobado(true);
        setEstadoMsg(
          "🎉 ¡Felicidades! Has aprobado el examen. Completaste el Módulo 1: Correo Electrónico."
        );
        showToast("¡Aprobaste! Módulo 1 completado", "success");
      } else if ((data.intentos || intentos + 1) >= MAX_INTENTOS) {
        setEstadoMsg(
          "Has usado tus 5 intentos sin superar el puntaje mínimo. Debes repasar el módulo."
        );
        showToast("Sin intentos restantes", "error");
      } else {
        setEstadoMsg(
          "Aún puedes volver a intentar el examen para mejorar tu puntaje."
        );
        showToast(`Obtuviste ${score} de ${TOTAL_PREGUNTAS}`, "info");
      }
    } catch (err) {
      console.error("Error al guardar resultado de evaluación:", err);
      setEstadoMsg(
        "Ocurrió un error al guardar tu resultado. Intenta nuevamente."
      );
      showToast("Error al guardar resultado", "error");

      setIntentos(prev => prev + 1);
      setMejorPuntaje(prev => Math.max(prev, score));
      if (porcentaje >= APROBADO_MIN_PERCENT) {
        setAprobado(true);
        localStorage.setItem("progreso_mod1", "8");
      }
    }
  };

  const irAnterior = () => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    navigate("/modulo/1/contenido/7");
  };

  // ✅ FIX: Al terminar el examen, regresa al temario
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
        // Si es el examen del módulo 1, regresa al temario
        if (MODULO_ID === 1 && NUM_CONTENIDO >= totalContenidos) {
          showToast("¡Módulo 1 completado! Ahora puedes iniciar Facebook", "success");
          setTimeout(() => navigate("/contenidos"), 1500);
        } else if (NUM_CONTENIDO >= totalContenidos) {
          navigate("/inicio");
        } else {
          navigate(`/modulo/${MODULO_ID}/contenido/${NUM_CONTENIDO + 1}`);
        }
      } else {
        showToast('Error al guardar progreso. Intenta de nuevo.', 'error');
      }
    } catch (err) {
      console.error("❌ Error al guardar:", err.response?.data || err);
      showToast('Error de conexión al guardar progreso', 'error');
    } finally {
      setGuardando(false);
    }
  };

  const reiniciarModulo = async () => {
    try {
      const correo = localStorage.getItem("correo");
      if (correo) {
        await axios.post(
          `${API_URL}/api/alumno/evaluacion/reiniciar`,
          {
            correo,
            modulo_id: MODULO_ID,
            evaluacion_id: EVALUACION_ID,
          }
        );
        showToast("Evaluación reiniciada", "success");
        setTimeout(() => window.location.reload(), 1000);
      }
    } catch (err) {
      console.error("Error al reiniciar módulo:", err);
      showToast("Error al reiniciar", "error");
    }
  };

  const puntajePorcentaje = (quizScore / TOTAL_PREGUNTAS) * 100;

  if (loading) {
    return <div className="gmail-exam-container"><h2>Cargando examen...</h2></div>;
  }

  return (
    <div className="gmail-exam-container">
      {toast.visible && (
        <div className={`toast toast-${toast.type}`}>{toast.message}</div>
      )}

      <header className="gmail-exam-header">
        <div className="header-inner">
          <div>
            <h1>Examen final: Uso del correo Gmail</h1>
          </div>
        </div>
      </header>

      <section className="intro-card">
        <h2 className="section-title">Instrucciones generales</h2>
        <p>
          Este examen reúne los contenidos más importantes del módulo de Gmail.
          Lee cada pregunta con atención y elige la opción que consideres
          correcta.
        </p>
        <p>
          Dispones de <strong>10 minutos</strong> para contestar todas las
          <strong> {TOTAL_PREGUNTAS} preguntas</strong>. Al finalizar, haz clic en{" "}
          <strong>Calificar</strong> para ver tu puntaje y un mensaje de
          retroalimentación.
        </p>
        <p className="info-intentos">
          Intentos usados: <strong>{intentos}</strong> de {MAX_INTENTOS}. Mejor
          puntaje:{" "}
          <strong>
            {mejorPuntaje} / {TOTAL_PREGUNTAS}
          </strong>{" "}
          ({((mejorPuntaje / TOTAL_PREGUNTAS) * 100).toFixed(0)}%).
        </p>
      </section>

      <section className="quiz">
        <h2 className="section-title inline">
          Examen de conocimientos sobre Gmail
        </h2>

        <form className="quiz-form" onSubmit={handleQuizSubmit}>
          <div className="q">
            <label>
              1) ¿Qué describe mejor el modelo de funcionamiento "almacenamiento
              y reenvío" del correo electrónico?
              <select name="q1" required onChange={handleChange} disabled={quizAnswered}>
                <option value="">Selecciona…</option>
                <option value="directo">
                  El mensaje viaja directo al destinatario sin servidores.
                </option>
                <option value="almacenamiento">
                  El mensaje pasa por servidores que lo guardan temporalmente
                  antes de entregarlo.
                </option>
                <option value="tiempoReal">
                  El mensaje solo se envía si ambos están conectados al mismo
                  tiempo.
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q1 && (
              <p className={`answer-feedback ${feedback.q1}`}>
                {feedback.q1 === "correct"
                  ? "✅ Correcto: el correo se almacena en servidores antes de reenviarse."
                  : "❗ Recuerda que el modelo funciona almacenando temporalmente el mensaje en servidores."}
              </p>
            )}
          </div>

          <div className="q">
            <label>
              2) ¿Cuál es la forma correcta de la estructura de una dirección de
              correo electrónico?
              <select name="q2" required onChange={handleChange} disabled={quizAnswered}>
                <option value="">Selecciona…</option>
                <option value="usuarioNumeros">usuario#dominio</option>
                <option value="usuarioDominio">usuario@dominio</option>
                <option value="dominioUsuario">dominio@usuario</option>
              </select>
            </label>
            {quizAnswered && feedback.q2 && (
              <p className={`answer-feedback ${feedback.q2}`}>
                {feedback.q2 === "correct"
                  ? "✅ Correcto: siempre se usa el formato usuario@dominio."
                  : "❗ Observa que el símbolo @ separa el usuario del dominio."}
              </p>
            )}
          </div>

          <div className="q">
            <label>
              3) ¿Por qué es importante el símbolo @ dentro de una dirección de
              correo?
              <select name="q3" required onChange={handleChange} disabled={quizAnswered}>
                <option value="">Selecciona…</option>
                <option value="resaltarImportante">
                  Marca los mensajes importantes.
                </option>
                <option value="separa">
                  Separa el nombre del usuario del dominio del correo.
                </option>
                <option value="marcaSpam">
                  Indica que el mensaje es spam.
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q3 && (
              <p className={`answer-feedback ${feedback.q3}`}>
                {feedback.q3 === "correct"
                  ? "✅ Correcto: el @ divide la parte local y el dominio."
                  : "❗ El símbolo @ no marca importancia ni spam, separa usuario y dominio."}
              </p>
            )}
          </div>

          <div className="q">
            <label>
              4) ¿Quién envió el primer correo electrónico y en qué año?
              <select name="q4" required onChange={handleChange} disabled={quizAnswered}>
                <option value="">Selecciona…</option>
                <option value="larry">Larry Page, 1999.</option>
                <option value="tomlinson">Ray Tomlinson, 1971.</option>
                <option value="gates">Bill Gates, 1981.</option>
              </select>
            </label>
            {quizAnswered && feedback.q4 && (
              <p className={`answer-feedback ${feedback.q4}`}>
                {feedback.q4 === "correct"
                  ? "✅ Correcto: Ray Tomlinson envió el primer correo en 1971."
                  : "❗ Revisa la historia: fue Ray Tomlinson quien envió el primer correo en 1971."}
              </p>
            )}
          </div>

          <div className="q">
            <label>
              5) ¿Por qué se considera útil crear una cuenta en Gmail según el
              módulo?
              <select name="q5" required onChange={handleChange} disabled={quizAnswered}>
                <option value="">Selecciona…</option>
                <option value="soloCorreo">
                  Solo sirve para enviar y recibir correos.
                </option>
                <option value="serviciosGoogle">
                  Permite acceder también a servicios como Drive, YouTube y
                  Classroom.
                </option>
                <option value="soloRedes">
                  Solo permite usar redes sociales.
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q5 && (
              <p className={`answer-feedback ${feedback.q5}`}>
                {feedback.q5 === "correct"
                  ? "✅ Correcto: una cuenta Gmail abre el acceso a muchos servicios de Google."
                  : "❗ Además del correo, Gmail está conectado con otros servicios como Drive y Classroom."}
              </p>
            )}
          </div>

          <div className="q">
            <label>
              6) ¿Por qué Gmail solicita un número de teléfono al crear una
              cuenta?
              <select name="q6" required onChange={handleChange} disabled={quizAnswered}>
                <option value="">Selecciona…</option>
                <option value="publicidad">Para enviar publicidad por SMS.</option>
                <option value="verificacion">
                  Para verificar la identidad y ayudar a recuperar la cuenta.
                </option>
                <option value="videollamadas">
                  Para activar las videollamadas automáticamente.
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q6 && (
              <p className={`answer-feedback ${feedback.q6}`}>
                {feedback.q6 === "correct"
                  ? "✅ Correcto: el teléfono ayuda a verificar y recuperar la cuenta."
                  : "❗ El número no es para publicidad, sino para seguridad y recuperación."}
              </p>
            )}
          </div>

          <div className="q">
            <label>
              7) ¿Cuál de estas prácticas NO es segura para tu contraseña?
              <select name="q7" required onChange={handleChange} disabled={quizAnswered}>
                <option value="">Selecciona…</option>
                <option value="mezcla">
                  Usar letras, números y símbolos combinados.
                </option>
                <option value="recuperacion">
                  Tener un correo o teléfono de recuperación.
                </option>
                <option value="fechaNacimiento">
                  Usar tu fecha de nacimiento como contraseña.
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q7 && (
              <p className={`answer-feedback ${feedback.q7}`}>
                {feedback.q7 === "correct"
                  ? "✅ Correcto: usar datos obvios como la fecha de nacimiento es inseguro."
                  : "❗ Recuerda que usar datos personales simples hace tu contraseña más fácil de adivinar."}
              </p>
            )}
          </div>

          <div className="q">
            <label>
              8) ¿Qué pasa si el nombre de usuario que eliges en Gmail ya
              existe?
              <select name="q8" required onChange={handleChange} disabled={quizAnswered}>
                <option value="">Selecciona…</option>
                <option value="creaIgual">
                  Gmail lo acepta y crea la cuenta igual.
                </option>
                <option value="pideOtro">
                  Gmail te pedirá elegir otro nombre disponible.
                </option>
                <option value="cancela">
                  Gmail cancela todo el registro.
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q8 && (
              <p className={`answer-feedback ${feedback.q8}`}>
                {feedback.q8 === "correct"
                  ? "✅ Correcto: si el usuario existe, debes elegir uno distinto."
                  : "❗ El nombre de usuario debe ser único; si ya existe, debes cambiarlo."}
              </p>
            )}
          </div>

          <div className="q">
            <label>
              9) ¿Qué función cumple el logo de Gmail en la interfaz principal?
              <select name="q9" required onChange={handleChange} disabled={quizAnswered}>
                <option value="">Selecciona…</option>
                <option value="volver">
                  Botón Atrás del navegador
                </option>
                <option value="logo">
                  Logo de Gmail
                </option>
                <option value="perfil">
                  Perfil de usuario
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q9 && (
              <p className={`answer-feedback ${feedback.q9}`}>
                {feedback.q9 === "correct"
                  ? "✅ Correcto: el logo funciona como botón de inicio hacia la bandeja principal."
                  : "❗ El logo no abre configuraciones; sirve para volver a la vista principal."}
              </p>
            )}
          </div>

          <div className="q">
            <label>
              10) ¿Cuál es una función avanzada de la barra de búsqueda de
              correos?
              <select name="q10" required onChange={handleChange} disabled={quizAnswered}>
                <option value="">Selecciona…</option>
                <option value="abrir-gmail">
                  Abrir directamente la bandeja de entrada
                </option>
                <option value="pagina">
                  Entrar a la página de crear cuenta de Google
                </option>
                <option value="borrar-correos">
                  Borrar correos antiguos primero
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q10 && (
              <p className={`answer-feedback ${feedback.q10}`}>
                {feedback.q10 === "correct"
                  ? "✅ Correcto: la barra de búsqueda permite usar filtros avanzados."
                  : "❗ La barra no borra ni abre pestañas, sirve para búsquedas avanzadas."}
              </p>
            )}
          </div>

          <div className="q">
            <label>
              11) ¿Qué tipo de correos muestra el filtro has:attachment?
              <select name="q11" required onChange={handleChange} disabled={quizAnswered}>
                <option value="">Selecciona…</option>
                <option value="eliminados">Correos eliminados.</option>
                <option value="adjuntos">
                  Correos que tienen archivos adjuntos.
                </option>
                <option value="antiguos">
                  Correos enviados hace más de un mes.
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q11 && (
              <p className={`answer-feedback ${feedback.q11}`}>
                {feedback.q11 === "correct"
                  ? "✅ Correcto: muestra solo los correos que incluyen archivos adjuntos."
                  : "❗ Este filtro no depende de la fecha ni del estado de borrado, solo de los adjuntos."}
              </p>
            )}
          </div>

          <div className="q">
            <label>
              12) ¿Para qué sirve combinar filtros como from:profe has:attachment?
              <select name="q12" required onChange={handleChange} disabled={quizAnswered}>
                <option value="">Selecciona…</option>
                <option value="bloquear">
                  Para bloquear correos de ese remitente.
                </option>
                <option value="profeAdjuntos">
                  Para encontrar correos del profesor que tienen archivos
                  adjuntos.
                </option>
                <option value="ordenarFecha">
                  Para ordenar la bandeja por fecha de envío únicamente.
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q12 && (
              <p className={`answer-feedback ${feedback.q12}`}>
                {feedback.q12 === "correct"
                  ? "✅ Correcto: combinas remitente y presencia de adjuntos para afinar la búsqueda."
                  : "❗ Esa combinación no bloquea ni ordena, solo filtra resultados específicos."}
              </p>
            )}
          </div>

          <div className="q">
            <label>
              13) ¿En qué carpeta se colocan automáticamente los correos
              sospechosos o no deseados?
              <select name="q13" required onChange={handleChange} disabled={quizAnswered}>
                <option value="">Selecciona…</option>
                <option value="enviados">Enviados.</option>
                <option value="spam">Spam.</option>
                <option value="borradores">Borradores.</option>
              </select>
            </label>
            {quizAnswered && feedback.q13 && (
              <p className={`answer-feedback ${feedback.q13}`}>
                {feedback.q13 === "correct"
                  ? "✅ Correcto: los mensajes sospechosos suelen ir a la carpeta Spam."
                  : "❗ Los correos sospechosos no se guardan en Enviados ni Borradores."}
              </p>
            )}
          </div>

          <div className="q">
            <label>
              14) Si un correo queda como borrador, ¿qué significa?
              <select name="q14" required onChange={handleChange} disabled={quizAnswered}>
                <option value="">Selecciona…</option>
                <option value="incompleto">
                  Que está sin terminar y aún no ha sido enviado.
                </option>
                <option value="rechazado">
                  Que el destinatario lo rechazó.
                </option>
                <option value="importante">
                  Que Gmail lo marcó como importante.
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q14 && (
              <p className={`answer-feedback ${feedback.q14}`}>
                {feedback.q14 === "correct"
                  ? "✅ Correcto: los borradores son correos que no se han enviado todavía."
                  : "❗ Un borrador no significa rechazo ni importancia, solo que está pendiente de envío."}
              </p>
            )}
          </div>

          <div className="q">
            <label>
              15) ¿Cuál es la diferencia correcta entre los campos CC y CCO?
              <select name="q15" required onChange={handleChange} disabled={quizAnswered}>
                <option value="">Selecciona…</option>
                <option value="ccVisibleCcoOculta">
                  CC es copia visible; CCO es copia oculta.
                </option>
                <option value="ccOcultaCcoVisible">
                  CC es copia oculta; CCO es copia visible.
                </option>
                <option value="iguales">
                  Ambas opciones funcionan exactamente igual.
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q15 && (
              <p className={`answer-feedback ${feedback.q15}`}>
                {feedback.q15 === "correct"
                  ? "✅ Correcto: CC muestra los destinatarios, CCO los oculta."
                  : "❗ Recuerda: CCO sirve para que otros no vean quién más recibió la copia."}
              </p>
            )}
          </div>

          <button type="submit" className="btn-primary">
            Calificar
          </button>
        </form>

        {quizAnswered && (
          <div className="quiz-result">
            <p>
              Puntaje: <strong>{quizScore} / {TOTAL_PREGUNTAS}</strong>
            </p>
            <p className={puntajePorcentaje >= APROBADO_MIN_PERCENT ? "ok" : "warn"}>
              {puntajePorcentaje >= APROBADO_MIN_PERCENT
                ? "¡Excelente! Manejas muy bien categorías y etiquetas en Gmail."
                : "Puedes repasar las tarjetas del módulo y volver a intentarlo."}
            </p>
          </div>
        )}
      </section>

      <footer className="contenido-footer">
        <div className="avance-mensaje">
          {estadoMsg && <p>{estadoMsg}</p>}
        </div>

        <div className="botones-nav">
          <button className="btn-anterior" onClick={irAnterior}>
            ← Anterior
          </button>
          <button
            className="btn-siguiente"
            onClick={finalizarContenido}
            disabled={guardando || !puedeAvanzar}
          >
            Siguiente →
          </button>
        </div>
      </footer>
    </div>
  );
}
