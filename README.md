# Ondas Disidentes

Sitio web del programa de radio Ondas Disidentes: transmisión en vivo (giss.tv + BUTT), archivo de grabaciones y dashboard admin (Supabase).

Arquitectura completa y decisiones del proyecto: [docs/DOCUMENTO_MAESTRO.md](docs/DOCUMENTO_MAESTRO.md).

## Desarrollo local

Las fuentes de marca están fuera de git (licencia comercial), así que hay que copiarlas antes de levantar el sitio:

```bash
mkdir -p web/public/fonts
cp assets/fuentes/Humane-Bold.otf web/public/fonts/
cp assets/fuentes/Fixture-Ultra-Bold.otf web/public/fonts/FixtureUltra-Bold.otf
cp assets/fuentes/Fixture-Ultra-SemiBold.otf web/public/fonts/FixtureUltra-SemiBold.otf
cp assets/fuentes/Konsens/otf/KonsensRegular.otf web/public/fonts/Konsens-Regular.otf
cp assets/fuentes/Konsens/otf/KonsensBold.otf web/public/fonts/Konsens-Bold.otf
```

Luego:

```bash
cd web
npm install
npm run dev
```

### Configuración del stream (giss.tv)

La URL de estado, el mount point y la URL pública del stream **no son variables de entorno**: viven en Supabase (tabla `configuracion_stream`, ver `web/supabase/migrations/0005_configuracion_stream.sql`) y se editan desde `/admin/stream` con sesión de admin. `/api/icecast-status` lee esa fila en cada request, así que un cambio en el admin aplica al toque, sin redeploy.

La contraseña de *source* de giss.tv (la que transmite audio hacia el servidor) no va en el sitio ni en esa tabla: solo se usa en el programa del locutor (BUTT).

## Estructura

- `docs/` — documentación y material de referencia.
- `assets/` — material de marca (ilustraciones, logos versionados; fuentes y plantillas editables fuera de git, ver `.gitignore`).
- `web/` — aplicación Next.js + React.
