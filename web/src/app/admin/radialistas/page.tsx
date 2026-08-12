import Image from "next/image";
import Link from "next/link";
import { verifyAdminSession } from "@/lib/data/auth";
import { getPanelistas } from "@/lib/data/panelistas";

export default async function EquipoPage() {
  await verifyAdminSession();
  const panelistas = await getPanelistas();

  return (
    <>
      <div className="admin__section-hd">
        <h2 className="admin__heading">Equipo</h2>
        <Link href="/admin/equipo/nuevo" className="admin__btn">
          + Agregar integrante
        </Link>
      </div>

      {panelistas.length === 0 ? (
        <p className="admin__ep-list-empty">Todavía no hay integrantes cargados.</p>
      ) : (
        <div className="admin__grid">
          {panelistas.map((p) => (
            <Link href={`/admin/equipo/${p.id}`} key={p.id} className="admin__card admin__card--link">
              <div className="admin__card-hd">
                <div className="admin__thumb">
                  <Image src={p.fotoUrl} alt="" fill className="object-cover" unoptimized />
                </div>
                <div>
                  <h3 className="admin__heading">{p.nombre}</h3>
                  <p>{p.puesto}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
