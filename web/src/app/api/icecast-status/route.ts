// Consulta del lado del servidor el status-json.xsl de Icecast en giss.tv
// para saber si el mount de Ondas Disidentes está transmitiendo. Se hace acá
// (no desde el navegador) para evitar CORS. Ver docs/DOCUMENTO_MAESTRO.md §5.
//
// La configuración (status_url/mount/stream_url) vive en Supabase
// (tabla configuracion_stream, editable desde /admin/stream) en vez de
// variables de entorno, así el equipo puede actualizarla sin redeploy.

import { getStreamConfig } from "@/lib/data/stream-config";

type IcecastSource = { listenurl?: string; mount?: string };

export async function GET() {
  try {
    const { statusUrl, mount, streamUrl } = await getStreamConfig();

    if (!statusUrl) {
      return Response.json({ live: false, streamUrl });
    }

    const res = await fetch(statusUrl, { cache: "no-store" });
    if (!res.ok) return Response.json({ live: false, streamUrl });

    const data = await res.json();
    const raw = data?.icestats?.source;
    const sources: IcecastSource[] = Array.isArray(raw) ? raw : raw ? [raw] : [];

    const live = mount
      ? sources.some((s) => s.listenurl?.endsWith(mount) || s.mount === mount)
      : sources.length > 0;

    return Response.json({ live, streamUrl });
  } catch {
    // Incluye el caso de que la migración de configuracion_stream todavía no
    // se haya corrido en Supabase — se degrada a "no en vivo" en vez de 500.
    return Response.json({ live: false, streamUrl: "" });
  }
}
