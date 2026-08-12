"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { verifyAdminSession } from "@/lib/data/auth";
import { ICONO_PROGRAMA_DEFAULT, type ContenidoEpisodio } from "@/lib/programas";

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

async function origenSitio(): Promise<string> {
  const headerList = await headers();
  const host = headerList.get("host") ?? "";
  const protocolo = headerList.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${protocolo}://${host}`;
}

// Dispara el correo de recuperación de Supabase Auth — el admin arma la
// contraseña nueva en /admin/actualizar-contrasena, adonde apunta el link.
// Nota: la URL de redirect tiene que estar en la allowlist de Supabase
// (Authentication → URL Configuration → Redirect URLs) o Supabase la ignora.
export async function solicitarCambioContrasena(): Promise<{ error: string } | undefined> {
  const user = await verifyAdminSession();

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(user.email!, {
    redirectTo: `${await origenSitio()}/admin/actualizar-contrasena`,
  });

  if (error) return { error: "No se pudo enviar el correo. Probá de nuevo en unos minutos." };
}

type EpisodioInput = {
  nombre: string;
  descripcion: string;
  duracion: string;
  contenido: ContenidoEpisodio;
};

const BUCKET_AUDIO = "episodios-audio";
const EXT_AUDIO_POR_MIME: Record<string, string> = {
  "audio/mpeg": "mp3",
  "audio/mp3": "mp3",
  "audio/wav": "wav",
  "audio/x-wav": "wav",
  "audio/ogg": "ogg",
  "audio/mp4": "m4a",
  "audio/x-m4a": "m4a",
};
const MAX_AUDIO_BYTES = 200 * 1024 * 1024;

export async function subirAudioEpisodio(
  formData: FormData
): Promise<{ url: string } | { error: string }> {
  await verifyAdminSession();

  const archivo = formData.get("archivo");
  if (!(archivo instanceof File) || archivo.size === 0) {
    return { error: "Elegí un archivo de audio." };
  }

  const ext = EXT_AUDIO_POR_MIME[archivo.type];
  if (!ext) return { error: "El archivo debe ser MP3, WAV, OGG o M4A." };
  if (archivo.size > MAX_AUDIO_BYTES) return { error: "El audio no puede pesar más de 200MB." };

  const supabase = await createClient();
  const nombreArchivo = `${crypto.randomUUID()}.${ext}`;
  const { error: errorSubida } = await supabase.storage.from(BUCKET_AUDIO).upload(nombreArchivo, archivo, {
    contentType: archivo.type,
  });
  if (errorSubida) return { error: "No se pudo subir el audio." };

  const { data } = supabase.storage.from(BUCKET_AUDIO).getPublicUrl(nombreArchivo);
  return { url: data.publicUrl };
}

const BUCKET_IMAGEN_PROGRAMA = "programas";
const EXT_IMG_POR_MIME: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};
const MAX_IMG_BYTES = 5 * 1024 * 1024;

export async function subirImagenPrograma(
  formData: FormData
): Promise<{ url: string } | { error: string }> {
  await verifyAdminSession();

  const archivo = formData.get("archivo");
  if (!(archivo instanceof File) || archivo.size === 0) {
    return { error: "Elegí una imagen." };
  }

  const ext = EXT_IMG_POR_MIME[archivo.type];
  if (!ext) return { error: "La imagen debe ser PNG, JPG o WEBP." };
  if (archivo.size > MAX_IMG_BYTES) return { error: "La imagen no puede pesar más de 5MB." };

  const supabase = await createClient();
  const nombreArchivo = `${crypto.randomUUID()}.${ext}`;
  const { error: errorSubida } = await supabase.storage.from(BUCKET_IMAGEN_PROGRAMA).upload(nombreArchivo, archivo, {
    contentType: archivo.type,
  });
  if (errorSubida) return { error: "No se pudo subir la imagen." };

  const { data } = supabase.storage.from(BUCKET_IMAGEN_PROGRAMA).getPublicUrl(nombreArchivo);
  return { url: data.publicUrl };
}

type ProgramaInput = {
  titulo: string;
  descripcion: string;
  icono: string | null;
  radialistaId: string;
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
  if (!input.titulo.trim()) {
    return { error: "Falta el título." };
  }
  if (!input.radialistaId) {
    return { error: "Falta asignar un radialista." };
  }

  const supabase = await createClient();

  const { data: programa, error } = await supabase
    .from("programas")
    .insert({
      titulo: input.titulo.trim(),
      descripcion: input.descripcion,
      icono: input.icono || ICONO_PROGRAMA_DEFAULT,
      radialista_id: input.radialistaId,
    })
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

  revalidatePath("/admin/programas");
  revalidatePath("/");
  redirect("/admin/programas");
}

export async function actualizarPrograma(
  id: string,
  cambios: { titulo: string; descripcion: string; icono: string; radialistaId: string }
): Promise<ActionResult> {
  await verifyAdminSession();
  if (!cambios.titulo.trim() || !cambios.icono) {
    return { error: "Falta título o ícono." };
  }
  if (!cambios.radialistaId) {
    return { error: "Falta asignar un radialista." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("programas")
    .update({
      titulo: cambios.titulo.trim(),
      descripcion: cambios.descripcion,
      icono: cambios.icono,
      radialista_id: cambios.radialistaId,
    })
    .eq("id", id);

  if (error) return { error: "No se pudo guardar el programa." };

  revalidatePath("/admin/programas");
  revalidatePath(`/admin/programas/${id}`);
  revalidatePath("/");
}

export async function eliminarPrograma(id: string): Promise<ActionResult> {
  await verifyAdminSession();

  const supabase = await createClient();
  const { error } = await supabase.from("programas").delete().eq("id", id);
  if (error) return { error: "No se pudo eliminar el programa." };

  revalidatePath("/admin/programas");
  revalidatePath("/");
  redirect("/admin/programas");
}

export async function eliminarEpisodio(id: string, programaId: string): Promise<ActionResult> {
  await verifyAdminSession();

  const supabase = await createClient();
  const { error } = await supabase.from("episodios").delete().eq("id", id);
  if (error) return { error: "No se pudo eliminar el episodio." };

  revalidatePath("/admin/programas");
  revalidatePath(`/admin/programas/${programaId}`);
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

  revalidatePath("/admin/programas");
  revalidatePath(`/admin/programas/${programaId}`);
  revalidatePath("/");
  redirect(`/admin/programas/${programaId}?tab=episodios`);
}
