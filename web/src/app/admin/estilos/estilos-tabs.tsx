"use client";

import { useState } from "react";
import Link from "next/link";
import type { EstilosConfig } from "@/lib/estilos";
import type { ImagenGaleria } from "@/lib/galeria";
import { CintaTab } from "./cinta-tab";
import { GaleriaTab } from "./galeria-tab";

function cx(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

type Tab = "cinta" | "galeria";

export function EstilosTabs({
  config,
  imagenesGaleria,
}: {
  config: EstilosConfig;
  imagenesGaleria: ImagenGaleria[];
}) {
  const [tab, setTab] = useState<Tab>("cinta");

  return (
    <div>
      <div className="admin__section-hd">
        <div className="admin__section-hd-left">
          <Link href="/admin" className="admin__btn admin__btn--ghost">
            ← Atrás
          </Link>
          <h2 className="admin__heading">Estilos</h2>
        </div>
      </div>

      <div className="admin__tabs">
        <button type="button" className={cx("admin__tab", tab === "cinta" && "is-active")} onClick={() => setTab("cinta")}>
          Cinta
        </button>
        <button type="button" className={cx("admin__tab", tab === "galeria" && "is-active")} onClick={() => setTab("galeria")}>
          Galería ({imagenesGaleria.length})
        </button>
      </div>

      {tab === "cinta" ? (
        <CintaTab config={config} />
      ) : (
        <GaleriaTab imagenesIniciales={imagenesGaleria} modoInicial={config.galeriaModo} />
      )}
    </div>
  );
}
