import { verifyAdminSession } from "@/lib/data/auth";
import { PanelistaForm } from "../panelista-form";

export default async function NuevoPanelistaPage() {
  await verifyAdminSession();
  return <PanelistaForm />;
}
