# Ondas Disidentes

Sitio web del programa de radio Ondas Disidentes: transmisión en vivo (giss.tv + BUTT), archivo de grabaciones y dashboard admin (Supabase).

Arquitectura completa y decisiones del proyecto: [docs/DOCUMENTO_MAESTRO.md](docs/DOCUMENTO_MAESTRO.md).

## Desarrollo local

Warsaw Gothic (la tipografía de títulos) viaja en el repo: es SIL OFL 1.1, así que
se puede redistribuir y embeber. Humane y Konsens son de licencia comercial y no se
versionan, así que hay que copiarlas a mano antes de levantar el sitio:

```bash
mkdir -p web/public/fonts
cp assets/fuentes/Humane-Bold.otf web/public/fonts/
cp assets/fuentes/Konsens/otf/KonsensRegular.otf web/public/fonts/Konsens-Regular.otf
cp assets/fuentes/Konsens/otf/KonsensBold.otf web/public/fonts/Konsens-Bold.otf
```

En producción, `scripts/fetch-fonts.mjs` corre como `prebuild` y baja esas dos desde
Supabase Storage (bucket `fonts`), para lo que Vercel necesita `NEXT_PUBLIC_SUPABASE_URL`
y `SUPABASE_SERVICE_ROLE_KEY`. Warsaw Gothic no está en esa lista porque ya está en el
repo. Si agregás una fuente nueva a `src/app/fonts.ts`, acordate de sumarla al script o
al `.gitignore` según su licencia: si falta, el build de Vercel falla al no encontrar el `.otf`.

Warsaw Gothic Condensed es una sola cara estática de peso 400: no tiene negrita ni
versión variable. Por eso `.fix`/`.fx` en `theme.css` piden `font-weight:400` y no
`700` — pedir negrita haría que el navegador sintetice una falsa. Su glifo de espacio
viene nueve veces más angosto de lo normal, compensado con `--f-tit-word`.

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
