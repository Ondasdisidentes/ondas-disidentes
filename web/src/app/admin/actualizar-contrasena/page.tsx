import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ADMIN_EMAIL } from "@/lib/data/auth";
import { NuevaContrasenaForm } from "./nueva-contrasena-form";

export default async function ActualizarContrasenaPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;
  const supabase = await createClient();

  // El link del correo llega con ?code= la primera vez — lo canjeamos acá
  // por la sesión de recuperación. Si el code es inválido o ya se usó,
  // getUser() de abajo simplemente no encuentra sesión y se redirige a login.
  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email !== ADMIN_EMAIL) {
    redirect("/admin/login");
  }

  return (
    <div>
      <div className="admin__section-hd">
        <h1 className="admin__heading">Nueva contraseña</h1>
      </div>
      <NuevaContrasenaForm />
    </div>
  );
}
