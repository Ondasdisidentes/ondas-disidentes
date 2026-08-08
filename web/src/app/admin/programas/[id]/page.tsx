import Link from "next/link";
import { verifyAdminSession } from "@/lib/data/auth";
import { getPrograma } from "@/lib/data/programas";
import { EditorPrograma } from "./editor-programa";

type Tab = "programa" | "episodios";

export default async function EditarProgramaPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  await verifyAdminSession();
  const { id } = await params;
  const { tab } = await searchParams;
  const programa = await getPrograma(id);

  if (!programa) {
    return (
      <div>
        <p>No se encontró este programa.</p>
        <Link href="/admin" className="admin__btn admin__btn--ghost">
          ← Volver a programas
        </Link>
      </div>
    );
  }

  const tabInicial: Tab = tab === "episodios" ? "episodios" : "programa";

  // key={programa.id}: si se navega a OTRO programa, React remonta este
  // componente y sus useState vuelven a inicializarse desde el nuevo programa.
  return <EditorPrograma key={programa.id} programa={programa} tabInicial={tabInicial} />;
}
