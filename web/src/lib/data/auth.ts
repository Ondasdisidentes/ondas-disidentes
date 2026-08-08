import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Único admin del sitio — debe coincidir con el email hardcodeado en las
// policies RLS de supabase/migrations/0001_admin_schema.sql. Si alguna vez
// cambia, hay que actualizar ambos lugares.
export const ADMIN_EMAIL = "ondasdisidentes@outlook.com";

// Capa 2 de 3: re-chequea la sesión en cada page/Server Action de /admin, sin
// confiar en el redirect optimista del proxy (una capa no reemplaza a la
// otra — ver web/src/proxy.ts). La capa real e innegociable son las policies
// RLS: aunque este chequeo tuviera un bug, una escritura sin sesión válida
// del admin exacto sigue siendo rechazada por Postgres.
export const verifyAdminSession = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email !== ADMIN_EMAIL) {
    redirect("/admin/login");
  }

  return user;
});
