export default function AvatarAlumno({ tipo, nombre }) {
  const iniciales = nombre.trim().split(/\s+/).slice(0, 2).map(p => p[0]).join("").toUpperCase();
  return <span className="panel-alumno__avatar" role="img" aria-label={`Avatar de ${nombre}`}>
    {tipo === "hombre" || tipo === "mujer" ? (
      <svg viewBox="0 0 80 80" aria-hidden="true">
        {tipo === "mujer" && <path d="M23 48V31a17 17 0 0 1 34 0v17l-9 4H32Z" fill="#384844" />}
        <path d="M12 80a28 28 0 0 1 56 0" fill={tipo === "mujer" ? "#7a1e3a" : "#286348"} />
        <path d="M34 46h12v12a6 6 0 0 1-12 0Z" fill="#bb795b" />
        <rect x="27" y="20" width="26" height="32" rx="13" fill="#dca584" />
        <path d={tipo === "mujer" ? "M26 32c0-19 27-22 29 0-6 0-12-4-16-8-3 4-8 7-13 8Z" : "M27 32c-5-14 6-20 15-20 8 0 14 7 12 18l-5-5c-7 3-14 2-20 0Z"} fill="#384844" />
        <path d="M34 36h1m10 0h1m-10 8q4 3 8 0" fill="none" stroke="#603e33" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    ) : iniciales}
  </span>;
}
