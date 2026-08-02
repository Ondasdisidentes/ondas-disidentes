import type { Metadata } from "next";
import Link from "next/link";
import "./admin.css";
import { ProgramasProvider } from "./programas-context";

export const metadata: Metadata = {
  title: "Panel de administración — Ondas Disidentes",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProgramasProvider>
      <div className="admin">
        <header className="admin__hd">
          <div>
            <h1 className="admin__heading">Panel de administración</h1>
            <p>Ondas Disidentes</p>
          </div>
          <Link href="/" className="admin__back">
            ← Volver al sitio
          </Link>
        </header>

        <div className="admin__banner">
          🔒 Esta sección requerirá inicio de sesión — todavía no hay login conectado. Los datos de esta
          página son solo de demostración: no se guardan ni se conectan al sitio público.
        </div>

        <main className="admin__main">{children}</main>
      </div>
    </ProgramasProvider>
  );
}
