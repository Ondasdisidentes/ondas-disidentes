import { getProgramas } from "@/lib/data/programas";
import { getPanelistas } from "@/lib/data/panelistas";
import HomeClient from "./home-client";

export default async function Home() {
  const [programas, panelistas] = await Promise.all([getProgramas(), getPanelistas()]);
  return <HomeClient programas={programas} panelistas={panelistas} />;
}
