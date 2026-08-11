# Documento Maestro — Ondas Disidentes

Programa de radio, transmisión en vivo de 4 a 8 horas por semana (horario exacto **aún por definir**, ver sección de pendientes).

Este documento resume las decisiones de arquitectura tomadas y sirve como referencia única antes de empezar a construir.

---

## 0. Repositorio y estructura del proyecto

- **GitHub**: [github.com/edanielacero/ondas-disidentes](https://github.com/edanielacero/ondas-disidentes) — repo público, exclusivo de este proyecto.
- **`docs/`** — documentación y material de referencia:
  - `DOCUMENTO_MAESTRO.md` — este documento.
  - `ondas-disidentes-base.html` — HTML base real del sitio, referencia de diseño/contenido a convertir a componentes React/Next.js; no se levanta ni se sirve tal cual, es punto de partida para la migración.
- **`assets/`** — material de marca:
  - `ilustraciones/`, `logos/` — assets ya exportados que el sitio usa directamente (versionados en git).
  - `fuentes/` (Humane, Fixture, Konsens en `.otf`), `plantillas/` (plantillas editables .ai/.docx), `manual-de-marca.pdf` — **excluidos de git** (`.gitignore`): las fuentes son de licencia comercial y no se redistribuyen en un repo público; las fuentes se sirven en el sitio desde Supabase Storage. El resto es material fuente de diseño, no un asset de producción.
- **`web/`** — la aplicación Next.js + React (el sitio en sí), se levanta con `npm run dev` dentro de esta carpeta.

---

## 1. Resumen de la arquitectura

| Pieza | Solución elegida |
|---|---|
| Servidor de streaming (Icecast) | **giss.tv** — gratuito, comunitario, uso no comercial/cultural |
| Encoder (source, transmite desde la compu del locutor) | **BUTT** (Broadcast Using This Tool), con grabación local activada |
| Frontend | **Next.js (App Router) + React**, se levanta con `npm run dev` |
| Backend / datos | **Supabase** — Postgres + Storage + Auth |
| Deploy del sitio | **Vercel** |
| Dominio | Subdominio gratuito de Vercel (`*.vercel.app`) por ahora; dominio propio se agrega después sin cambiar nada más |

No se usa VPS propio ni AutoDJ: el stream **solo existe mientras el programa está en vivo**. Fuera de esas horas, el sitio muestra el horario/"próxima transmisión" en vez de un reproductor activo.

---

## 2. Flujo de transmisión en vivo

1. El locutor abre **BUTT**, con el input de audio (micrófono/mezcladora) y los datos del mount point de giss.tv (host, puerto, mount, contraseña — se obtienen al pedir el mount, ver sección 5) ya configurados.
2. BUTT transmite el audio en vivo al mount point de giss.tv, **y simultáneamente graba una copia local en disco** (función nativa de BUTT).
3. El sitio (Next.js) tiene una ruta API propia — `/api/icecast-status` — que consulta del lado del servidor el status JSON de Icecast en giss.tv y se lo devuelve ya limpio al frontend. Esto evita el problema de CORS que ocurriría si el navegador consultara directo a giss.tv.
4. El frontend consulta esa ruta periódicamente:
   - **Mount activo** → se muestra el reproductor `<audio>` en vivo, apuntando a la URL pública del stream.
   - **Mount inactivo** → se muestra el horario / "próxima transmisión".

## 3. Flujo de archivo (grabaciones pasadas)

1. Tras el programa, el archivo grabado localmente por BUTT se sube **manualmente** al dashboard admin del sitio.
2. El dashboard sube ese archivo a un bucket de **Supabase Storage**.
3. Una página pública de archivo lista los episodios pasados con su propio reproductor on-demand (independiente del reproductor en vivo).

## 4. Dashboard admin (`/dashboard`, protegido)

- Acceso restringido al equipo vía **Supabase Auth** (login).
- Rutas protegidas del lado del servidor con middleware de Next.js (valida la sesión antes de renderizar `/dashboard`, no solo en el navegador).
- Funciones:
  - Subir documentos.
  - Subir grabaciones pasadas (→ Supabase Storage).
  - Editar información de panelistas.
  - Editar el horario de transmisión (una vez definido — ver pendientes).

## 5. Modelo de datos en Supabase (borrador, a refinar al construir)

- **Tabla `panelistas`**: nombre, puesto, foto (subida o ícono de marca) — implementada, ver `web/supabase/migrations/0003_panelistas.sql`.
- **Tabla `programas` / `episodios`**: implementada, ver `web/supabase/migrations/0001_admin_schema.sql` y `0004_episodio_imagen.sql`.
- **Tabla `configuracion_stream`**: fila única con `status_url`, `mount`, `stream_url` de giss.tv, editable desde `/admin/stream` — ver sección 6 y `web/supabase/migrations/0005_configuracion_stream.sql`.
- **Tabla `horario`**: día, hora de inicio, hora de fin — vacía hasta que se defina el horario real. *Pendiente de crear.*
- **Storage bucket `grabaciones`**: archivos de audio de episodios pasados. *Pendiente de crear.*
- **Storage bucket `documentos`**: documentos varios subidos desde el dashboard. *Pendiente de crear.*
- **Auth**: un solo admin (`ondasdisidentes@outlook.com`, ver `web/src/lib/data/auth.ts`) — implementada.

## 6. giss.tv — solicitud del mount point

Se pide por correo, explicando:
- Nombre del programa: **Ondas Disidentes**.
- Tipo de contenido (cultural/no comercial — pendiente de redactar la descripción exacta).
- Horario estimado de transmisión — **bloqueado hasta definir el horario** (sección de pendientes).

giss.tv responde con: host, puerto, nombre del mount point (termina en `.mp3`), y contraseña de source — esos datos se cargan en BUTT.

**Mount obtenido** (respuesta de GISS, ver correo): host `giss.tv`, puerto `8001` (HTTP) / `667` (HTTPS), mount `OndasDisidentes.mp3`, usuario `source`. La contraseña de source solo se carga en BUTT (u otro encoder), nunca en el sitio. Los datos públicos (status URL, mount, stream URL) están en la tabla `configuracion_stream` de Supabase, editable desde `/admin/stream` — ver sección 5 y 10.

---

## 7. Pendientes / próximos pasos antes de construir

1. **Definir el horario de transmisión** (día(s) y hora(s)) y el texto de "próxima transmisión" del sitio. — *Pendiente, sin dueño asignado aún.*
2. ~~Redactar la descripción de contenido de Ondas Disidentes para el correo a giss.tv.~~ — hecho.
3. ~~Enviar el correo a giss.tv solicitando el mount point.~~ — hecho, mount obtenido (sección 6).
4. Confirmar campos exactos de la tabla `panelistas`.
5. Definir quiénes serán usuarios admin del dashboard.
6. (No bloqueante) Evaluar dominio propio más adelante.
7. Configurar BUTT en la compu del locutor con los datos de source de giss.tv (host/puerto/mount/contraseña) — el locutor necesita el mount point real, no lo publiques en un canal público.

## 8. Fuera de alcance / decisiones ya descartadas

- Auto-hospedar Icecast en un VPS (Railway, Oracle Cloud) — descartado, se usa solo giss.tv.
- AutoDJ / stream 24/7 — descartado, el stream solo existe en vivo.
- Vite como framework de frontend — descartado en favor de Next.js, por las API routes integradas y el middleware de auth para el dashboard.

## 9. Estado del frontend — migración del diseño (sin funcionalidad)

El HTML base (`docs/ondas-disidentes-base.html`) ya está portado a `web/src/app/page.tsx` como componente único de React (una sola página, cambio de vista por estado — no rutas separadas, según se decidió). Incluye:

- El sitio carga directo en la ventana de inicio (se quitó el gate/boot de entrada del diseño original). Menú, cambio entre las 3 ventanas (inicio/investigación/nosotrxs) y la consola de "programas" con interactividad real (estado de React).
- Imágenes y el PDF del manifiesto, que en el HTML original estaban embebidos como base64, extraídos a archivos reales en `web/public/images/` y `web/public/docs/`.
- Fuentes cargadas con `next/font/local` desde `web/public/fonts/` (ver `web/src/app/fonts.ts`) — esa carpeta está fuera de git (ver README, sección "Desarrollo local", para el paso manual de copiarlas).
- Estilos portados casi sin cambios del CSS original (`web/src/app/ondas.css`, hoja global — no un CSS Module, porque Turbopack exige que todo selector de un CSS Module tenga una clase local, y este diseño depende de resets sobre `body`/`a`/`button`/`img`). Tailwind sigue disponible para el futuro dashboard, sin conflicto.

**Deliberadamente NO conectado todavía** (statement explícito del alcance de esta fase, "sin funcionalidad"):
- El widget de SoundCloud que traía el HTML de referencia — se quitó por completo: no es parte de nuestra arquitectura (las grabaciones pasadas van por Supabase Storage, no SoundCloud).
- Reproducción on-demand de episodios pasados desde Supabase Storage (el dial de programas es solo navegación/metadata; el botón de reproducir usa el mismo `<audio>` que el stream en vivo, ver sección 6).

**Ya conectado** (una vez obtenido el mount de giss.tv, ver sección 6): el stream en vivo real (`<audio>` apuntando a la `stream_url` de `configuracion_stream`) y el polling de estado contra `/api/icecast-status`, que lee `status_url`/`mount` de esa misma tabla del lado del servidor. La config es editable desde `/admin/stream` (sección 10) sin necesidad de redeploy.

Contenido de episodios y equipo en `page.tsx` son **placeholders** (mismos textos del HTML de referencia) — pendiente de reemplazar por datos reales vía Supabase cuando se conecte el dashboard.

El modelo de datos de programas/episodios vive en `web/src/lib/programas.ts` (tipos `Programa`/`Episodio` + contenido de ejemplo), compartido entre la vista pública y `/admin`. Un **Programa** (título, descripción, ícono, lista de episodios) puede tener varios **Episodios** (nombre, descripción, duración, contenido: archivo o link de SoundCloud). El dial de la consola de "programas" muestra los programas agrupados, con sus episodios anidados debajo de cada uno.

## 10. Dashboard admin (`/admin`) — protegido, con persistencia real

**Nota:** esta sección estaba escrita para una fase anterior, cuando `/admin` era solo una maqueta sin login ni Supabase. Ya no es así — quedó actualizada acá.

- **Protegido en 3 capas** (patrón a reusar para cualquier feature nueva de admin): 1) `web/src/proxy.ts` — redirect optimista si no hay sesión; 2) `verifyAdminSession()` (`web/src/lib/data/auth.ts`) — re-chequea la sesión y el email exacto (`ondasdisidentes@outlook.com`) en cada page/Server Action; 3) policies RLS en Supabase — la capa innegociable, rechaza escrituras sin sesión válida aunque las otras dos fallaran.
- **Secciones**: Programas (`/admin`, `/admin/programas/...`), Equipo (`/admin/equipo/...`), Transmisión (`/admin/stream` — configuración de giss.tv, ver sección 6).
- Programas, episodios y panelistas se leen y escriben directo en Supabase (tablas `programas`/`episodios`/`panelistas`) vía Server Actions (`actions.ts`, `equipo-actions.ts`) — los cambios se reflejan al instante en el sitio público (`revalidatePath`).
- **Mismo lenguaje visual que el sitio público**: los tokens de marca (paleta + tipografías) se extrajeron a `web/src/app/theme.css`, compartido entre `ondas.css` (sitio público) y `web/src/app/admin/admin.css` (dashboard) — así el admin usa el mismo tema claro, colores e tipografía sin duplicar la definición de marca.
