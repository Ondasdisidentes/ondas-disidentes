import Link from "next/link";
import { verifyAdminSession } from "@/lib/data/auth";
import { getPrograma } from "@/lib/data/programas";
import { NuevoEpisodioForm } from "./nuevo-episodio-form";

export default async function NuevoEpisodioPage({ params }: { params: Promise<{ id: string }> }) {
  await verifyAdminSession();
  const { id } = await params;
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

  return <NuevoEpisodioForm programaId={programa.id} programaTitulo={programa.titulo} />;
}
