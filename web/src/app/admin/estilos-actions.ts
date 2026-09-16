"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { verifyAdminSession } from "@/lib/data/auth";
import type { GaleriaModo } from "@/lib/estilos";

type ActionResult = { error: string } | undefined;

export async function actualizarConfigEstilos(formData: FormData): Promise<ActionResult> {
  await verifyAdminSession();

  const tickerTexto = String(formData.get("tickerTexto") ?? "").trim();

  if (!tickerTexto) {
    return { error: "El texto de la cinta no puede quedar vacío." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("configuracion_estilos")
    .update({ ticker_texto: tickerTexto, updated_at: new Date().toISOString() })
    .eq("id", true);

  if (error) return { error: "No se pudo guardar la configuración." };

  revalidatePath("/admin/estilos");
  revalidatePath("/");
}

export async function actualizarModoGaleria(modo: GaleriaModo): Promise<ActionResult> {
  await verifyAdminSession();

  if (modo !== "auto" && modo !== "manual") {
    return { error: "Modo inválido." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("configuracion_estilos")
    .update({ galeria_modo: modo, updated_at: new Date().toISOString() })
    .eq("id", true);

  if (error) return { error: "No se pudo guardar el modo de la galería." };

  revalidatePath("/admin/estilos");
  revalidatePath("/");
}
