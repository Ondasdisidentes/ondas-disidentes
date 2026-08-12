import "server-only";
import { createClient } from "@/lib/supabase/server";

export type ContactoConfig = {
  email: string;
  telefono: string;
  instagram: string;
  facebook: string;
  soundcloud: string;
  tiktok: string;
  youtube: string;
};

const CONFIG_VACIA: ContactoConfig = {
  email: "",
  telefono: "",
  instagram: "",
  facebook: "",
  soundcloud: "",
  tiktok: "",
  youtube: "",
};

export async function getContactoConfig(): Promise<ContactoConfig> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("configuracion_contacto")
    .select("email, telefono, instagram, facebook, soundcloud, tiktok, youtube")
    .eq("id", true)
    .maybeSingle();

  if (error) throw error;
  if (!data) return CONFIG_VACIA;

  return {
    email: data.email ?? "",
    telefono: data.telefono ?? "",
    instagram: data.instagram ?? "",
    facebook: data.facebook ?? "",
    soundcloud: data.soundcloud ?? "",
    tiktok: data.tiktok ?? "",
    youtube: data.youtube ?? "",
  };
}
