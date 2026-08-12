import { verifyAdminSession } from "@/lib/data/auth";
import { RadialistaForm } from "../radialista-form";

export default async function NuevoRadialistaPage() {
  await verifyAdminSession();
  return <RadialistaForm />;
}
