// Consulta del lado del servidor el status-json.xsl de Icecast en giss.tv
// para saber si el mount de Ondas Disidentes está transmitiendo. Se hace acá
// (no desde el navegador) para evitar CORS. Ver docs/DOCUMENTO_MAESTRO.md §5.

type IcecastSource = { listenurl?: string; mount?: string };

export async function GET() {
  const statusUrl = process.env.GISS_STATUS_URL;

  if (!statusUrl) {
    return Response.json({ live: false });
  }

  try {
    const res = await fetch(statusUrl, { cache: "no-store" });
    if (!res.ok) return Response.json({ live: false });

    const data = await res.json();
    const raw = data?.icestats?.source;
    const sources: IcecastSource[] = Array.isArray(raw) ? raw : raw ? [raw] : [];

    const mount = process.env.GISS_MOUNT;
    const live = mount
      ? sources.some((s) => s.listenurl?.endsWith(mount) || s.mount === mount)
      : sources.length > 0;

    return Response.json({ live });
  } catch {
    return Response.json({ live: false });
  }
}
