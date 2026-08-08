import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ADMIN_EMAIL } from "@/lib/data/auth";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.email === ADMIN_EMAIL) {
    redirect("/admin");
  }

  return (
    <div>
      <div className="admin__section-hd">
        <h1 className="admin__heading">Ingresar</h1>
      </div>
      <LoginForm />
    </div>
  );
}
