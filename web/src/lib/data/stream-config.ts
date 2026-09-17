import "server-only";
import { createClient } from "@/lib/supabase/server";

export type StreamConfig = {
  statusUrl: string;
  mount: string;
  streamUrl: string;
};

const CONFIG_VACIA: StreamConfig = { statusUrl: "", mount: "", streamUrl: "" };

// El status-json.xsl es una ruta fija de Icecast (no de giss.tv en
// particular): cualquier servidor Icecast la expone en el mismo puerto que
// el resto de sus streams, solo cambia el protocolo/host/puerto según a
// qué instancia te conecten — confirmado con dos configuraciones reales de
// giss.tv que usaron puertos distintos (667 y 666) pero mismo patrón. Por
// eso ya no se guarda como campo aparte en /admin/stream (eso fue justo lo
// que generó una config rota: alguien puso ahí la URL del stream por
// error) — se arma sola a partir de streamUrl, mismo origen, path fijo.
function derivarStatusUrl(streamUrl: string): string {
  try {
    return new URL("/status-json.xsl", streamUrl).toString();
  } catch {
    return "";
  }
}

export async function getStreamConfig(): Promise<StreamConfig> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("configuracion_stream")
    .select("mount, stream_url")
    .eq("id", true)
    .maybeSingle();

  if (error) throw error;
  if (!data) return CONFIG_VACIA;

  return {
    statusUrl: derivarStatusUrl(data.stream_url),
    mount: data.mount,
    streamUrl: data.stream_url,
  };
}
