import { verifyAdminSession } from "@/lib/data/auth";
import { getContactoConfig } from "@/lib/data/contacto";
import { ContactoConfigForm } from "./contacto-config-form";

export default async function AdminContactoPage() {
  await verifyAdminSession();
  const config = await getContactoConfig();

  return <ContactoConfigForm config={config} />;
}
