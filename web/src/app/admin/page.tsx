import Image from "next/image";
import Link from "next/link";
import { verifyAdminSession } from "@/lib/data/auth";
import { getProgramas } from "@/lib/data/programas";

export default async function AdminProgramasPage() {
  await verifyAdminSession();
  const programas = await getProgramas();

  return (
    <>
      <div className="admin__section-hd">
        <h2 className="admin__heading">Programas</h2>
        <Link href="/admin/programas/nuevo" className="admin__btn">
          + Agregar programa
        </Link>
      </div>

      <div className="admin__grid">
        {programas.map((p) => (
          <Link href={`/admin/programas/${p.id}`} key={p.id} className="admin__card admin__card--link">
            <div className="admin__card-hd">
              <div className="admin__thumb">
                <Image src={p.icono} alt="" fill className="object-cover" />
              </div>
              <div>
                <h3 className="admin__heading">{p.titulo}</h3>
                <p>{p.descripcion}</p>
                <p className="admin__hint">Radialista: {p.radialistaNombre || "—"}</p>
              </div>
            </div>
            <div className="admin__eplist">
              <span className="admin__eplist-lbl">
                {p.episodios.length} episodio{p.episodios.length === 1 ? "" : "s"}
              </span>
              {p.episodios.map((e) => (
                <div key={e.id} className="admin__eprow">
                  <span>{e.nombre}</span>
                  <span>{e.contenido.tipo === "archivo" ? "Archivo" : "SoundCloud"}</span>
                </div>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
