"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { verifyAdminSession } from "@/lib/data/auth";

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
