import type { Metadata } from "next";
import Link from "next/link";
import "./admin.css";
import { createClient } from "@/lib/supabase/server";
import { ADMIN_EMAIL } from "@/lib/data/auth";
import { logout } from "./actions";

export const metadata: Metadata = {
  title: "Panel de administración — Ondas Disidentes",
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const estaLogueado = Boolean(user && user.email === ADMIN_EMAIL);

  return (
    <div className="admin">
      <header className="admin__hd">
        <div>
          <h1 className="admin__heading">Panel de administración</h1>
          <p>Ondas Disidentes</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1.1rem" }}>
          {estaLogueado && (
            <form action={logout}>
              <button type="submit" className="admin__logout">
                Cerrar sesión ({user!.email})
              </button>
            </form>
          )}
          <Link href="/" className="admin__back">
            ← Volver al sitio
          </Link>
        </div>
      </header>

      <main className="admin__main">{children}</main>
    </div>
  );
}
