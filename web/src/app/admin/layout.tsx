import type { Metadata } from "next";
import Link from "next/link";
import "./admin.css";
import { createClient } from "@/lib/supabase/server";
import { ADMIN_EMAIL } from "@/lib/data/auth";
import { logout, solicitarCambioContrasena } from "./actions";
import { ProfileMenu } from "./profile-menu";

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
        <Link href="/admin" className="admin__hd-title">
          <h1 className="admin__heading">Panel de administración</h1>
          <p>Ondas Disidentes</p>
        </Link>
        {estaLogueado ? (
          <ProfileMenu email={user!.email!} cambiarContrasena={solicitarCambioContrasena} cerrarSesion={logout} />
        ) : (
          <Link href="/" className="admin__back">
            ← Volver al sitio
          </Link>
        )}
      </header>

      <main className="admin__main">{children}</main>
    </div>
  );
}
