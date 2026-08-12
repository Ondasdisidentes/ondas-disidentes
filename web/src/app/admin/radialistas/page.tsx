import Image from "next/image";
import Link from "next/link";
import { verifyAdminSession } from "@/lib/data/auth";
import { getRadialistas } from "@/lib/data/radialistas";

export default async function RadialistasPage() {
  await verifyAdminSession();
  const radialistas = await getRadialistas();

  return (
    <>
      <div className="admin__section-hd">
        <h2 className="admin__heading">Radialistas</h2>
        <Link href="/admin/radialistas/nuevo" className="admin__btn">
          + Agregar radialista
        </Link>
      </div>

      {radialistas.length === 0 ? (
        <p className="admin__ep-list-empty">Todavía no hay radialistas cargados.</p>
      ) : (
        <div className="admin__grid">
          {radialistas.map((r) => (
            <Link href={`/admin/radialistas/${r.id}`} key={r.id} className="admin__card admin__card--link">
              <div className="admin__card-hd">
                <div className="admin__thumb">
                  <Image src={r.fotoUrl} alt="" fill className="object-cover" unoptimized />
                </div>
                <div>
                  <h3 className="admin__heading">{r.nombre}</h3>
                  <p>{r.localidad}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
