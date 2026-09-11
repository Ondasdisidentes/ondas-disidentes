import { getProgramas } from "@/lib/data/programas";
import { getRadialistas } from "@/lib/data/radialistas";
import { getContactoConfig } from "@/lib/data/contacto";
import { getEstilosConfig } from "@/lib/data/estilos";
import HomeClient from "./home-client";

export default async function Home() {
  const [programas, radialistas, contacto, estilos] = await Promise.all([
    getProgramas(),
    getRadialistas(),
    getContactoConfig(),
    getEstilosConfig(),
  ]);
  return (
    <HomeClient programas={programas} radialistas={radialistas} contacto={contacto} estilos={estilos} />
  );
}
