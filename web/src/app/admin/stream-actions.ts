"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { verifyAdminSession } from "@/lib/data/auth";

type ActionResult = { error: string } | undefined;

// Restringido a https y al host de giss.tv: streamUrl es la base de la que
// se deriva la URL de estado (ver derivarStatusUrl en stream-config.ts),
// que se usa para un fetch server-side en /api/icecast-status — una URL
// arbitraria acá sería una puerta a SSRF. El host queda fijo a propósito
// (ver "Fuera de alcance" en DOCUMENTO_MAESTRO.md — solo se usa giss.tv);
// lo editable es el puerto/mount/path, no el proveedor.
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

  const mount = String(formData.get("mount") ?? "").trim();
  const streamUrl = String(formData.get("streamUrl") ?? "").trim();

  if (!mount || !streamUrl) {
    return { error: "Completá los dos campos." };
  }
  if (!mount.startsWith("/")) {
    return { error: 'El mount point debe empezar con "/" (ej. /laboratoriosur.ogg).' };
  }
  if (!urlValida(streamUrl)) {
    return { error: "La URL del stream debe ser https y del host giss.tv." };
  }

  // La URL de estado (status-json.xsl) ya no se guarda aparte: se arma
  // sola a partir de streamUrl (mismo origen, path fijo de Icecast) — ver
  // derivarStatusUrl en src/lib/data/stream-config.ts. Antes era un campo
  // editable separado y eso generó justo el problema que lo llevó a
  // sacarse: alguien puso ahí la URL del stream por error.
  const supabase = await createClient();
  const { error } = await supabase
    .from("configuracion_stream")
    .update({ mount, stream_url: streamUrl, updated_at: new Date().toISOString() })
    .eq("id", true);

  if (error) return { error: "No se pudo guardar la configuración." };

  revalidatePath("/admin/stream");
  revalidatePath("/");
}
