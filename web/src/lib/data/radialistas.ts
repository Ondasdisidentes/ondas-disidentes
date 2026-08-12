import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Radialista } from "@/lib/radialistas";

type FilaRadialista = {
  id: string;
  nombre: string;
  localidad: string;
  foto_url: string;
};

function mapRadialista(fila: FilaRadialista): Radialista {
  return {
    id: fila.id,
    nombre: fila.nombre,
    localidad: fila.localidad,
    fotoUrl: fila.foto_url,
  };
}

export async function getRadialistas(): Promise<Radialista[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("radialistas")
    .select("id, nombre, localidad, foto_url")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(mapRadialista);
}

export async function getRadialista(id: string): Promise<Radialista | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("radialistas")
    .select("id, nombre, localidad, foto_url")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data ? mapRadialista(data) : null;
}
