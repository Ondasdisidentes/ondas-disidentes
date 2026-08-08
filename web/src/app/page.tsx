import { getProgramas } from "@/lib/data/programas";
import HomeClient from "./home-client";

export default async function Home() {
  const programas = await getProgramas();
  return <HomeClient programas={programas} />;
}
