"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { verifyAdminSession } from "@/lib/data/auth";

type ActionResult = { error: string } | undefined;

// Restringido a https y al host de giss.tv: GISS_STATUS_URL se usa para un
// fetch server-side en /api/icecast-status, así que una URL arbitraria acá
// sería una puerta a SSRF. El host queda fijo a propósito (ver "Fuera de
// alcance" en DOCUMENTO_MAESTRO.md — solo se usa giss.tv); lo editable es el
// puerto/mount/path, no el proveedor.
function urlValida(url: string): boolean {
  try {
    const { protocol, hostname } = new URL(url);
    return protocol === "https:" && hostname === "giss.tv";
  } catch {
    return false;
  }
}

export async function actualizarConfigStream(formData: FormData): Promise<ActionResult> {
  await verifyAdminSession();

  const statusUrl = String(formData.get("statusUrl") ?? "").trim();
  const mount = String(formData.get("mount") ?? "").trim();
  const streamUrl = String(formData.get("streamUrl") ?? "").trim();

  if (!statusUrl || !mount || !streamUrl) {
    return { error: "Completá los tres campos." };
  }
  if (!mount.startsWith("/")) {
    return { error: 'El mount point debe empezar con "/" (ej. /OndasDisidentes.mp3).' };
  }
  if (!urlValida(statusUrl)) {
    return { error: "La URL de estado debe ser https y del host giss.tv." };
  }
  if (!urlValida(streamUrl)) {
    return { error: "La URL del stream debe ser https y del host giss.tv." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("configuracion_stream")
    .update({ status_url: statusUrl, mount, stream_url: streamUrl, updated_at: new Date().toISOString() })
    .eq("id", true);

  if (error) return { error: "No se pudo guardar la configuración." };

  revalidatePath("/admin/stream");
  revalidatePath("/");
}
