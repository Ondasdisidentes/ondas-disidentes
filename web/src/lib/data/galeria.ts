import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { ImagenGaleria } from "@/lib/galeria";

export async function getGaleriaImagenes(): Promise<ImagenGaleria[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("galeria_imagenes")
    .select("id, nombre, url, storage_path, creado_en")
    .order("creado_en", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((d) => ({
    id: d.id,
    nombre: d.nombre,
    url: d.url,
    storagePath: d.storage_path,
    creadoEn: d.creado_en,
  }));
}
