// Descarga las fuentes de marca (licencia comercial, fuera de git) desde
// Supabase Storage antes de `next build`. En dev local normalmente ya están
// copiadas a mano (ver README), así que este script no las pisa si ya existen.
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const FONTS = [
  "FixtureUltra-SemiBold.otf",
  "FixtureUltra-Bold.otf",
  "Humane-Bold.otf",
  "Konsens-Regular.otf",
  "Konsens-Bold.otf",
];

const __dirname = dirname(fileURLToPath(import.meta.url));
const fontsDir = join(__dirname, "..", "public", "fonts");

const faltantes = FONTS.filter((f) => !existsSync(join(fontsDir, f)));
if (faltantes.length === 0) {
  console.log("[fetch-fonts] Todas las fuentes ya están presentes, nada que descargar.");
  process.exit(0);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "[fetch-fonts] Faltan fuentes locales y no hay NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY " +
      "para descargarlas desde Supabase Storage. Configuralas como Environment Variables en Vercel."
  );
  process.exit(1);
}

mkdirSync(fontsDir, { recursive: true });

for (const nombre of faltantes) {
  const res = await fetch(`${supabaseUrl}/storage/v1/object/fonts/${nombre}`, {
    headers: {
      Authorization: `Bearer ${serviceRoleKey}`,
      apikey: serviceRoleKey,
    },
  });
  if (!res.ok) {
    console.error(`[fetch-fonts] Error descargando ${nombre}: ${res.status} ${res.statusText}`);
    process.exit(1);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(join(fontsDir, nombre), buf);
  console.log(`[fetch-fonts] ${nombre} (${buf.length} bytes)`);
}
