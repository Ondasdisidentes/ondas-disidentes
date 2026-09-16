"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { verifyAdminSession } from "@/lib/data/auth";
import { MAX_IMAGENES_GALERIA, type ImagenGaleria } from "@/lib/galeria";

const BUCKET_GALERIA = "galeria";
const EXT_IMG_POR_MIME: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};
const MAX_IMG_BYTES = 5 * 1024 * 1024;

type ActionResult = { error: string } | undefined;

export async function subirImagenGaleria(
  formData: FormData
): Promise<{ imagen: ImagenGaleria } | { error: string }> {
  await verifyAdminSession();

  const archivo = formData.get("archivo");
  if (!(archivo instanceof File) || archivo.size === 0) {
    return { error: "Elegí una imagen." };
  }

  const ext = EXT_IMG_POR_MIME[archivo.type];
  if (!ext) return { error: "La imagen debe ser PNG, JPG o WEBP." };
  if (archivo.size > MAX_IMG_BYTES) return { error: "La imagen no puede pesar más de 5MB." };

  const supabase = await createClient();

  // Tope de 20: se valida acá, no solo en el cliente, porque el cliente
  // puede estar desactualizado (otra pestaña subió imágenes mientras tanto).
  const { count, error: errorConteo } = await supabase
    .from("galeria_imagenes")
    .select("id", { count: "exact", head: true });
  if (errorConteo) return { error: "No se pudo verificar la galería." };
  if ((count ?? 0) >= MAX_IMAGENES_GALERIA) {
    return { error: `La galería ya tiene el máximo de ${MAX_IMAGENES_GALERIA} imágenes.` };
  }

  const storagePath = `${crypto.randomUUID()}.${ext}`;
  const { error: errorSubida } = await supabase.storage
    .from(BUCKET_GALERIA)
    .upload(storagePath, archivo, { contentType: archivo.type });
  if (errorSubida) return { error: "No se pudo subir la imagen." };

  const { data: publicUrlData } = supabase.storage.from(BUCKET_GALERIA).getPublicUrl(storagePath);

  const { data: fila, error: errorInsert } = await supabase
    .from("galeria_imagenes")
    .insert({ nombre: archivo.name, url: publicUrlData.publicUrl, storage_path: storagePath })
    .select("id, nombre, url, storage_path, creado_en")
    .single();

  if (errorInsert || !fila) {
    // La imagen ya se subió a Storage pero no se pudo registrar en la
    // tabla: la borramos para no dejar un archivo huérfano sin fila.
    await supabase.storage.from(BUCKET_GALERIA).remove([storagePath]);
    return { error: "No se pudo guardar la imagen." };
  }

  revalidatePath("/admin/estilos");

  return {
    imagen: {
      id: fila.id,
      nombre: fila.nombre,
      url: fila.url,
      storagePath: fila.storage_path,
      creadoEn: fila.creado_en,
    },
  };
}

export async function eliminarImagenGaleria(id: string): Promise<ActionResult> {
  await verifyAdminSession();

  const supabase = await createClient();

  const { data: fila, error: errorBusqueda } = await supabase
    .from("galeria_imagenes")
    .select("storage_path")
    .eq("id", id)
    .maybeSingle();
  if (errorBusqueda) return { error: "No se pudo eliminar la imagen." };
  if (!fila) return; // ya no existe, nada que hacer

  // storage_path nulo = esta fila no es dueña de un archivo en el bucket
  // 'galeria' (foto de prueba sembrada desde radialistas) — no hay nada que
  // borrar en Storage, solo la fila.
  if (fila.storage_path) {
    const { error: errorStorage } = await supabase.storage
      .from(BUCKET_GALERIA)
      .remove([fila.storage_path]);
    if (errorStorage) return { error: "No se pudo eliminar el archivo de la imagen." };
  }

  const { error: errorDelete } = await supabase.from("galeria_imagenes").delete().eq("id", id);
  if (errorDelete) return { error: "La imagen se borró del almacenamiento pero no de la lista." };

  revalidatePath("/admin/estilos");
}
