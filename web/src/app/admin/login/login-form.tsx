"use client";

import { useActionState } from "react";
import { login } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <form action={action} className="admin__form" style={{ maxWidth: "22rem" }}>
      <label className="admin__field">
        <span>Correo</span>
        <input type="email" name="email" required autoComplete="email" />
      </label>
      <label className="admin__field">
        <span>Contraseña</span>
        <input type="password" name="password" required autoComplete="current-password" />
      </label>

      {state?.error && <p className="admin__error">{state.error}</p>}

      <div className="admin__form-footer">
        <button type="submit" className="admin__btn" disabled={pending}>
          {pending ? "Ingresando…" : "Ingresar"}
        </button>
      </div>
    </form>
  );
}
