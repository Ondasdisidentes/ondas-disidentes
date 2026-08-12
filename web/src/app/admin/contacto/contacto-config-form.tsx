"use client";

import { useState } from "react";
import Link from "next/link";
import type { ContactoConfig } from "@/lib/data/contacto";
import { actualizarConfigContacto } from "../contacto-actions";

export function ContactoConfigForm({ config }: { config: ContactoConfig }) {
  const [email, setEmail] = useState(config.email);
  const [telefono, setTelefono] = useState(config.telefono);
  const [instagram, setInstagram] = useState(config.instagram);
  const [facebook, setFacebook] = useState(config.facebook);
  const [soundcloud, setSoundcloud] = useState(config.soundcloud);
  const [tiktok, setTiktok] = useState(config.tiktok);
  const [youtube, setYoutube] = useState(config.youtube);
  const [error, setError] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  async function handleGuardar() {
    setError(null);
    setGuardado(false);
    setEnviando(true);

    const formData = new FormData();
    formData.set("email", email.trim());
    formData.set("telefono", telefono.trim());
    formData.set("instagram", instagram.trim());
    formData.set("facebook", facebook.trim());
    formData.set("soundcloud", soundcloud.trim());
    formData.set("tiktok", tiktok.trim());
    formData.set("youtube", youtube.trim());

    const resultado = await actualizarConfigContacto(formData);
    setEnviando(false);
    if (resultado?.error) {
      setError(resultado.error);
      return;
    }
    setGuardado(true);
  }

  return (
    <div>
      <div className="admin__section-hd">
        <div className="admin__section-hd-left">
          <Link href="/admin" className="admin__btn admin__btn--ghost">
            ← Atrás
          </Link>
          <h2 className="admin__heading">Contacto</h2>
        </div>
      </div>

      <div className="admin__form">
        <p className="admin__hint" style={{ display: "block", marginBottom: "1rem" }}>
          Estos datos aparecen en el footer y en el menú del sitio. Dejar un campo vacío y
          guardar elimina ese hipervínculo del sitio público.
        </p>

        <label className="admin__field">
          <span>Email de contacto</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="contacto@ondasdisidentes.org"
          />
        </label>

        <label className="admin__field">
          <span>Teléfono</span>
          <input
            type="tel"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="+591 67754287"
          />
        </label>

        <label className="admin__field">
          <span>Instagram</span>
          <input
            type="url"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            placeholder="https://instagram.com/ondasdisidentes"
          />
        </label>

        <label className="admin__field">
          <span>Facebook</span>
          <input
            type="url"
            value={facebook}
            onChange={(e) => setFacebook(e.target.value)}
            placeholder="https://facebook.com/ondasdisidentes"
          />
        </label>

        <label className="admin__field">
          <span>SoundCloud</span>
          <input
            type="url"
            value={soundcloud}
            onChange={(e) => setSoundcloud(e.target.value)}
            placeholder="https://soundcloud.com/ondasdisidentes"
          />
        </label>

        <label className="admin__field">
          <span>TikTok</span>
          <input
            type="url"
            value={tiktok}
            onChange={(e) => setTiktok(e.target.value)}
            placeholder="https://tiktok.com/@ondasdisidentes"
          />
        </label>

        <label className="admin__field">
          <span>YouTube</span>
          <input
            type="url"
            value={youtube}
            onChange={(e) => setYoutube(e.target.value)}
            placeholder="https://youtube.com/@ondasdisidentes"
          />
        </label>

        {error && <p className="admin__error">{error}</p>}
        {guardado && !error && <p className="admin__hint">Guardado.</p>}

        <div className="admin__wizard-nav">
          <div style={{ flex: 1 }} />
          <button type="button" onClick={handleGuardar} disabled={enviando} className="admin__btn">
            {enviando ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}
