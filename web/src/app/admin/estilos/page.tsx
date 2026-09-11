import { verifyAdminSession } from "@/lib/data/auth";
import { getEstilosConfig } from "@/lib/data/estilos";
import { EstilosConfigForm } from "./estilos-config-form";

export default async function AdminEstilosPage() {
  await verifyAdminSession();
  const config = await getEstilosConfig();

  return <EstilosConfigForm config={config} />;
}
