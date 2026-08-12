"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export function ProfileMenu({
  email,
  cambiarContrasena,
  cerrarSesion,
}: {
  email: string;
  cambiarContrasena: () => Promise<{ error: string } | undefined>;
  cerrarSesion: () => Promise<void>;
}) {
  const [abierto, setAbierto] = useState(false);
  const [enviandoReset, setEnviandoReset] = useState(false);
  const [mensajeReset, setMensajeReset] = useState<string | null>(null);
  const [errorReset, setErrorReset] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!abierto) return;
    function onPointerDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setAbierto(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setAbierto(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [abierto]);

  function toggle() {
    setAbierto((v) => !v);
    setMensajeReset(null);
    setErrorReset(null);
  }

  async function handleCambiarContrasena() {
    setEnviandoReset(true);
    setErrorReset(null);
    setMensajeReset(null);
    const resultado = await cambiarContrasena();
    setEnviandoReset(false);
    if (resultado?.error) {
      setErrorReset(resultado.error);
      return;
    }
    setMensajeReset("Te enviamos un link a tu correo.");
  }

  return (
    <div className="admin__profile" ref={ref}>
      <button
        type="button"
        className="admin__profile-btn"
        aria-label="Perfil"
        aria-haspopup="menu"
        aria-expanded={abierto}
        onClick={toggle}
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
          <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
          <path
            d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {abierto && (
        <div className="admin__profile-menu" role="menu">
          <p className="admin__profile-email">{email}</p>
          <span className="admin__profile-role">Rol Admin</span>

          <div className="admin__profile-divider" />

          <button
            type="button"
            role="menuitem"
            className="admin__profile-item"
            onClick={handleCambiarContrasena}
            disabled={enviandoReset}
          >
            {enviandoReset ? "Enviando…" : "Cambiar contraseña"}
          </button>
          {mensajeReset && <p className="admin__profile-hint">{mensajeReset}</p>}
          {errorReset && <p className="admin__error">{errorReset}</p>}

          <Link href="/" role="menuitem" className="admin__profile-item" onClick={() => setAbierto(false)}>
            Visitar sitio oficial
          </Link>

          <div className="admin__profile-divider" />

          <form action={cerrarSesion}>
            <button type="submit" role="menuitem" className="admin__profile-item admin__profile-item--danger">
              Cerrar sesión
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
