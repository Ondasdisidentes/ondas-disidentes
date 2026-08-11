import "server-only";
import { createClient } from "@/lib/supabase/server";

export type StreamConfig = {
  statusUrl: string;
  mount: string;
  streamUrl: string;
};

const CONFIG_VACIA: StreamConfig = { statusUrl: "", mount: "", streamUrl: "" };

export async function getStreamConfig(): Promise<StreamConfig> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("configuracion_stream")
    .select("status_url, mount, stream_url")
    .eq("id", true)
    .maybeSingle();

  if (error) throw error;
  if (!data) return CONFIG_VACIA;

  return { statusUrl: data.status_url, mount: data.mount, streamUrl: data.stream_url };
}
