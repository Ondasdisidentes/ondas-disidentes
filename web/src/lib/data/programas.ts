import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { ContenidoEpisodio, Episodio, Programa } from "@/lib/programas";

type FilaEpisodio = {
  id: string;
  nombre: string;
  descripcion: string;
  duracion: string;
  contenido: ContenidoEpisodio;
};

type FilaPrograma = {
  id: string;
  titulo: string;
  descripcion: string;
  icono: string;
  episodios: FilaEpisodio[];
};

function mapEpisodio(fila: FilaEpisodio): Episodio {
  return {
    id: fila.id,
    nombre: fila.nombre,
    descripcion: fila.descripcion,
    duracion: fila.duracion,
    contenido: fila.contenido,
  };
}

function mapPrograma(fila: FilaPrograma): Programa {
  return {
    id: fila.id,
    titulo: fila.titulo,
    descripcion: fila.descripcion,
    icono: fila.icono,
    episodios: (fila.episodios ?? []).map(mapEpisodio),
  };
}

const SELECT_PROGRAMA_CON_EPISODIOS =
  "id, titulo, descripcion, icono, episodios(id, nombre, descripcion, duracion, contenido, created_at)";

export async function getProgramas(): Promise<Programa[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("programas")
    .select(SELECT_PROGRAMA_CON_EPISODIOS)
    .order("created_at", { ascending: true })
    .order("created_at", { referencedTable: "episodios", ascending: true });

  if (error) throw error;
  return (data ?? []).map((fila) => mapPrograma(fila as unknown as FilaPrograma));
}

export async function getPrograma(id: string): Promise<Programa | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("programas")
    .select(SELECT_PROGRAMA_CON_EPISODIOS)
    .eq("id", id)
    .order("created_at", { referencedTable: "episodios", ascending: true })
    .maybeSingle();

  if (error) throw error;
  return data ? mapPrograma(data as unknown as FilaPrograma) : null;
}
