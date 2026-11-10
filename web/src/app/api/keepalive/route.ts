// Keep-alive de Supabase. Lo invoca el cron de Vercel (ver vercel.json) para
// que la base de datos registre actividad aunque nadie visite el sitio: en el
// plan gratuito Supabase pausa los proyectos tras ~1 semana sin actividad.
//
// A propósito NO intenta saber si hubo actividad reciente para saltarse la
// consulta: para saberlo habría que consultar la base de datos, y esa consulta
// ya es de por sí la actividad que se busca. Por eso la frecuencia se controla
// solo desde vercel.json (cada 3 días), sin lógica condicional acá. Se eligió 3
// y no 6 porque Supabase pausa a los 7 días sin actividad y Vercel no garantiza
// la entrega de cada ejecución: con 3 días, aunque se pierda una, el hueco
// máximo queda en 6 días.
//
// Hace una consulta mínima y pública (la fila singleton de
// configuracion_stream, que ya tiene lectura pública por RLS) con la anon key,
// igual que el resto del sitio — no necesita service_role ni toca datos
// sensibles.
//
// Protegido con CRON_SECRET: Vercel manda `Authorization: Bearer <CRON_SECRET>`
// en cada invocación del cron si esa variable existe en el proyecto. Sin la
// variable (o con otro valor) responde 401, así nadie de afuera puede usar esta
// ruta para generar consultas a la base. Ojo: Vercel captura CRON_SECRET al
// hacer el build, así que después de crearla o cambiarla hay que redesplegar.

import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const supabase = await createClient();
  const { error } = await supabase.from("configuracion_stream").select("id").limit(1);

  if (error) {
    // Queda en los logs de la función (Vercel → Cron Jobs → View Logs) y el
    // 500 marca la ejecución como fallida en el panel.
    console.error("keepalive: la consulta a Supabase falló:", error.message);
    return Response.json({ ok: false }, { status: 500 });
  }

  return Response.json({ ok: true, at: new Date().toISOString() });
}
