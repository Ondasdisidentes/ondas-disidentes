"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { verifyAdminSession } from "@/lib/data/auth";

type ActionResult = { error: string } | undefined;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TELEFONO_RE = /^[0-9+\-\s()]+$/;

// Los enlaces se renderizan como href en el sitio público: solo se aceptan
// URLs https para evitar esquemas como "javascript:" en el markup.
function urlValida(url: string): boolean {
  try {
    return new URL(url).protocol === "https:";
  } catch {
    return false;
  }
}

export async function actualizarConfigContacto(formData: FormData): Promise<ActionResult> {
  await verifyAdminSession();

  const email = String(formData.get("email") ?? "").trim();
  const telefono = String(formData.get("telefono") ?? "").trim();
  const instagram = String(formData.get("instagram") ?? "").trim();
  const facebook = String(formData.get("facebook") ?? "").trim();
  const soundcloud = String(formData.get("soundcloud") ?? "").trim();
  const tiktok = String(formData.get("tiktok") ?? "").trim();
  const youtube = String(formData.get("youtube") ?? "").trim();

  if (email && !EMAIL_RE.test(email)) {
    return { error: "El email de contacto no es válido." };
  }
  if (telefono && !TELEFONO_RE.test(telefono)) {
    return { error: "El teléfono solo puede tener números, espacios, +, - y paréntesis." };
  }
  if (instagram && !urlValida(instagram)) {
    return { error: "El link de Instagram debe ser una URL https válida." };
  }
  if (facebook && !urlValida(facebook)) {
    return { error: "El link de Facebook debe ser una URL https válida." };
  }
  if (soundcloud && !urlValida(soundcloud)) {
    return { error: "El link de SoundCloud debe ser una URL https válida." };
  }
  if (tiktok && !urlValida(tiktok)) {
    return { error: "El link de TikTok debe ser una URL https válida." };
  }
  if (youtube && !urlValida(youtube)) {
    return { error: "El link de YouTube debe ser una URL https válida." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("configuracion_contacto")
    .update({
      email: email || null,
      telefono: telefono || null,
      instagram: instagram || null,
      facebook: facebook || null,
      soundcloud: soundcloud || null,
      tiktok: tiktok || null,
      youtube: youtube || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", true);

  if (error) return { error: "No se pudo guardar la configuración." };

  revalidatePath("/admin/contacto");
  revalidatePath("/");
}
