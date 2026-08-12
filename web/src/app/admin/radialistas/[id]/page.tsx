import Link from "next/link";
import { verifyAdminSession } from "@/lib/data/auth";
import { getPanelista } from "@/lib/data/panelistas";
import { PanelistaForm } from "../panelista-form";

export default async function EditarPanelistaPage({ params }: { params: Promise<{ id: string }> }) {
  await verifyAdminSession();
  const { id } = await params;
  const panelista = await getPanelista(id);

  if (!panelista) {
    return (
      <div>
        <p>No se encontró este integrante.</p>
        <Link href="/admin/equipo" className="admin__btn admin__btn--ghost">
          ← Volver al equipo
        </Link>
      </div>
    );
  }

  return <PanelistaForm key={panelista.id} panelista={panelista} />;
}
