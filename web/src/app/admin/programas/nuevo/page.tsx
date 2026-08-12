import { verifyAdminSession } from "@/lib/data/auth";
import { getRadialistas } from "@/lib/data/radialistas";
import { NuevoProgramaForm } from "./nuevo-programa-form";

export default async function NuevoProgramaPage() {
  await verifyAdminSession();
  const radialistas = await getRadialistas();
  return <NuevoProgramaForm radialistas={radialistas} />;
}
