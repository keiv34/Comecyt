// src/pages/contenido/modulo_1_contenido_14_Eval.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../Css/modulo_2_contenido_6_Eval.css";

const API_URL = "https://backend-production-0a25.up.railway.app";
const MODULO_ID = 2; // ✅ CORREGIDO: Era 1, ahora 2 porque es Facebook
const NUM_CONTENIDO = 6; // ✅ CORREGIDO: Ajusta según cuántos contenidos tiene el módulo 2
const EVALUACION_ID = 2; // ⚠️ ajusta este ID según tu BD
const MAX_INTENTOS = 2;
const TOTAL_PREGUNTAS = 15;
const APROBADO_MIN_PERCENT = 70;
const SIGUIENTE_MODULO_ID = 3;
const PRIMER_CONTENIDO_SIGUIENTE_MODULO = 1; // ✅ Ajusta según tu estructura

export default function ContenidoFacebookExamenFinal() {
  const [answers, setAnswers] = useState({});
  const [feedback, setFeedback] = useState({});
  const [quizScore, setQuizScore] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState(false);

  const [intentos, setIntentos] = useState(0);
  const [mejorPuntaje, setMejorPuntaje] = useState(0);
  const [aprobado, setAprobado] = useState(false);
  const [estadoMsg, setEstadoMsg] = useState("");
  const [loading, setLoading] = useState(true);

  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "info",
  });

  const [totalContenidos, setTotalContenidos] = useState(8);
  const [modulos, setModulos] = useState([]);

  const navigate = useNavigate();
  const [progresoCargado, setProgresoCargado] = useState(false);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    console.log("🔥 SÍ ENTRA AL COMPONENTE Contenido14");
  }, []);

  const showToast = (message, type = "info") => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast((t) => ({ ...t, visible: false }));
    }, 2500);
  };

  const correctAnswers = {
    q1: "paginaOrganizacion",
    q2: "grupoComunidadPrivacidad",
    q3: "eventoRecordatorio",
    q4: "privacidadQuienVe",
    q5: "marketplaceLocal",
    q6: "filtroUbicacionPrecio",
    q7: "favoritosLista",
    q8: "anuncioCompleto",
    q9: "rolesPagina",
    q10: "mensajesNegociacion",
    q11: "soloConocidos",
    q12: "recuperacionOficial",
    q13: "configPublicoAmigosSoloYo",
    q14: "reportarSospechoso",
    q15: "diferenciaPerfilPagina",
  };

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
            "Has usado tus dos intentos. Debes repasar el módulo para volver a intentarlo."
          );
        } else {
          setEstadoMsg(
            "Resuelve el examen. Necesitas más de 70% para desbloquear el siguiente módulo."
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
        setProgresoCargado(true);
      }
    };

    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    cargarEstadoEvaluacion();
  }, []);

  useEffect(() => {
    const fetchModulos = async () => {
      try {
        const correo = localStorage.getItem("correo");
        if (!correo) return;

        const resp = await axios.post(
          `${API_URL}/api/alumno/progreso`,
          { correo }
        );
        const modulosData = resp.data.modulos || [];
        setModulos(modulosData);

        const moduloActual = modulosData.find(
          (m) => m.modulo_id === MODULO_ID
        );

        if (moduloActual) {
          setTotalContenidos(moduloActual.total_contenidos);
        }
      } catch (err) {
        console.error("Error obteniendo módulos:", err);
      }
    };

    fetchModulos();
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
    const porcentaje = (puntajeRaw / TOTAL_PREGUNTAS) * 100;

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

      if (data.aprobado || porcentaje >= APROBADO_MIN_PERCENT) {
        await axios.post(`${API_URL}/api/alumno/progreso/actualizar`, {
          correo,
          modulo_id: MODULO_ID,
          progreso_actual: NUM_CONTENIDO
        });

        await axios.post(`${API_URL}/api/alumno/progreso/actualizar`, {
          correo,
          modulo_id: SIGUIENTE_MODULO_ID,
          progreso_actual: 0
        });

        console.log("💾 Módulo 2 completado y Módulo 3 desbloqueado");
        localStorage.setItem("progreso_mod2", String(NUM_CONTENIDO));
        localStorage.setItem("progreso_mod3", "0");

        setAprobado(true);
        setEstadoMsg(
          "🎉 ¡Felicidades! Has aprobado el examen. Módulo 2 completado al 100%."
        );
        showToast("¡Aprobaste! Módulo 3 desbloqueado", "success");
      } else if ((data.intentos || intentos + 1) >= MAX_INTENTOS) {
        setEstadoMsg(
          "Has usado tus dos intentos sin superar el puntaje mínimo. Debes repasar el módulo."
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
        localStorage.setItem("progreso_mod2", String(NUM_CONTENIDO));
      }
    }
  };

  const irAnterior = () => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    navigate("/modulo/2/contenido/7");
  };

  const puntajePorcentaje = (quizScore / TOTAL_PREGUNTAS) * 100;

  if (loading) {
    return <div className="fb-exam-container"><h2>Cargando examen...</h2></div>;
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
    <div className="fb-exam-container">
      {toast.visible && (
        <div className={`toast toast-${toast.type}`}>{toast.message}</div>
      )}

      <header className="fb-exam-header">
        <div className="fb-exam-header-inner">
          <h1>Examen final: Uso de Facebook y Facebook Marketplace</h1>
        </div>
      </header>

      <section className="intro-card">
        <h2 className="section-title">
          <span className="section-number">1.1</span>
          Instrucciones generales
        </h2>
        <p>
          Este examen reúne los contenidos principales trabajados en los módulos
          de Facebook. Lee cada pregunta con atención y elige la opción que
          consideres más adecuada.
        </p>
        <p>
          Dispones de <strong>10 minutos</strong> para contestar las{" "}
          <strong>15 preguntas</strong>. Al finalizar, haz clic en{" "}
          <strong>Calificar</strong> para ver tu puntaje y la retroalimentación
          de cada reactivo.
        </p>
        <p className="info-intentos">
          Intentos usados: <strong>{intentos}</strong> de {MAX_INTENTOS}.{" "}
          Mejor puntaje:{" "}
          <strong>
            {mejorPuntaje} / {TOTAL_PREGUNTAS}
          </strong>{" "}
          ({((mejorPuntaje / TOTAL_PREGUNTAS) * 100).toFixed(0)}%).
        </p>
        {estadoMsg && <p className="estado-msg">{estadoMsg}</p>}
      </section>

      <section className="quiz">
        <h2 className="section-title inline">
          <span className="section-number">1.2</span>
          Examen de conocimientos sobre Facebook
        </h2>

        <form className="quiz-form" onSubmit={handleQuizSubmit}>
          <div className={`q ${quizAnswered ? feedback.q1 || "" : ""}`}>
            <label>
              <span className="question-text">
                1) ¿Cuál de las siguientes opciones describe mejor una{" "}
                <strong>página</strong> de Facebook y no un perfil personal?
              </span>
              <select
                name="q1"
                required
                onChange={handleChange}
                value={answers.q1 || ""}
                disabled={!puedeIntentar}
              >
                <option value="">Selecciona…</option>
                <option value="perfilAmigos">
                  Espacio para agregar solo amigos y familiares cercanos.
                </option>
                <option value="paginaOrganizacion">
                  Espacio diseñado para representar negocios, proyectos,
                  instituciones o figuras públicas ante muchas personas.
                </option>
                <option value="grupoDebate">
                  Espacio para que varias personas publiquen y debatan en
                  privado sobre un tema.
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q1 && (
              <p className={`answer-feedback ${feedback.q1}`}>
                {feedback.q1 === "correct"
                  ? "✅ Correcto: las páginas están pensadas para organizaciones, negocios y figuras públicas."
                  : "❗ Revisa la diferencia entre perfil personal (para personas) y página (para proyectos o negocios)."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q2 || "" : ""}`}>
            <label>
              <span className="question-text">
                2) Un <strong>grupo</strong> de Facebook bien configurado para
                una comunidad escolar debería…
              </span>
              <select
                name="q2"
                required
                onChange={handleChange}
                value={answers.q2 || ""}
                disabled={!puedeIntentar}
              >
                <option value="">Selecciona…</option>
                <option value="grupoAbiertoSinControl">
                  Ser totalmente público, aceptar a cualquiera automáticamente y
                  permitir publicar sin reglas.
                </option>
                <option value="grupoSoloAdminPublica">
                  Ser privado, pero solo el administrador puede ver y escribir.
                </option>
                <option value="grupoComunidadPrivacidad">
                  Tener reglas claras, nivel de privacidad adecuado y
                  administradores que moderen contenido y solicitudes.
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q2 && (
              <p className={`answer-feedback ${feedback.q2}`}>
                {feedback.q2 === "correct"
                  ? "✅ Correcto: un buen grupo combina normas, moderación y privacidad según la comunidad."
                  : "❗ Un grupo sin control o sin participación de la comunidad puede volverse caótico o poco útil."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q3 || "" : ""}`}>
            <label>
              <span className="question-text">
                3) ¿Qué ventaja principal ofrece un{" "}
                <strong>evento de Facebook</strong> frente a solo publicar la
                información en el muro?
              </span>
              <select
                name="q3"
                required
                onChange={handleChange}
                value={answers.q3 || ""}
                disabled={!puedeIntentar}
              >
                <option value="">Selecciona…</option>
                <option value="eventoReacciones">
                  Permite obtener más reacciones (Me gusta, Me encanta, etc.).
                </option>
                <option value="eventoRecordatorio">
                  Permite que las personas confirmen asistencia, reciban
                  recordatorios y consulten detalles del lugar y la hora.
                </option>
                <option value="eventoAnonimo">
                  Permite invitar personas de forma anónima sin que nadie lo
                  vea.
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q3 && (
              <p className={`answer-feedback ${feedback.q3}`}>
                {feedback.q3 === "correct"
                  ? "✅ Correcto: los eventos están pensados para organizar y recordar fechas, lugares y asistentes."
                  : "❗ Un evento no es solo para conseguir reacciones; su función es organizar y dar seguimiento a la actividad."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q4 || "" : ""}`}>
            <label>
              <span className="question-text">
                4) ¿Qué controla principalmente la{" "}
                <strong>configuración de privacidad de publicaciones</strong>?
              </span>
              <select
                name="q4"
                required
                onChange={handleChange}
                value={answers.q4 || ""}
                disabled={!puedeIntentar}
              >
                <option value="">Selecciona…</option>
                <option value="privacidadColores">
                  Los colores y el diseño visual del perfil.
                </option>
                <option value="privacidadQuienVe">
                  Quién puede ver lo que publicas (público, amigos, solo yo,
                  listas específicas).
                </option>
                <option value="privacidadContra">
                  Solo el cambio de contraseña de la cuenta.
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q4 && (
              <p className={`answer-feedback ${feedback.q4}`}>
                {feedback.q4 === "correct"
                  ? "✅ Correcto: la privacidad define el alcance de tus publicaciones."
                  : "❗ La privacidad no cambia colores ni contraseñas, se enfoca en quién puede ver tu contenido."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q5 || "" : ""}`}>
            <label>
              <span className="question-text">
                5) ¿Qué característica distingue especialmente a{" "}
                <strong>Facebook Marketplace</strong>?
              </span>
              <select
                name="q5"
                required
                onChange={handleChange}
                value={answers.q5 || ""}
                disabled={!puedeIntentar}
              >
                <option value="">Selecciona…</option>
                <option value="marketplaceCloud">
                  Solo sirve para guardar archivos en la nube.
                </option>
                <option value="marketplaceLocal">
                  Facilita la compra y venta de productos con personas de tu
                  zona o ciudad.
                </option>
                <option value="marketplaceSoloDigital">
                  Solo permite vender productos digitales descargables.
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q5 && (
              <p className={`answer-feedback ${feedback.q5}`}>
                {feedback.q5 === "correct"
                  ? "✅ Correcto: Marketplace se enfoca en ventas locales entre personas cercanas."
                  : "❗ Marketplace no es un servicio de nube ni exclusivo de productos digitales."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q6 || "" : ""}`}>
            <label>
              <span className="question-text">
                6) ¿Cómo aprovechas mejor los{" "}
                <strong>filtros de búsqueda</strong> en Marketplace al buscar un
                producto específico?
              </span>
              <select
                name="q6"
                required
                onChange={handleChange}
                value={answers.q6 || ""}
                disabled={!puedeIntentar}
              >
                <option value="">Selecciona…</option>
                <option value="sinFiltros">
                  Buscas solo por nombre sin aplicar ningún filtro.
                </option>
                <option value="filtroUbicacionPrecio">
                  Ajustas ubicación, rango de precio y estado del artículo para
                  ver resultados más relevantes.
                </option>
                <option value="filtroPorReaccion">
                  Filtras únicamente por publicaciones con más reacciones.
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q6 && (
              <p className={`answer-feedback ${feedback.q6}`}>
                {feedback.q6 === "correct"
                  ? "✅ Correcto: limitar por ubicación, precio y estado te ayuda a encontrar opciones que realmente te sirven."
                  : "❗ Si no usas filtros, verás muchos resultados que quizá no coincidan con lo que necesitas."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q7 || "" : ""}`}>
            <label>
              <span className="question-text">
                7) ¿Para qué sirve realmente la opción{" "}
                <strong>“Guardar” o “Agregar a favoritos”</strong> en
                Marketplace?
              </span>
              <select
                name="q7"
                required
                onChange={handleChange}
                value={answers.q7 || ""}
                disabled={!puedeIntentar}
              >
                <option value="">Selecciona…</option>
                <option value="favoritosCompraInmediata">
                  Obliga al vendedor a apartar el artículo automáticamente.
                </option>
                <option value="favoritosLista">
                  Crear una lista personal de productos que te interesan para
                  revisarlos después.
                </option>
                <option value="favoritosSubePrecio">
                  Aumentar el precio del producto para que sea más visible.
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q7 && (
              <p className={`answer-feedback ${feedback.q7}`}>
                {feedback.q7 === "correct"
                  ? "✅ Correcto: guardar productos te permite comparar y decidir más adelante."
                  : "❗ Guardar no significa apartar ni modificar el precio, solo organiza tus intereses."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q8 || "" : ""}`}>
            <label>
              <span className="question-text">
                8) ¿Cuál de estos elementos NO puede faltar al crear un buen
                anuncio?
              </span>
              <select
                name="q8"
                required
                onChange={handleChange}
                value={answers.q8 || ""}
                disabled={!puedeIntentar}
              >
                <option value="">Selecciona…</option>
                <option value="soloEmoji">
                  Solo emojis y frases muy cortas sin explicar el producto.
                </option>
                <option value="anuncioCompleto">
                  Varias fotos claras, descripción detallada, categoría
                  adecuada y precio específico.
                </option>
                <option value="sinPrecio">
                  No poner precio para que el comprador adivine cuánto cuesta.
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q8 && (
              <p className={`answer-feedback ${feedback.q8}`}>
                {feedback.q8 === "correct"
                  ? "✅ Correcto: fotos, precio y descripción clara generan más confianza."
                  : "❗ Un buen anuncio necesita fotos, precio y una descripción detallada."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q9 || "" : ""}`}>
            <label>
              <span className="question-text">
                9) En una <strong>página de Facebook</strong>, ¿para qué sirve
                asignar distintos <strong>roles</strong> (administrador, editor,
                moderador)?
              </span>
              <select
                name="q9"
                required
                onChange={handleChange}
                value={answers.q9 || ""}
                disabled={!puedeIntentar}
              >
                <option value="">Selecciona…</option>
                <option value="rolesDecorar">
                  Solo para cambiar colores y fotos de portada.
                </option>
                <option value="rolesPagina">
                  Para repartir responsabilidades: quién publica, quién contesta
                  mensajes, quién administra la página.
                </option>
                <option value="rolesBaneo">
                  Para bloquear automáticamente a todos los seguidores nuevos.
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q9 && (
              <p className={`answer-feedback ${feedback.q9}`}>
                {feedback.q9 === "correct"
                  ? "✅ Correcto: los roles permiten trabajar en equipo de forma organizada en una página."
                  : "❗ Los roles no son para bloquear a todos ni solo para decorar; se usan para administrar mejor la página."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q10 || "" : ""}`}>
            <label>
              <span className="question-text">
                10) ¿Cuál es la forma más segura de{" "}
                <strong>negociar precios y detalles</strong> en Marketplace?
              </span>
              <select
                name="q10"
                required
                onChange={handleChange}
                value={answers.q10 || ""}
                disabled={!puedeIntentar}
              >
                <option value="">Selecciona…</option>
                <option value="comentariosPublicos">
                  Escribir todos los datos personales y acuerdos en los
                  comentarios públicos.
                </option>
                <option value="mensajesNegociacion">
                  Usar los mensajes privados para aclarar dudas, ajustar precio
                  y acordar lugar de entrega.
                </option>
                <option value="fueraMarketplace">
                  Cerrar el trato en páginas externas desconocidas enviadas por
                  el vendedor.
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q10 && (
              <p className={`answer-feedback ${feedback.q10}`}>
                {feedback.q10 === "correct"
                  ? "✅ Correcto: los mensajes privados permiten negociar sin exponer datos personales públicamente."
                  : "❗ Evita compartir información sensible en comentarios públicos o en enlaces desconocidos."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q11 || "" : ""}`}>
            <label>
              <span className="question-text">
                11) Desde la perspectiva de seguridad, ¿a quién es más
                recomendable <strong>aceptar como amigo</strong> en Facebook?
              </span>
              <select
                name="q11"
                required
                onChange={handleChange}
                value={answers.q11 || ""}
                disabled={!puedeIntentar}
              >
                <option value="">Selecciona…</option>
                <option value="cualquieraFotoBonita">
                  A cualquier persona con foto de perfil atractiva.
                </option>
                <option value="soloConocidos">
                  A personas que realmente conoces en la vida real o que puedes
                  identificar claramente.
                </option>
                <option value="sinRevisar">
                  A todos los que envíen solicitud para tener más seguidores.
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q11 && (
              <p className={`answer-feedback ${feedback.q11}`}>
                {feedback.q11 === "correct"
                  ? "✅ Correcto: aceptar solo a conocidos disminuye riesgos de suplantación o engaños."
                  : "❗ Aceptar desconocidos aumenta el riesgo de recibir mensajes malintencionados o estafas."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q12 || "" : ""}`}>
            <label>
              <span className="question-text">
                12) Si sospechas que alguien entró a tu cuenta de Facebook sin
                permiso, ¿qué conjunto de acciones es más adecuado?
              </span>
              <select
                name="q12"
                required
                onChange={handleChange}
                value={answers.q12 || ""}
                disabled={!puedeIntentar}
              >
                <option value="">Selecciona…</option>
                <option value="ignorarAvisos">
                  Ignorar las alertas y seguir usando la cuenta con normalidad.
                </option>
                <option value="recuperacionOficial">
                  Cambiar la contraseña, revisar dispositivos activos y usar las
                  opciones oficiales de recuperación y seguridad.
                </option>
                <option value="compartirContra">
                  Pedir ayuda enviando tu contraseña a varios contactos de
                  confianza.
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q12 && (
              <p className={`answer-feedback ${feedback.q12}`}>
                {feedback.q12 === "correct"
                  ? "✅ Correcto: la ruta segura siempre es cambiar contraseña y revisar accesos desde la configuración oficial."
                  : "❗ Nunca compartas tu contraseña; si hay sospecha, actúa desde las herramientas de seguridad de la plataforma."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q13 || "" : ""}`}>
            <label>
              <span className="question-text">
                13) En la configuración de{" "}
                <strong>privacidad de publicaciones</strong>, ¿qué opción te da
                mayor control si quieres que solo ciertas personas vean algo?
              </span>
              <select
                name="q13"
                required
                onChange={handleChange}
                value={answers.q13 || ""}
                disabled={!puedeIntentar}
              >
                <option value="">Selecciona…</option>
                <option value="todoPublico">
                  Dejar todo siempre en “Público”.
                </option>
                <option value="configPublicoAmigosSoloYo">
                  Usar opciones como “Amigos”, “Solo yo” o listas personalizadas
                  según el tipo de contenido.
                </option>
                <option value="sinConfig">
                  No abrir nunca la configuración de privacidad.
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q13 && (
              <p className={`answer-feedback ${feedback.q13}`}>
                {feedback.q13 === "correct"
                  ? "✅ Correcto: adaptar la privacidad por publicación te permite decidir quién ve cada cosa."
                  : "❗ Si todo es público o nunca revisas la privacidad, podrías mostrar más de lo que deseas."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q14 || "" : ""}`}>
            <label>
              <span className="question-text">
                14) Si ves un anuncio en Marketplace que parece{" "}
                <strong>estafa</strong> (precio demasiado bajo, cuenta
                sospechosa, información incoherente), ¿qué es lo más
                responsable?
              </span>
              <select
                name="q14"
                required
                onChange={handleChange}
                value={answers.q14 || ""}
                disabled={!puedeIntentar}
              >
                <option value="">Selecciona…</option>
                <option value="compartirAmigos">
                  Compartirlo con tus amigos para que más gente lo vea.
                </option>
                <option value="reportarSospechoso">
                  Usar la opción de “Reportar” o “Denunciar” la publicación a
                  Facebook.
                </option>
                <option value="enviarDatos">
                  Enviar tus datos personales para comprobar si es real.
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q14 && (
              <p className={`answer-feedback ${feedback.q14}`}>
                {feedback.q14 === "correct"
                  ? "✅ Correcto: reportar ayuda a que Facebook investigue y proteja a otros usuarios."
                  : "❗ Nunca envíes datos personales a anuncios sospechosos ni los difundas sin advertir del riesgo."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q15 || "" : ""}`}>
            <label>
              <span className="question-text">
                15) ¿Cuál de las siguientes afirmaciones resume mejor la{" "}
                <strong>diferencia entre perfil personal y página</strong>?
              </span>
              <select
                name="q15"
                required
                onChange={handleChange}
                value={answers.q15 || ""}
                disabled={!puedeIntentar}
              >
                <option value="">Selecciona…</option>
                <option value="diferenciaNinguna">
                  No hay diferencia: ambos se usan exactamente para lo mismo.
                </option>
                <option value="diferenciaPerfilPagina">
                  El perfil representa a una persona; la página representa a un
                  proyecto, negocio o figura pública ante muchas personas.
                </option>
                <option value="diferenciaGrupo">
                  La página y el grupo son lo mismo, solo cambia el nombre.
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q15 && (
              <p className={`answer-feedback ${feedback.q15}`}>
                {feedback.q15 === "correct"
                  ? "✅ Correcto: el perfil representa a una persona y la página representa a un proyecto, negocio o figura pública."
                  : "❗ Revisa la diferencia básica: los perfiles son para personas y las páginas para organizaciones o marcas."}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={!puedeIntentar || guardando}
            onClick={finalizarContenido}
          >
            {guardando ? "Guardando..." : puedeIntentar ? "Calificar" : "Sin intentos disponibles"}
          </button>

          {quizAnswered && (
            <div className="quiz-result">
              <p>
                Preguntas correctas:{" "}
                <strong>
                  {quizScore} / {TOTAL_PREGUNTAS}
                </strong>{" "}
                ({puntajePorcentaje.toFixed(0)}%)
              </p>
            </div>
          )}
        </form>
      </section>

      <footer className="contenido-footer">
        <div className="avance-mensaje">
          {estadoMsg && <p>{estadoMsg}</p>}
        </div>

        <div className="botones-nav">
          <button className="btn-anterior" onClick={irAnterior}>
            ← Anterior
          </button>

          {aprobado ? (
            <button className="btn-siguiente" onClick={finalizarContenido} disabled={guardando || !puedeAvanzar}>
              {guardando ? "Guardando..." : "Siguiente Módulo →"}
            </button>
          ) : intentos >= MAX_INTENTOS ? (
            <button className="btn-repasar" onClick={finalizarContenido} disabled={guardando || !puedeAvanzar}>
              Repasar el tema
            </button>
          ) : (
            <button className="btn-siguiente" disabled>
              Siguiente 🔒
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
