import { verifyAdminSession } from "@/lib/data/auth";
import { NuevoProgramaForm } from "./nuevo-programa-form";

export default async function NuevoProgramaPage() {
  await verifyAdminSession();
  return <NuevoProgramaForm />;
}
