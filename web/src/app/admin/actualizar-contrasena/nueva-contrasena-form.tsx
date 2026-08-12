"use client";

import { useActionState } from "react";
import { actualizarContrasena } from "./actions";

export function NuevaContrasenaForm() {
  const [state, action, pending] = useActionState(actualizarContrasena, undefined);

  return (
    <form action={action} className="admin__form" style={{ maxWidth: "22rem" }}>
      <label className="admin__field">
        <span>Nueva contraseña</span>
        <input type="password" name="password" required minLength={8} autoComplete="new-password" />
      </label>
      <label className="admin__field">
        <span>Confirmar contraseña</span>
        <input type="password" name="confirmacion" required minLength={8} autoComplete="new-password" />
      </label>

      {state?.error && <p className="admin__error">{state.error}</p>}

      <div className="admin__form-footer">
        <button type="submit" className="admin__btn" disabled={pending}>
          {pending ? "Guardando…" : "Guardar contraseña"}
        </button>
      </div>
    </form>
  );
}
