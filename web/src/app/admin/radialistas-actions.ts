"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { verifyAdminSession } from "@/lib/data/auth";
import { getRadialista } from "@/lib/data/radialistas";
import type { Radialista } from "@/lib/radialistas";

type ActionResult = { error: string } | undefined;

const BUCKET = "panelistas";
const EXT_POR_MIME: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

function rutaSiEsSubidaPropia(fotoUrl: string, supabaseUrl: string): string | null {
  const prefijo = `${supabaseUrl}/storage/v1/object/public/${BUCKET}/`;
  return fotoUrl.startsWith(prefijo) ? fotoUrl.slice(prefijo.length) : null;
}

async function resolverFotoUrl(
  supabase: Awaited<ReturnType<typeof createClient>>,
  formData: FormData,
  fotoActual?: string
): Promise<{ fotoUrl: string } | { error: string }> {
  const tipo = String(formData.get("tipo") ?? "");

  if (tipo === "icono") {
    const icono = String(formData.get("icono") ?? "");
    if (!icono) return { error: "Elegí un ícono." };
    return { fotoUrl: icono };
  }

  const foto = formData.get("foto");
  if (!(foto instanceof File) || foto.size === 0) {
    // Modo edición sin foto nueva: se mantiene la actual tal cual.
    if (fotoActual) return { fotoUrl: fotoActual };
    return { error: "Subí una foto." };
  }

  const ext = EXT_POR_MIME[foto.type];
  if (!ext) return { error: "La foto debe ser PNG, JPG o WEBP." };
  if (foto.size > 5 * 1024 * 1024) return { error: "La foto no puede pesar más de 5MB." };

  const nombreArchivo = `${crypto.randomUUID()}.${ext}`;
  const { error: errorSubida } = await supabase.storage.from(BUCKET).upload(nombreArchivo, foto, {
    contentType: foto.type,
  });
  if (errorSubida) return { error: "No se pudo subir la foto." };

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(nombreArchivo);
  return { fotoUrl: data.publicUrl };
}

// No redirige: la reutilizan tanto la página dedicada "Agregar radialista"
// (que sí navega después, vía router.push) como el selector inline dentro
// del formulario de programa (que se queda en la misma página y solo
// necesita el registro recién creado para preseleccionarlo).
export async function crearRadialista(
  formData: FormData
): Promise<{ radialista: Radialista } | { error: string }> {
  await verifyAdminSession();

  const nombre = String(formData.get("nombre") ?? "").trim();
  const localidad = String(formData.get("localidad") ?? "").trim();
  if (!nombre) return { error: "Falta el nombre." };

  const supabase = await createClient();
  const resultado = await resolverFotoUrl(supabase, formData);
  if ("error" in resultado) return resultado;

  const { data, error } = await supabase
    .from("radialistas")
    .insert({ nombre, localidad, foto_url: resultado.fotoUrl })
    .select("id, nombre, localidad, foto_url")
    .single();

  if (error) return { error: "No se pudo crear el radialista." };

  revalidatePath("/admin/radialistas");
  revalidatePath("/admin/programas/nuevo");
  revalidatePath("/");

  return {
    radialista: { id: data.id, nombre: data.nombre, localidad: data.localidad, fotoUrl: data.foto_url },
  };
}

export async function actualizarRadialista(id: string, formData: FormData): Promise<ActionResult> {
  await verifyAdminSession();

  const nombre = String(formData.get("nombre") ?? "").trim();
  const localidad = String(formData.get("localidad") ?? "").trim();
  if (!nombre) return { error: "Falta el nombre." };

  const actual = await getRadialista(id);
  if (!actual) return { error: "No se encontró este radialista." };

  const supabase = await createClient();
  const resultado = await resolverFotoUrl(supabase, formData, actual.fotoUrl);
  if ("error" in resultado) return resultado;

  const { error } = await supabase
    .from("radialistas")
    .update({ nombre, localidad, foto_url: resultado.fotoUrl })
    .eq("id", id);

  if (error) return { error: "No se pudo guardar el radialista." };

  // Si la foto cambió y la anterior era una subida propia (no un ícono
  // estático), borramos el archivo viejo del bucket.
  if (actual.fotoUrl !== resultado.fotoUrl) {
    const rutaVieja = rutaSiEsSubidaPropia(actual.fotoUrl, process.env.NEXT_PUBLIC_SUPABASE_URL!);
    if (rutaVieja) await supabase.storage.from(BUCKET).remove([rutaVieja]);
  }

  revalidatePath("/admin/radialistas");
  revalidatePath("/");
}

export async function eliminarRadialista(id: string): Promise<ActionResult> {
  await verifyAdminSession();

  const actual = await getRadialista(id);
  if (!actual) return { error: "No se encontró este radialista." };

  const supabase = await createClient();
  const { error } = await supabase.from("radialistas").delete().eq("id", id);
  if (error) {
    // 23503 = violación de foreign key: hay programas que todavía lo tienen asignado.
    if (error.code === "23503") {
      return { error: "No se puede eliminar: hay programas con este radialista asignado." };
    }
    return { error: "No se pudo eliminar." };
  }

  const ruta = rutaSiEsSubidaPropia(actual.fotoUrl, process.env.NEXT_PUBLIC_SUPABASE_URL!);
  if (ruta) await supabase.storage.from(BUCKET).remove([ruta]);

  revalidatePath("/admin/radialistas");
  revalidatePath("/");
  redirect("/admin/radialistas");
}
