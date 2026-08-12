import { getProgramas } from "@/lib/data/programas";
import { getRadialistas } from "@/lib/data/radialistas";
import { getContactoConfig } from "@/lib/data/contacto";
import HomeClient from "./home-client";

export default async function Home() {
  const [programas, radialistas, contacto] = await Promise.all([
    getProgramas(),
    getRadialistas(),
    getContactoConfig(),
  ]);
  return <HomeClient programas={programas} radialistas={radialistas} contacto={contacto} />;
}
