import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { EstilosConfig } from "@/lib/estilos";

const CONFIG_VACIA: EstilosConfig = { tickerTexto: "", galeriaModo: "auto" };

export async function getEstilosConfig(): Promise<EstilosConfig> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("configuracion_estilos")
    .select("ticker_texto, galeria_modo")
    .eq("id", true)
    .maybeSingle();

  if (error) throw error;
  if (!data) return CONFIG_VACIA;

  return {
    tickerTexto: data.ticker_texto ?? "",
    galeriaModo: data.galeria_modo === "manual" ? "manual" : "auto",
  };
}
