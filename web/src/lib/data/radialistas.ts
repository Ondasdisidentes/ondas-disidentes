import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Panelista } from "@/lib/panelistas";

type FilaPanelista = {
  id: string;
  nombre: string;
  puesto: string;
  foto_url: string;
};

function mapPanelista(fila: FilaPanelista): Panelista {
  return {
    id: fila.id,
    nombre: fila.nombre,
    puesto: fila.puesto,
    fotoUrl: fila.foto_url,
  };
}

export async function getPanelistas(): Promise<Panelista[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("panelistas")
    .select("id, nombre, puesto, foto_url")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(mapPanelista);
}

export async function getPanelista(id: string): Promise<Panelista | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("panelistas")
    .select("id, nombre, puesto, foto_url")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data ? mapPanelista(data) : null;
}
