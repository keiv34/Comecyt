// src/pages/contenido/modulo_1_contenido_21_Eval.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "@/Css/modulo_3_contenido_7_Eval.css";



const API_URL = import.meta.env.VITE_API_URL
const MODULO_ID = 3; // ✅ Es módulo 1 - Examen final del módulo 1
const NUM_CONTENIDO = 7;
const EVALUACION_ID = 3; // Examen final Módulo 1
const MAX_INTENTOS = 2;
const TOTAL_PREGUNTAS = 15;
const APROBADO_MIN_PERCENT = 70;

export default function ContenidoWhatsappExamenFinal() {
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

  // ✅ CAMBIO 1: States nuevos para el fix
  const [totalContenidos, setTotalContenidos] = useState(21);
  const [modulos, setModulos] = useState([]);

  const navigate = useNavigate();
  const [progresoCargado, setProgresoCargado] = useState(false);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    console.log("🔥 SÍ ENTRA AL COMPONENTE Contenido21 - Examen Final");
  }, []);

  const showToast = (message, type = "info") => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast((t) => ({ ...t, visible: false }));
    }, 2500);
  };

  const correctAnswers = {
    q1: "codigoSMS",
    q2: "bloqueoTemporal",
    q3: "enviadoEntregadoLeido",
    q4: "buenaPracticaChat",
    q5: "ocultarAlgunos",
    q6: "sinUltimaPeroLeido",
    q7: "recuperarChats",
    q8: "soloEmisorReceptor",
    q9: "bloquearReportar",
    q10: "perfilEmpresarial",
    q11: "mensajeBienvenida",
    q12: "etiquetasOrganizan",
    q13: "ajustarEstrategia",
    q14: "catalogoCompleto",
    q15: "usoResponsableBusiness",
  };

  // ✅ CAMBIO 2: useEffect modificado con setModulos y setTotalContenidos
  useEffect(() => {
    const cargarEstadoEvaluacion = async () => {
      try {
        const correo = localStorage.getItem("correo");
        if (!correo) {
          setProgresoCargado(true);
          return;
        }

        // Cargar datos del módulo y evaluación
        const resp = await axios.post(
          `${API_URL}/api/alumno/progreso`,
          { correo }
        );
        const modulosData = resp.data.modulos || [];
        setModulos(modulosData); // 👈 NUEVO

        const modulo1 = modulosData.find(
          (m) => m.modulo_id === MODULO_ID
        );

        if (modulo1) {
          setTotalContenidos(modulo1.total_contenidos); // 👈 NUEVO
        }

        const { data } = await axios.post(
          `${API_URL}/api/alumno/evaluacion/intentos`,
          { correo, evaluacion_id: EVALUACION_ID }
        );

        const intentosDB = data.intentos || 0;
        const maxDB = data.mejor_puntaje || 0;
        const aprobadoDB = data.aprobado || false;

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
            "Resuelve el examen. Necesitas más de 70 puntos para desbloquear el siguiente módulo."
          );
        }
      } catch {
        setEstadoMsg("No se pudo cargar el estado del examen.");
        showToast("Error al cargar el estado del examen.", "error");
      } finally {
        setProgresoCargado(true);
      }
    };

    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    cargarEstadoEvaluacion();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAnswers((prev) => ({ ...prev, [name]: value }));
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

    const porcentaje = (score / TOTAL_PREGUNTAS) * 100;

    setGuardando(true);
    try {
      const correo = localStorage.getItem("correo");
      if (!correo) return;

      const { data } = await axios.post(
        `${API_URL}/api/alumno/evaluacion/resultado`,
        { correo, evaluacion_id: EVALUACION_ID, puntaje: score }
      );

      const intentosDB = data.intentos;
      const maxDB = Math.max(mejorPuntaje, score);
      const aprobadoDB = porcentaje >= APROBADO_MIN_PERCENT;

      setIntentos(intentosDB);
      setMejorPuntaje(maxDB);
      setAprobado(aprobadoDB);

      if (aprobadoDB) {
        setEstadoMsg("🎉 ¡Felicidades! Has aprobado el examen.");
        showToast(
          `Aprobaste con ${score}/${TOTAL_PREGUNTAS} (${porcentaje.toFixed(
            0
          )}%)`,
          "success"
        );
      } else if (intentosDB >= MAX_INTENTOS) {
        setEstadoMsg("Has agotado tus intentos. Debes repasar el contenido.");
        showToast("Ya no tienes más intentos.", "info");
      } else {
        setEstadoMsg("Puedes volver a intentar para mejorar tu puntaje.");
        showToast("Examen registrado.", "info");
      }
    } catch {
      showToast("No se pudo guardar el examen.", "error");
    } finally {
      setGuardando(false);
    }
  };

  // 🔙 Anterior
  const irAnterior = () => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    navigate("/modulo/1/contenido/20"); // ✅ Va al contenido 20
  };

  // ✅ CAMBIO 3: irSiguiente con fix para último contenido
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
      }
      showToast("Estado reiniciado. Regresando al contenido.", "info");
    } catch {
      showToast("No se pudo reiniciar.", "error");
    }

    navigate("/modulo/1/contenido/17"); // Regresa a WhatsApp Business
  };

  const puntajePorcentaje = (quizScore / TOTAL_PREGUNTAS) * 100;

  if (!progresoCargado) {
    return (
      <div className="wa-exam-container">
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '1.2rem',
          color: '#075e54'
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
    <div className="wa-exam-container">
      {toast.visible && (
        <div className={`toast toast-${toast.type}`}>{toast.message}</div>
      )}

      <header className="wa-exam-header">
        <div className="wa-exam-header-inner">
          <h1>Examen final: WhatsApp y WhatsApp Business</h1>
        </div>
      </header>

      <section className="intro-card">
        <h2 className="section-title">
          <span className="section-number">Eval</span>
          Instrucciones generales
        </h2>

        <p>
          Este examen evalúa el uso adecuado de WhatsApp y WhatsApp Business.
          Lee cada pregunta con atención antes de responder.
        </p>

        <p className="info-intentos">
          Intentos usados: <strong>{intentos}</strong> de {MAX_INTENTOS}. Mejor
          puntaje:{" "}
          <strong>
            {mejorPuntaje} / {TOTAL_PREGUNTAS}
          </strong>
        </p>

        {estadoMsg && <p className="estado-msg">{estadoMsg}</p>}
      </section>

      <section className="quiz">
        <h2 className="section-title inline">
          <span className="section-number">Eval</span>
          Examen de conocimientos sobre WhatsApp
        </h2>

        <form className="quiz-form" onSubmit={handleQuizSubmit}>
          <div className={`q ${quizAnswered ? feedback.q1 || "" : ""}`}>
            <label>
              <span className="question-text">
                1) ¿Qué se utiliza para verificar tu número al registrarte en WhatsApp?
              </span>
              <select name="q1" required onChange={handleChange} value={answers.q1 || ""}>
                <option value="">Selecciona…</option>
                <option value="correoElectronico">Un correo electrónico</option>
                <option value="codigoSMS">Un código enviado por SMS</option>
                <option value="huellaDigital">Huella digital</option>
              </select>
            </label>
            {quizAnswered && (
              <p className={`answer-feedback ${feedback.q1}`}>
                {feedback.q1 === "correct"
                  ? "✅ Correcto: WhatsApp envía un código SMS para verificar tu número."
                  : "❗ WhatsApp no usa correo ni huella para verificar el número."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q2 || "" : ""}`}>
            <label>
              <span className="question-text">
                2) ¿Qué ocurre si introduces varias veces mal el código de verificación?
              </span>
              <select name="q2" required onChange={handleChange} value={answers.q2 || ""}>
                <option value="">Selecciona…</option>
                <option value="eliminaCuenta">Se elimina tu cuenta</option>
                <option value="bloqueoTemporal">Se bloquea temporalmente el intento</option>
                <option value="nada">No pasa nada</option>
              </select>
            </label>
            {quizAnswered && (
              <p className={`answer-feedback ${feedback.q2}`}>
                {feedback.q2 === "correct"
                  ? "✅ Correcto: el sistema bloquea temporalmente el registro."
                  : "❗ WhatsApp protege la cuenta ante intentos repetidos incorrectos."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q3 || "" : ""}`}>
            <label>
              <span className="question-text">
                3) ¿Qué indican los íconos de uno y dos checks en WhatsApp?
              </span>
              <select name="q3" required onChange={handleChange} value={answers.q3 || ""}>
                <option value="">Selecciona…</option>
                <option value="soloEnviado">Solo enviado</option>
                <option value="enviadoEntregadoLeido">Enviado, entregado y leído</option>
                <option value="conectado">Conectado o desconectado</option>
              </select>
            </label>
            {quizAnswered && (
              <p className={`answer-feedback ${feedback.q3}`}>
                {feedback.q3 === "correct"
                  ? "✅ Correcto: los checks muestran el estado del mensaje."
                  : "❗ Los checks no indican conexión."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q4 || "" : ""}`}>
            <label>
              <span className="question-text">
                4) ¿Cuál es una buena práctica en los chats?
              </span>
              <select name="q4" required onChange={handleChange} value={answers.q4 || ""}>
                <option value="">Selecciona…</option>
                <option value="reenviarTodo">Reenviar todo sin revisar</option>
                <option value="buenaPracticaChat">Ser claro, respetuoso y cuidadoso</option>
                <option value="escribirMayus">Escribir siempre en mayúsculas</option>
              </select>
            </label>
            {quizAnswered && (
              <p className={`answer-feedback ${feedback.q4}`}>
                {feedback.q4 === "correct"
                  ? "✅ Correcto: la comunicación clara y respetuosa es clave."
                  : "❗ Las malas prácticas generan conflictos."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q5 || "" : ""}`}>
            <label>
              <span className="question-text">
                5) Respecto a los estados de WhatsApp, ¿qué afirmación es
                correcta sobre su privacidad?
              </span>
              <select name="q5" required onChange={handleChange} value={answers.q5 || ""}>
                <option value="">Selecciona…</option>
                <option value="todosSinExcepcion">
                  Solo se pueden configurar para que los vean todos los contactos sin excepción.
                </option>
                <option value="ocultarAlgunos">
                  Se pueden ocultar de algunos contactos específicos desde la configuración.
                </option>
                <option value="soloConFotoPerfil">
                  Solo pueden verlos los contactos que tengan foto de perfil.
                </option>
                <option value="siempreCualquierPersona">
                  Cualquier persona con tu número puede verlos, no hay forma de limitar quién los ve.
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q5 && (
              <p className={`answer-feedback ${feedback.q5}`}>
                {feedback.q5 === "correct"
                  ? "✅ Correcto: puedes elegir qué contactos ven tus estados."
                  : "❗ Recuerda que la privacidad de estados se puede ajustar para excluir a ciertas personas."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q6 || "" : ""}`}>
            <label>
              <span className="question-text">
                6) En privacidad desactivas “Última vez en línea”, pero dejas
                activadas las confirmaciones de lectura (doble check azul).
                ¿Qué ocurre?
              </span>
              <select name="q6" required onChange={handleChange} value={answers.q6 || ""}>
                <option value="">Selecciona…</option>
                <option value="nadieVeNada">
                  Nadie ve tu última vez en línea ni si leíste los mensajes.
                </option>
                <option value="seVeUltimaNoLeido">
                  Tus contactos ven tu última conexión, pero no las palomitas azules.
                </option>
                <option value="sinUltimaPeroLeido">
                  Tus contactos no ven tu última conexión, pero sí cuando lees sus mensajes.
                </option>
                <option value="soloTuVesUltima">
                  Solo tú puedes ver la última conexión de tus contactos, ellos no la tuya.
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q6 && (
              <p className={`answer-feedback ${feedback.q6}`}>
                {feedback.q6 === "correct"
                  ? "✅ Correcto: aunque ocultes tu última vez en línea, si mantienes el doble check azul verán si lees los mensajes."
                  : "❗ Son ajustes distintos: 'Última vez en línea' y 'Confirmaciones de lectura' se configuran por separado."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q7 || "" : ""}`}>
            <label>
              <span className="question-text">
                7) ¿Qué ventaja tiene activar las copias de seguridad de
                WhatsApp en Google Drive o iCloud?
              </span>
              <select name="q7" required onChange={handleChange} value={answers.q7 || ""}>
                <option value="">Selecciona…</option>
                <option value="dosTelefonos">
                  Permite iniciar sesión en dos teléfonos a la vez.
                </option>
                <option value="recuperarChats">
                  Recuperar chats y archivos si cambias de teléfono o se te borra la app.
                </option>
                <option value="sinInternet">
                  Enviar mensajes sin conexión a internet.
                </option>
                <option value="evitarBloqueoNumero">
                  Evitar que alguien bloquee tu número.
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q7 && (
              <p className={`answer-feedback ${feedback.q7}`}>
                {feedback.q7 === "correct"
                  ? "✅ Correcto: las copias de seguridad te ayudan a recuperar tus conversaciones al cambiar de dispositivo."
                  : "❗ La copia de seguridad no sirve para usar dos teléfonos ni para evitar bloqueos, sino para recuperar información."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q8 || "" : ""}`}>
            <label>
              <span className="question-text">
                8) ¿Qué describe mejor el cifrado de extremo a extremo en
                WhatsApp?
              </span>
              <select name="q8" required onChange={handleChange} value={answers.q8 || ""}>
                <option value="">Selecciona…</option>
                <option value="soloOtrosPaises">
                  Solo cifra los mensajes cuando se envían a números de otro país.
                </option>
                <option value="soloEmisorReceptor">
                  Los mensajes van cifrados y solo el emisor y el receptor pueden leerlos.
                </option>
                <option value="empresaPuedeLeer">
                  Los mensajes se guardan cifrados, pero cualquier empleado de WhatsApp puede abrirlos.
                </option>
                <option value="soloVoz">
                  Solo cifra los mensajes de voz, pero no los textos ni las imágenes.
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q8 && (
              <p className={`answer-feedback ${feedback.q8}`}>
                {feedback.q8 === "correct"
                  ? "✅ Correcto: con cifrado de extremo a extremo solo tú y la otra persona pueden leer el contenido."
                  : "❗ El cifrado no depende del país ni da acceso al personal de WhatsApp; protege todo el contenido entre emisor y receptor."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q9 || "" : ""}`}>
            <label>
              <span className="question-text">
                9) Recibes mensajes insistentes pidiéndote códigos que llegan
                por SMS. ¿Cuál es la acción más segura dentro de WhatsApp?
              </span>
              <select name="q9" required onChange={handleChange} value={answers.q9 || ""}>
                <option value="">Selecciona…</option>
                <option value="reenviarCodigo">
                  Reenviar el código para que deje de molestar.
                </option>
                <option value="bloquearReportar">
                  Bloquear y reportar el contacto desde las opciones del chat.
                </option>
                <option value="cambiarFoto">
                  Cambiar tu foto de perfil por una imagen genérica.
                </option>
                <option value="decirNoInteres">
                  Responder que no estás interesado, pero seguir en el chat.
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q9 && (
              <p className={`answer-feedback ${feedback.q9}`}>
                {feedback.q9 === "correct"
                  ? "✅ Correcto: bloquear y reportar es la mejor forma de proteger tu cuenta."
                  : "❗ Nunca compartas códigos de verificación. Lo más seguro es bloquear y reportar."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q10 || "" : ""}`}>
            <label>
              <span className="question-text">
                10) En WhatsApp Business, ¿qué diferencia clave tiene el perfil
                empresarial frente a un perfil personal?
              </span>
              <select name="q10" required onChange={handleChange} value={answers.q10 || ""}>
                <option value="">Selecciona…</option>
                <option value="variasFotosPerfil">
                  Permite elegir más de una foto de perfil al mismo tiempo.
                </option>
                <option value="perfilEmpresarial">
                  Permite mostrar categoría del negocio, horario, dirección y enlaces de contacto.
                </option>
                <option value="soloEmpresasGrandes">
                  Solo se puede usar si el negocio tiene más de 50 empleados.
                </option>
                <option value="cambiaColorLogo">
                  El color del logotipo de la app cambia automáticamente.
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q10 && (
              <p className={`answer-feedback ${feedback.q10}`}>
                {feedback.q10 === "correct"
                  ? "✅ Correcto: el perfil empresarial muestra información clave del negocio."
                  : "❗ El cambio importante de WhatsApp Business es el perfil con datos de empresa, no el color ni el número de empleados."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q11 || "" : ""}`}>
            <label>
              <span className="question-text">
                11) Una tienda de ropa usa WhatsApp Business y quiere saludar
                automáticamente a quienes escriben por primera vez. ¿Qué
                herramienta debe configurar?
              </span>
              <select name="q11" required onChange={handleChange} value={answers.q11 || ""}>
                <option value="">Selecciona…</option>
                <option value="mensajeAusencia">
                  Mensaje de ausencia.
                </option>
                <option value="mensajeBienvenida">
                  Mensaje de bienvenida.
                </option>
                <option value="listaDifusion">
                  Lista de difusión.
                </option>
                <option value="estadisticas">
                  Estadísticas de mensajes.
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q11 && (
              <p className={`answer-feedback ${feedback.q11}`}>
                {feedback.q11 === "correct"
                  ? "✅ Correcto: el mensaje de bienvenida saluda a quienes te escriben por primera vez."
                  : "❗ El mensaje de ausencia se usa cuando no estás disponible; para saludar se usa el mensaje de bienvenida."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q12 || "" : ""}`}>
            <label>
              <span className="question-text">
                12) Un negocio etiqueta sus chats como “Nuevo cliente”, “Pedido
                en proceso” y “Pagado”. ¿Qué beneficio aporta?
              </span>
              <select name="q12" required onChange={handleChange} value={answers.q12 || ""}>
                <option value="">Selecciona…</option>
                <option value="masInternet">
                  Aumenta la velocidad del internet al enviar mensajes.
                </option>
                <option value="etiquetasOrganizan">
                  Permite clasificar conversaciones y dar seguimiento claro a cada pedido.
                </option>
                <option value="noBorrarMensajes">
                  Impide que los clientes puedan borrar sus mensajes.
                </option>
                <option value="borraViejos">
                  Hace que los mensajes viejos se borren automáticamente.
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q12 && (
              <p className={`answer-feedback ${feedback.q12}`}>
                {feedback.q12 === "correct"
                  ? "✅ Correcto: las etiquetas ayudan a organizar y seguir el estado de cada pedido."
                  : "❗ Las etiquetas son para organización interna, no cambian la velocidad ni el control de los mensajes."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q13 || "" : ""}`}>
            <label>
              <span className="question-text">
                13) En las estadísticas de WhatsApp Business ves que muchos
                mensajes se envían pero muy pocos se leen. ¿Qué sería una
                decisión razonable?
              </span>
              <select name="q13" required onChange={handleChange} value={answers.q13 || ""}>
                <option value="">Selecciona…</option>
                <option value="dejarResponder">
                  Dejar de responder a los clientes que sí escriben.
                </option>
                <option value="enviarMas">
                  Enviar más mensajes a todas horas del día.
                </option>
                <option value="ajustarEstrategia">
                  Ajustar horarios, textos y tipo de contenido para que resulte más claro y útil.
                </option>
                <option value="cambiarNumero">
                  Cambiar de número para “empezar de cero” con los mismos clientes.
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q13 && (
              <p className={`answer-feedback ${feedback.q13}`}>
                {feedback.q13 === "correct"
                  ? "✅ Correcto: las métricas sirven para ajustar la estrategia de comunicación."
                  : "❗ Los datos no se resuelven mandando más mensajes sin pensar o cambiando de número; se usa para mejorar el contenido."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q14 || "" : ""}`}>
            <label>
              <span className="question-text">
                14) ¿Cuál de estas acciones aprovecha mejor el catálogo de
                WhatsApp Business?
              </span>
              <select name="q14" required onChange={handleChange} value={answers.q14 || ""}>
                <option value="">Selecciona…</option>
                <option value="fotosSueltas">
                  Mandar fotos sueltas sin precio ni descripción.
                </option>
                <option value="catalogoCompleto">
                  Subir productos con foto, nombre, precio y compartir las fichas desde el chat.
                </option>
                <option value="soloInterno">
                  Usarlo solo para guardar imágenes internas que nadie ve.
                </option>
                <option value="unProductoGenerico">
                  Subir únicamente un producto genérico y escribir los demás a mano en cada chat.
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q14 && (
              <p className={`answer-feedback ${feedback.q14}`}>
                {feedback.q14 === "correct"
                  ? "✅ Correcto: el catálogo es más útil cuando muestras productos completos y los compartes desde ahí."
                  : "❗ El catálogo está pensado para mostrar productos organizados, no solo para almacenar imágenes sueltas."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q15 || "" : ""}`}>
            <label>
              <span className="question-text">
                15) Una emprendedora vende postres con WhatsApp Business. Quiere
                atender de forma profesional y cuidar la seguridad. ¿Cuál opción
                representa el uso más responsable?
              </span>
              <select name="q15" required onChange={handleChange} value={answers.q15 || ""}>
                <option value="">Selecciona…</option>
                <option value="automaticaSinVerificar">
                  Usar mensajes automáticos, etiquetas y catálogo, pero nunca verificar la información que reenvía.
                </option>
                <option value="soloVoz">
                  Atender solo por voz, sin escribir nada ni dejar evidencia en el chat.
                </option>
                <option value="usoResponsableBusiness">
                  Configurar perfil empresarial, mensajes de bienvenida y ausencia, usar etiquetas para pedidos y evitar compartir datos sensibles de clientes.
                </option>
                <option value="gruposMasivosDatos">
                  Aceptar a cualquiera en grupos masivos y publicar ahí todos los datos personales de los compradores.
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q15 && (
              <p className={`answer-feedback ${feedback.q15}`}>
                {feedback.q15 === "correct"
                  ? "✅ Correcto: el uso responsable combina herramientas profesionales con cuidado de la privacidad."
                  : "❗ Compartir datos sensibles o no verificar información puede poner en riesgo a los clientes y al negocio."}
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
