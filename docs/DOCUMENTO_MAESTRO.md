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

- **Tabla `panelistas`**: nombre, bio, foto, redes sociales (campos exactos por confirmar al construir el dashboard).
- **Tabla `horario`**: día, hora de inicio, hora de fin — vacía hasta que se defina el horario real.
- **Storage bucket `grabaciones`**: archivos de audio de episodios pasados.
- **Storage bucket `documentos`**: documentos varios subidos desde el dashboard.
- **Auth**: usuarios admin del equipo (quiénes exactamente, por definir).

## 6. giss.tv — solicitud del mount point

Se pide por correo, explicando:
- Nombre del programa: **Ondas Disidentes**.
- Tipo de contenido (cultural/no comercial — pendiente de redactar la descripción exacta).
- Horario estimado de transmisión — **bloqueado hasta definir el horario** (sección de pendientes).

giss.tv responde con: host, puerto, nombre del mount point (termina en `.mp3`), y contraseña de source — esos datos se cargan en BUTT.

---

## 7. Pendientes / próximos pasos antes de construir

1. **Definir el horario de transmisión** (día(s) y hora(s)). Bloquea: el correo a giss.tv y el texto de "próxima transmisión" del sitio. — *Pendiente, sin dueño asignado aún.*
2. Redactar la descripción de contenido de Ondas Disidentes para el correo a giss.tv.
3. Enviar el correo a giss.tv solicitando el mount point.
4. Confirmar campos exactos de la tabla `panelistas`.
5. Definir quiénes serán usuarios admin del dashboard.
6. (No bloqueante) Evaluar dominio propio más adelante.

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
- El stream en vivo real de giss.tv (el botón "Escuchar en vivo" solo cambia un estado visual local, no reproduce audio).
- El polling de "sonando ahora" contra el status de Icecast.
- El widget de SoundCloud que traía el HTML de referencia — se quitó por completo: no es parte de nuestra arquitectura (las grabaciones pasadas van por Supabase Storage, no SoundCloud).

Contenido de episodios y equipo en `page.tsx` son **placeholders** (mismos textos del HTML de referencia) — pendiente de reemplazar por datos reales vía Supabase cuando se conecte el dashboard.

El modelo de datos de programas/episodios vive en `web/src/lib/programas.ts` (tipos `Programa`/`Episodio` + contenido de ejemplo), compartido entre la vista pública y `/admin`. Un **Programa** (título, descripción, ícono, lista de episodios) puede tener varios **Episodios** (nombre, descripción, duración, contenido: archivo o link de SoundCloud). El dial de la consola de "programas" muestra los programas agrupados, con sus episodios anidados debajo de cada uno.

## 10. Dashboard admin (`/admin`) — solo UI, sin login ni persistencia todavía

- Ruta pública por ahora (sin proteger) — el login queda pendiente de conectar vía Supabase Auth (ver sección 4).
- Lista de Programas (tarjeta con ícono, título, descripción y sus episodios) + botón "Agregar programa".
- El formulario de "Agregar programa" permite: título, descripción, elegir un ícono de un selector visual (las ilustraciones de la marca, copiadas a `web/public/images/iconos/`), y agregar/quitar varios episodios dinámicamente (nombre, descripción, duración, y contenido — toggle entre subir un archivo o pegar un link de SoundCloud).
- **Es solo una maqueta visual funcional dentro de la sesión**: los programas agregados aparecen en la lista de `/admin` mientras la pestaña sigue abierta, pero no se guardan (no hay `localStorage` ni Supabase todavía) y no se conectan al dial de la vista pública. Cuando se conecte Supabase, este formulario pasa a escribir en la tabla de programas/episodios real.
- **Mismo lenguaje visual que el sitio público**: los tokens de marca (paleta + tipografías) se extrajeron a `web/src/app/theme.css`, compartido entre `ondas.css` (sitio público) y `web/src/app/admin/admin.css` (dashboard) — así el admin usa el mismo tema claro, colores e tipografía sin duplicar la definición de marca.
- **Rutas**: `/admin` (lista, tarjetas clicables) → `/admin/programas/nuevo` (wizard de 2 pasos: datos del programa → episodios) y `/admin/programas/[id]` (vista de edición con 2 tabs: Editar programa / Episodios). El estado de los programas vive en un React Context (`programas-context.tsx`) compartido entre estas rutas durante la sesión — sigue sin persistir entre recargas ni conectarse al sitio público, pero dentro del admin sí es consistente (crear/editar se refleja en la lista al instante).
