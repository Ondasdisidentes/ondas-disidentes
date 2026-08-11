"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "./shared";

const SECCIONES = [
  { href: "/admin", label: "Programas" },
  { href: "/admin/equipo", label: "Equipo" },
  { href: "/admin/stream", label: "Transmisión" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="admin__tabs" style={{ margin: "1rem clamp(.9rem,3vw,1.6rem) 0" }}>
      {SECCIONES.map((s) => {
        const activo =
          s.href === "/admin"
            ? pathname === "/admin" || pathname.startsWith("/admin/programas")
            : pathname.startsWith(s.href);
        return (
          <Link key={s.href} href={s.href} className={cx("admin__tab", activo && "is-active")}>
            {s.label}
          </Link>
        );
      })}
    </nav>
  );
}
