import Link from "next/link";
import { verifyAdminSession } from "@/lib/data/auth";
import { getRadialista } from "@/lib/data/radialistas";
import { RadialistaForm } from "../radialista-form";

export default async function EditarRadialistaPage({ params }: { params: Promise<{ id: string }> }) {
  await verifyAdminSession();
  const { id } = await params;
  const radialista = await getRadialista(id);

  if (!radialista) {
    return (
      <div>
        <p>No se encontró este radialista.</p>
        <Link href="/admin/radialistas" className="admin__btn admin__btn--ghost">
          ← Atrás
        </Link>
      </div>
    );
  }

  return <RadialistaForm key={radialista.id} radialista={radialista} />;
}
