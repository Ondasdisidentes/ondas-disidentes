import { verifyAdminSession } from "@/lib/data/auth";
import { getEstilosConfig } from "@/lib/data/estilos";
import { getGaleriaImagenes } from "@/lib/data/galeria";
import { EstilosTabs } from "./estilos-tabs";

export default async function AdminEstilosPage() {
  await verifyAdminSession();
  const [config, imagenesGaleria] = await Promise.all([getEstilosConfig(), getGaleriaImagenes()]);

  return <EstilosTabs config={config} imagenesGaleria={imagenesGaleria} />;
}
