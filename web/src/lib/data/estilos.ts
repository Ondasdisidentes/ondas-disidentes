import "server-only";
import { createClient } from "@/lib/supabase/server";

export type EstilosConfig = {
  tickerTexto: string;
};

const CONFIG_VACIA: EstilosConfig = { tickerTexto: "" };

export async function getEstilosConfig(): Promise<EstilosConfig> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("configuracion_estilos")
    .select("ticker_texto")
    .eq("id", true)
    .maybeSingle();

  if (error) throw error;
  if (!data) return CONFIG_VACIA;

  return { tickerTexto: data.ticker_texto ?? "" };
}
