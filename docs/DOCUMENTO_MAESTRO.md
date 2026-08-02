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
