export const PREFIJO_AVATAR = "agora.avatar.";

export function limpiarSesion() {
  for (const clave of Object.keys(localStorage)) {
    if (!clave.startsWith(PREFIJO_AVATAR)) localStorage.removeItem(clave);
  }
}
