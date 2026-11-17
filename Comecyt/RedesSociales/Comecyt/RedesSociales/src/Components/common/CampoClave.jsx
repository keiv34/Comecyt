import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function CampoClave({ id, name, etiqueta, autoComplete, minLength }) {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <label htmlFor={id}>{etiqueta}</label>
      <div className="acceso-agora__clave">
        <input id={id} name={name} type={visible ? "text" : "password"} autoComplete={autoComplete}
          minLength={minLength} required />
        <button type="button" aria-label={`${visible ? "Ocultar" : "Mostrar"} ${etiqueta.toLowerCase()}`}
          aria-controls={id} onClick={() => setVisible(valor => !valor)}>
          {visible ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
        </button>
      </div>
    </>
  );
}
