"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type LoginState = { error: string } | undefined;

const VENTANA_MINUTOS = 15;
const MAX_INTENTOS = 5;

export async function login(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || "local-dev";

  const supabase = await createClient();

  // Rate limit vía la función security-definer intentos_recientes — cuenta
  // sin exponer las filas de login_intentos (ver supabase/migrations).
  const { data: intentos, error: errorConteo } = await supabase.rpc("intentos_recientes", {
    p_identificador: ip,
    p_minutos: VENTANA_MINUTOS,
  });

  if (!errorConteo && typeof intentos === "number" && intentos >= MAX_INTENTOS) {
    return { error: "Demasiados intentos. Probá de nuevo en unos minutos." };
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Solo los intentos fallidos cuentan para el límite, así el admin no se
    // bloquea a sí mismo con logins legítimos.
    await supabase.from("login_intentos").insert({ identificador: ip });
    return { error: "Credenciales inválidas." };
  }

  redirect("/admin");
}
