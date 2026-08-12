import Link from "next/link";
import { verifyAdminSession } from "@/lib/data/auth";
import { IconMic, IconPeople, IconBroadcast, IconMail } from "./icons";

const SECCIONES = [
  {
    href: "/admin/programas",
    label: "Programas",
    desc: "Crear y editar programas y sus episodios.",
    Icon: IconMic,
  },
  {
    href: "/admin/radialistas",
    label: "Radialistas",
    desc: "Perfiles de las radialistas del equipo.",
    Icon: IconPeople,
  },
  {
    href: "/admin/stream",
    label: "Transmisión",
    desc: "Configuración del stream en vivo (giss.tv).",
    Icon: IconBroadcast,
  },
  {
    href: "/admin/contacto",
    label: "Contacto",
    desc: "Email, teléfono y redes sociales del sitio.",
    Icon: IconMail,
  },
];

export default async function AdminInicioPage() {
  await verifyAdminSession();

  return (
    <div>
      <div className="admin__section-hd">
        <h2 className="admin__heading">Inicio</h2>
      </div>

      <div className="admin__dash">
        {SECCIONES.map(({ href, label, desc, Icon }) => (
          <Link key={href} href={href} className="admin__dash-card">
            <Icon />
            <span className="admin__dash-card-label">{label}</span>
            <p className="admin__dash-card-desc">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
