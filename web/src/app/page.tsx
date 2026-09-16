import { getProgramas } from "@/lib/data/programas";
import { getRadialistas } from "@/lib/data/radialistas";
import { getContactoConfig } from "@/lib/data/contacto";
import { getEstilosConfig } from "@/lib/data/estilos";
import { getGaleriaImagenes } from "@/lib/data/galeria";
import HomeClient from "./home-client";

export default async function Home() {
  const [programas, radialistas, contacto, estilos, galeriaImagenes] = await Promise.all([
    getProgramas(),
    getRadialistas(),
    getContactoConfig(),
    getEstilosConfig(),
    getGaleriaImagenes(),
  ]);
  return (
    <HomeClient
      programas={programas}
      radialistas={radialistas}
      contacto={contacto}
      estilos={estilos}
      galeriaImagenes={galeriaImagenes}
    />
  );
}
