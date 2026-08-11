"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { verifyAdminSession } from "@/lib/data/auth";
import type { ContenidoEpisodio } from "@/lib/programas";

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

type EpisodioInput = {
  nombre: string;
  descripcion: string;
  duracion: string;
  contenido: ContenidoEpisodio;
};

type ProgramaInput = {
  titulo: string;
  descripcion: string;
  icono: string;
  episodios: EpisodioInput[];
};

type ActionResult = { error: string } | undefined;

// Nota: cuando hay éxito, cada función termina en redirect() — eso lanza un
// control-flow exception a propósito (NEXT_REDIRECT). El caller en el
// cliente NO debe envolver el await en try/catch por eso: en vez de tirar
// errores, estas funciones devuelven { error } y solo redirigen si todo
// salió bien, así el llamador nunca necesita distinguir un throw real de
// una redirección.

export async function crearPrograma(input: ProgramaInput): Promise<ActionResult> {
  await verifyAdminSession();
  if (!input.titulo.trim() || !input.icono) {
    return { error: "Falta título o ícono." };
  }

  const supabase = await createClient();

  const { data: programa, error } = await supabase
    .from("programas")
    .insert({ titulo: input.titulo.trim(), descripcion: input.descripcion, icono: input.icono })
    .select("id")
    .single();

  if (error) return { error: "No se pudo crear el programa." };

  if (input.episodios.length > 0) {
    const { error: errorEpisodios } = await supabase.from("episodios").insert(
      input.episodios.map((e) => ({
        programa_id: programa.id,
        nombre: e.nombre,
        descripcion: e.descripcion,
        duracion: e.duracion,
        contenido: e.contenido,
      }))
    );
    if (errorEpisodios) return { error: "El programa se creó, pero fallaron los episodios." };
  }

  revalidatePath("/admin");
  revalidatePath("/");
  redirect("/admin");
}

export async function actualizarPrograma(
  id: string,
  cambios: { titulo: string; descripcion: string; icono: string }
): Promise<ActionResult> {
  await verifyAdminSession();
  if (!cambios.titulo.trim() || !cambios.icono) {
    return { error: "Falta título o ícono." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("programas")
    .update({ titulo: cambios.titulo.trim(), descripcion: cambios.descripcion, icono: cambios.icono })
    .eq("id", id);

  if (error) return { error: "No se pudo guardar el programa." };

  revalidatePath("/admin");
  revalidatePath(`/admin/programas/${id}`);
  revalidatePath("/");
}

export async function crearEpisodio(programaId: string, episodio: EpisodioInput): Promise<ActionResult> {
  await verifyAdminSession();
  if (!episodio.nombre.trim()) {
    return { error: "Falta el nombre del episodio." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("episodios").insert({
    programa_id: programaId,
    nombre: episodio.nombre.trim(),
    descripcion: episodio.descripcion,
    duracion: episodio.duracion,
    contenido: episodio.contenido,
  });

  if (error) return { error: "No se pudo crear el episodio." };

  revalidatePath("/admin");
  revalidatePath(`/admin/programas/${programaId}`);
  revalidatePath("/");
  redirect(`/admin/programas/${programaId}?tab=episodios`);
}
