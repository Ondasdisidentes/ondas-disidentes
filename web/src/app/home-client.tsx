"use client";

import { useEffect, useRef, useState } from "react";
import "./ondas.css";
import type { Programa } from "@/lib/programas";
import type { Panelista } from "@/lib/panelistas";

function cx(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function truncar(texto: string, max: number) {
  if (texto.length <= max) return texto;
  return texto.slice(0, max).trimEnd() + "…";
}

function soloPrimeraMayuscula(texto: string) {
  if (!texto) return texto;
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
}

const UNA_SEMANA_MS = 7 * 24 * 60 * 60 * 1000;

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

function formatearFecha(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const dd = String(d.getDate()).padStart(2, "0");
  const mes = MESES[d.getMonth()];
  return `${dd}-${mes.charAt(0).toUpperCase() + mes.slice(1)}-${d.getFullYear()}`;
}

type Mode = "home" | "prog";
type WinName = "inicio" | "invest" | "nosotrxs";
type Reproduccion =
  | { tipo: "vivo" }
  | { tipo: "grabacion"; programaIdx: number; episodioIdx: number };

function formatearTiempo(segundos: number) {
  const s = Math.max(0, Math.floor(segundos));
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

function useLiveStatus() {
  const [live, setLive] = useState(false);
  const [streamUrl, setStreamUrl] = useState("");
  useEffect(() => {
    let cancelled = false;
    async function check() {
      try {
        const res = await fetch("/api/icecast-status", { cache: "no-store" });
        const data = await res.json();
        if (!cancelled) {
          setLive(Boolean(data.live));
          if (typeof data.streamUrl === "string") setStreamUrl(data.streamUrl);
        }
      } catch {
        if (!cancelled) setLive(false);
      }
    }
    check();
    const id = setInterval(check, 30000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);
  return { live, streamUrl };
}

export default function HomeClient({
  programas,
  panelistas,
}: {
  programas: Programa[];
  panelistas: Panelista[];
}) {
  const [mode, setMode] = useState<Mode>("home");
  const [activeWin, setActiveWin] = useState<WinName>("inicio");
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentPrograma, setCurrentPrograma] = useState(0);
  const [currentEpisodio, setCurrentEpisodio] = useState(0);
  const [descAbierta, setDescAbierta] = useState(false);
  // Mobile: el panel "Programas" es un cajón que se desliza desde la
  // izquierda por encima del detalle (que siempre está visible debajo).
  const [progListaAbierta, setProgListaAbierta] = useState(false);

  // Qué está sonando en la barra global — independiente de qué programa/
  // episodio estás navegando en ese momento (currentPrograma/currentEpisodio
  // son solo para lo que se muestra en la sección Programas).
  const [reproduccion, setReproduccion] = useState<Reproduccion | null>(null);
  const [reproduciendo, setReproduciendo] = useState(false);
  const [recTiempo, setRecTiempo] = useState({ actual: 0, duracion: 0 });
  const [vivoTiempo, setVivoTiempo] = useState(0);

  const winwrapRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const recAudioRef = useRef<HTMLAudioElement>(null);

  const { live: isLive, streamUrl } = useLiveStatus();

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    if (reproduccion?.tipo === "vivo" && reproduciendo) {
      el.play().catch(() => setReproduciendo(false));
    } else {
      el.pause();
    }
  }, [reproduccion, reproduciendo]);

  useEffect(() => {
    const el = recAudioRef.current;
    if (!el) return;
    if (reproduccion?.tipo === "grabacion" && reproduciendo) {
      el.play().catch(() => setReproduciendo(false));
    } else {
      el.pause();
    }
  }, [reproduccion, reproduciendo]);

  useEffect(() => {
    if (!(reproduccion?.tipo === "vivo" && reproduciendo)) return;
    const id = setInterval(() => setVivoTiempo((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [reproduccion, reproduciendo]);

  useEffect(() => {
    winwrapRef.current?.scrollTo(0, 0);
  }, [activeWin, mode]);

  useEffect(() => {
    mainRef.current?.scrollTo(0, 0);
  }, [currentPrograma, currentEpisodio, mode]);

  function reproducirEnVivo() {
    setReproduccion({ tipo: "vivo" });
    setReproduciendo(true);
    setVivoTiempo(0);
  }

  function reproducirEpisodio(programaIdx: number, episodioIdx: number) {
    setReproduccion({ tipo: "grabacion", programaIdx, episodioIdx });
    setReproduciendo(true);
    setRecTiempo({ actual: 0, duracion: 0 });
  }

  function cerrarReproductor() {
    setReproduccion(null);
    setReproduciendo(false);
  }

  function openPrograma(i: number, autoplay?: boolean) {
    if (i >= 0) {
      setCurrentPrograma(i);
      setCurrentEpisodio(0);
      setDescAbierta(false);
    } else {
      // Sin programa puntual: es el link "Programas" del menú, la intención
      // es navegar el catálogo, así que en mobile abrimos el cajón directo.
      setProgListaAbierta(true);
    }
    setMode("prog");
    if (autoplay) reproducirEnVivo();
  }

  function selectEpisodio(programaIdx: number, episodioIdx: number) {
    setCurrentPrograma(programaIdx);
    setCurrentEpisodio(episodioIdx);
    setDescAbierta(false);
  }

  function playEpisodio(programaIdx: number, episodioIdx: number) {
    setCurrentPrograma(programaIdx);
    setCurrentEpisodio(episodioIdx);
    setDescAbierta(false);
    setMode("prog");
    setProgListaAbierta(false);
    reproducirEpisodio(programaIdx, episodioIdx);
  }

  function goHome() {
    setMode("home");
    setActiveWin("inicio");
    setMenuOpen(false);
  }

  function setWin(name: WinName) {
    setActiveWin(name);
    setMenuOpen(false);
  }

  if (programas.length === 0) {
    return <p style={{ padding: "2rem" }}>No hay programas todavía.</p>;
  }

  const programaActual = programas[currentPrograma] ?? programas[0];
  const episodioActual = programaActual.episodios[currentEpisodio] ?? programaActual.episodios[0];

  const programaReproduccion = reproduccion?.tipo === "grabacion" ? programas[reproduccion.programaIdx] : null;
  const episodioReproduccion = programaReproduccion
    ? programaReproduccion.episodios[(reproduccion as { episodioIdx: number }).episodioIdx]
    : null;
  const contenidoReproduccion = episodioReproduccion?.contenido ?? null;
  const audioUrlReproduccion =
    contenidoReproduccion?.tipo === "archivo" && contenidoReproduccion.url ? contenidoReproduccion.url : "";
  const esteEpisodioReproduciendo =
    reproduccion?.tipo === "grabacion" &&
    reproduccion.programaIdx === currentPrograma &&
    reproduccion.episodioIdx === currentEpisodio;
  const recPct = recTiempo.duracion > 0 ? Math.min(100, (recTiempo.actual / recTiempo.duracion) * 100) : 0;

  const ultimosEpisodios = programas
    .flatMap((p, programaIdx) =>
      p.episodios.map((e, episodioIdx) => ({
        programa: p,
        programaIdx,
        episodio: e,
        episodioIdx,
        numeroEnPrograma: episodioIdx + 1,
      }))
    )
    .sort((a, b) => new Date(b.episodio.creadoEn).getTime() - new Date(a.episodio.creadoEn).getTime())
    .slice(0, 3);
  const tickerText = (
    <>
      <span>La palabra de todxs vuela sin censura</span>
      <i>●</i>
      <span>La comunicación es un lugar de encuentro</span>
      <i>●</i>
      <span>Cuestionar las reglas del decir</span>
      <i>●</i>
      <span>La palabra de todxs vuela sin censura</span>
      <i>●</i>
      <span>La comunicación es un lugar de encuentro</span>
      <i>●</i>
      <span>Cuestionar las reglas del decir</span>
      <i>●</i>
    </>
  );

  return (
    <>
      {streamUrl && (
        <audio ref={audioRef} src={streamUrl} preload="none" onError={() => setReproduciendo(false)} />
      )}
      {audioUrlReproduccion && (
        <audio
          ref={recAudioRef}
          src={audioUrlReproduccion}
          preload="none"
          onTimeUpdate={(e) => setRecTiempo((t) => ({ ...t, actual: e.currentTarget.currentTime }))}
          onLoadedMetadata={(e) => setRecTiempo((t) => ({ ...t, duracion: e.currentTarget.duration || 0 }))}
          onEnded={() => setReproduciendo(false)}
          onError={() => setReproduciendo(false)}
        />
      )}

      {/* ============ HOME (ventanas) ============ */}
      <div id="home" style={{ display: mode === "home" ? "flex" : "none" }}>
        <div className={cx("hbar", menuOpen && "hbar--dark")}>
          <button className={cx("hbar__tag", "lbl")} onClick={goHome}>
            {isLive && "● En vivo · "}Radio alternativa
          </button>
          <button
            className={"burger"}
            aria-expanded={menuOpen}
            aria-controls="menu"
            aria-label="Menú"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        <nav className={cx("menu", menuOpen && "open")} id="menu" aria-label="Secciones">
          <div className={"menu__line"} aria-hidden="true" />
          <div className={"menu__links"}>
            <button onClick={() => setWin("inicio")}>Inicio</button>
            <button onClick={() => { setMenuOpen(false); openPrograma(-1); }}>Programas</button>
            <button onClick={() => setWin("nosotrxs")}>Sobre nosotrxs</button>
          </div>
          <div className={"menu__line"} aria-hidden="true" />
          <div className={"menu__social"}>
            <span className={"menu__social-item"}>Instagram</span>
            <span className={"menu__social-item"}>Facebook</span>
            <span className={"menu__social-item"}>Soundcloud</span>
          </div>
        </nav>

        <div className={cx("winwrap", !!reproduccion && "winwrap--with-player")} ref={winwrapRef}>
          <div className={"frame"}>
            {/* ventana: INICIO */}
            <section className={cx("win", activeWin === "inicio" && "on")}>
              <header className={"mast"}>
                <img className={"mast__logo"} src="/images/ondas-disidentes-wordmark.svg" alt="Ondas Disidentes" />
              </header>

              <section className={"hero"}>
                <div className={"hero__left"}>
                  <p className={"slogan"}>
                    Las frecuencias también
                    <br />
                    son un bien común.
                    <br />
                    <span className={"u"}>Nosotrxs las disputamos.</span>
                  </p>
                  <button className={"cta"} onClick={() => openPrograma(0, true)}>
                    <span aria-hidden="true">►</span>Escuchar ahora
                  </button>
                </div>
                <img className={"hero__icon hero__icon--waves"} src="/images/icono-ondas.png" alt="" aria-hidden="true" />
                <img className={"hero__icon hero__icon--spot"} src="/images/icono-spotlight.png" alt="" aria-hidden="true" />
                <div className={"hero__right"}>
                  <div className={cx("hero__stage", "halftone")}>
                    <img className={"hero__main"} src="/images/hero-radialista.jpg" alt="Radialista en la consola de transmisión" />
                  </div>
                  <div className={"hero__strip"}>
                    <span className={cx("hero__cap", "hum")}>Escucha sus voces</span>
                  </div>
                </div>
              </section>

              <div className={"ticker"} aria-hidden="true">
                <div className={"ticker__t"}>{tickerText}</div>
              </div>

              <div className={"seq"}>
                <img className={"seq__heading"} src="/images/ultimos-episodios-heading.png" alt="Últimos episodios" />
              </div>

              {ultimosEpisodios.length > 0 && (
                <>
                  <div className={"eplist"}>
                    {ultimosEpisodios.map(({ programa, programaIdx, episodio, episodioIdx, numeroEnPrograma }, i) => (
                      <button
                        type="button"
                        className={"eprow"}
                        key={episodio.id}
                        aria-label={`Reproducir ${episodio.nombre}`}
                        onClick={() => playEpisodio(programaIdx, episodioIdx)}
                      >
                        <span className={"eprow__label"}>{programa.titulo}</span>
                        <span className={"eprow__row"}>
                          <span className={"eprow__img"}>
                            <img src={programa.icono} alt="" />
                          </span>
                          <span className={"eprow__body"}>
                            <span className={"eprow__tags"}>
                              <span className={"eprow__ep"}>Episodio {numeroEnPrograma}</span>
                              {i === 0 && <span className={"eprow__new"}>Nuevo</span>}
                            </span>
                            <h3 className={cx("eprow__title", "fix")}>{episodio.nombre}</h3>
                            <p className={"eprow__desc"}>{truncar(episodio.descripcion, 130)}</p>
                          </span>
                          <span className={"eprow__play"} aria-hidden="true">►</span>
                        </span>
                      </button>
                    ))}
                  </div>

                  <button className={"eplist__all"} onClick={() => openPrograma(-1)}>
                    Ver todos los episodios
                  </button>
                </>
              )}

              <section className={"manif"} id="manifiesto">
                <div className={"manif__banner"}>
                  <img className={"manif__banner-bg"} src="/images/manifiesto-bg.webp" alt="" aria-hidden="true" />
                  <img className={"manif__banner-title"} src="/images/manifiesto-titulo-banner.webp" alt="Manifiesto" />
                </div>
                <div className={"manif__text"}>
                  <h3 className={"manif__lead"}>Entendemos la comunicación como acción comunitaria.</h3>
                  <p>
                    Trabajamos por una comunicación del común, medios comunitarios, proximidad y acción.
                  </p>
                  <p className={"manif__body"}>
                    Ondas Disidentes es una red de veinte radialistas comunitarias del Valle Alto y el Cercado
                    de Cochabamba. Sostenemos una señal en línea permanente, en castellano y quechua, con
                    programación producida íntegramente por mujeres desde sus propios barrios: derechos y
                    acceso a la justicia, autonomía económica, migración interna, lenguas originarias, memoria
                    de las pioneras de la radio y cobertura de la violencia machista desde una mirada feminista.
                  </p>
                  <div className={"manif__btns"}>
                    <button
                      type="button"
                      className={cx("manif__btn", "manif__btn--solid")}
                      onClick={() => setWin("nosotrxs")}
                    >
                      Sobre nosotrxs
                    </button>
                    <a
                      className={cx("manif__btn", "manif__btn--outline")}
                      href="/docs/manifiesto-ondas-disidentes.pdf"
                      download="Manifiesto-Ondas-Disidentes.pdf"
                    >
                      Descarga el manifiesto
                    </a>
                  </div>
                  <p className={"credit"}>Con apoyo de</p>
                  <a
                    className={"supporter-logo"}
                    href="https://www.facebook.com/FundacionApthapiJopueti/"
                    target="_blank"
                    rel="noopener"
                    aria-label="Fundación Apthapi Jopueti — Fondo de Mujeres Bolivia"
                  >
                    <img src="/images/logo-apthapi-jopueti.webp" alt="Fondo de Mujeres Bolivia · Apthapi Jopueti" />
                  </a>
                </div>
                <div className={"manif__art"}>
                  <img src="/images/manifiesto-art.webp" alt="Collage: micrófono, laptop y spotlight" />
                </div>
                <span className={"manif__line"} aria-hidden="true" />
              </section>

              <footer className={"sitefoot"}>
                <img className={"sitefoot__logo"} src="/images/ondas-disidentes-logo-footer.png" alt="Ondas Disidentes" />
                <div className={"sitefoot__cols"}>
                  <div className={"sitefoot__col"}>
                    <span className={"sitefoot__label"}>Contacto</span>
                    <span className={"sitefoot__item"}>Email</span>
                    <span className={"sitefoot__item"}>+591 67754287</span>
                  </div>
                  <div className={"sitefoot__col"}>
                    <span className={"sitefoot__label"}>Redes sociales</span>
                    <span className={"sitefoot__item"}>Instagram</span>
                    <span className={"sitefoot__item"}>Facebook</span>
                    <span className={"sitefoot__item"}>SoundCloud</span>
                  </div>
                </div>
              </footer>
            </section>

            {/* ventana: INVESTIGACIÓN */}
            <section className={cx("win", activeWin === "invest" && "on")}>
              <section className={"inv"}>
                <img className={"inv__tz"} src="/images/investigacion-doodle.webp" alt="" aria-hidden="true" />
                <span className={"pill"}>New</span>
                <h2 className={"fix"}>
                  Investi<span className={"hm"}>ga</span>ción
                </h2>
                <p className={cx("sub", "fix")}>
                  Libro <span className={"hm"}>Frecuencia</span> Robada
                </p>
                <p className={"sub2"}>Mujeres y disidencias en la disputa del dial</p>
                <img className={"inv__lupa"} src="/images/mano-lupa.webp" alt="Mano con lupa" />
              </section>
              <section className={"libro"}>
                <div className={"libro__txt"}>
                  <span className={cx("k", "fix")}>Libro</span>
                  <h2 className={"fix"}>
                    <span className={"a"}>
                      Frecuen<span className={"hm"}>cia</span>
                    </span>
                    <br />
                    <span className={"a"}>
                      Ro<span className={"hm"}>ba</span>da
                    </span>
                  </h2>
                  <p className={cx("libro__sub", "fix")}>Mujeres y disidencias en la disputa del dial</p>
                  <p>
                    Una investigación sobre el despojo de las frecuencias en Bolivia y quienes las recuperaron.
                    Sus historias, sus luchas.
                  </p>
                </div>
                <div className={"libro__mock"}>
                  <img className={"libro__mano"} src="/images/libro-mano.webp" alt="" aria-hidden="true" />
                  <div className={"book"}>
                    <span className={"lbl"}>Libro</span>
                    <div className={cx("t", "fix")}>
                      <span className={"a"}>
                        Frecuen<span className={"hm"}>cia</span>
                      </span>
                      <br />
                      <span className={"a"}>
                        Ro<span className={"hm"}>ba</span>da
                      </span>
                    </div>
                    <span className={"st"}>Mujeres y disidencias en la disputa del dial</span>
                  </div>
                </div>
              </section>
              <div className={"endline"}>Ondas Disidentes · Radio alternativa</div>
            </section>

            {/* ventana: SOBRE NOSOTRXS */}
            <section className={cx("win", activeWin === "nosotrxs" && "on")}>
              <header className={"mast"}>
                <h1 className={"fix"}>
                  <span className={"hm"}>Sobre</span> nosotrxs
                </h1>
                <div className={"mast__rule"} aria-hidden="true" />
              </header>

              <section className={"mision"}>
                <div className={"mision__txt"}>
                  <span className={"lbl"}>Misión</span>
                  <h2 className={"fix"}>
                    <span className={cx("hm", "a")}>Comunicación</span> del común
                  </h2>
                  <p>
                    Entendemos la comunicación no como transmisión, sino como un{" "}
                    <span className={"u"}>lugar de encuentro</span>: sucede cuando hay cuerpos que se
                    juntan y una voz dice algo porque sabe que hay otras que escuchan.
                  </p>
                  <p>
                    Trabajamos para que las voces históricamente silenciadas cuestionen quién establece las
                    reglas del decir, y para que la palabra vuele sin censura desde lo común.
                  </p>
                </div>
                <img className={"mision__img"} src="/images/megafono.webp" alt="Megáfono" />
              </section>

              <section className={"ideario"}>
                <article className={"ideario__block"}>
                  <h3 className={cx("ideario__h", "fix")}>Misión</h3>
                  <p>
                    Ondas Disidentes forma, equipa y pone al aire a veinte radialistas comunitarias del Valle
                    Alto y el Cercado de Cochabamba, Bolivia. Sostiene una emisión en línea permanente, en
                    castellano y quechua, con programación producida íntegramente por mujeres desde sus propios
                    barrios y comunidades: derechos y acceso a la justicia, autonomía económica, migración
                    interna, lenguas originarias, memoria de las radialistas pioneras y cobertura de la
                    violencia machista con perspectiva feminista. No emite publicidad comercial, no vende
                    espacios y no responde a ninguna confesión religiosa ni organización partidaria.
                  </p>
                </article>

                <article className={"ideario__block"}>
                  <h3 className={cx("ideario__h", "fix")}>Visión</h3>
                  <p>
                    Al cabo de los veinticuatro meses del proyecto, una red autónoma de radialistas comunitarias
                    feministas con equipo propio, archivo propio y una señal en línea sostenida por ellas
                    mismas: línea editorial feminista estable, programación en lengua originaria y capacidad de
                    seguir al aire después de que termine el financiamiento que la hizo posible.
                  </p>
                </article>

                <article className={"ideario__block"}>
                  <h3 className={cx("ideario__h", "fix")}>Objetivos de la señal en línea</h3>
                  <p className={"ideario__intro"}>
                    Específicos del servidor solicitado, derivados de los seis objetivos aprobados por el Fondo
                    Apthapi Jopueti.
                  </p>
                  <ol className={"ideario__list"}>
                    <li>
                      Emitir de forma permanente las ocho producciones de la primera temporada de la red: cinco
                      horas de estreno semanal más repeticiones, sobre una señal continua 24/7.
                    </li>
                    <li>
                      Alcanzar a las audiencias del Valle Alto y de las comunidades periurbanas del Cercado que
                      no cuentan con una emisora local de contenido propio. En la región hay 87 emisoras: tres
                      están dirigidas por mujeres y ninguna tiene línea editorial feminista.
                    </li>
                    <li>
                      Sostener una franja semanal íntegramente en quechua, con producción y conducción a cargo
                      de hablantes nativas.
                    </li>
                    <li>
                      Alojar y difundir el archivo sonoro de memoria de las radialistas pioneras de Cochabamba
                      que el proyecto está recuperando.
                    </li>
                    <li>
                      Servir de plataforma de práctica sin costo para las radialistas en formación, que no
                      tienen acceso a espacio en el dial comercial.
                    </li>
                  </ol>
                </article>

                <article className={"ideario__block"}>
                  <h3 className={cx("ideario__h", "fix")}>Objetivos aprobados por el fondo</h3>
                  <p className={"ideario__intro"}>
                    Proyecto financiado por la Fundación Apthapi Jopueti (Fondo de Mujeres Bolivia). Duración:
                    24 meses.
                  </p>
                  <div className={"ideario__tablewrap"}>
                    <table className={"ideario__table"}>
                      <thead>
                        <tr>
                          <th>Nº</th>
                          <th>Objetivo</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>1</td>
                          <td>Formación de radialistas feministas</td>
                        </tr>
                        <tr>
                          <td>2</td>
                          <td>Equipamiento para radialistas becadas</td>
                        </tr>
                        <tr>
                          <td>3</td>
                          <td>Producción radiofónica feminista</td>
                        </tr>
                        <tr>
                          <td>4</td>
                          <td>Recuperación de memoria histórica</td>
                        </tr>
                        <tr>
                          <td>5</td>
                          <td>Articulación y red territorial</td>
                        </tr>
                        <tr>
                          <td>6</td>
                          <td>Administración y gestión del proyecto</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </article>
              </section>

              {panelistas.length > 0 && (
                <>
                  <div className={"seq"}>
                    <h2 className={"fix"}>
                      <span className={"a"}>El</span> equipo
                    </h2>
                    <img className={"seq__doodle"} src="/images/heading-doodle.webp" alt="" aria-hidden="true" />
                  </div>
                  <div className={"teamgrid"}>
                    {panelistas.map((p, i) => (
                      <article className={"tcard"} key={p.id}>
                        <div className={cx("tphoto", "halftone")}>
                          <img src={p.fotoUrl} alt="" />
                          <span className={cx("tn", "hum")}>0{i + 1}</span>
                        </div>
                        <div className={"tbody"}>
                          <h3 className={cx("tname", "fix")}>
                            <span className={cx("hm", "a")}>{p.nombre}</span>
                          </h3>
                          <p className={"trole"}>{p.puesto}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                </>
              )}

              <div className={"endline"}>Ondas Disidentes · Radio alternativa</div>
            </section>
          </div>
        </div>
      </div>

      {/* ============ PROGRAMAS (consola) ============ */}
      <div id="prog" style={{ display: mode === "prog" ? "flex" : "none" }}>
        <div className={cx("hbar", menuOpen && "hbar--dark")}>
          <button className={cx("hbar__tag", "lbl")} onClick={goHome}>
            {isLive && "● En vivo · "}Radio alternativa
          </button>
          <button
            className={"burger"}
            aria-expanded={menuOpen}
            aria-controls="menu-prog"
            aria-label="Menú"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        <nav className={cx("menu", menuOpen && "open")} id="menu-prog" aria-label="Secciones">
          <div className={"menu__line"} aria-hidden="true" />
          <div className={"menu__links"}>
            <button onClick={goHome}>Inicio</button>
            <button onClick={() => setMenuOpen(false)}>Programas</button>
            <button onClick={() => { setMode("home"); setWin("nosotrxs"); }}>Sobre nosotrxs</button>
          </div>
          <div className={"menu__line"} aria-hidden="true" />
          <div className={"menu__social"}>
            <span className={"menu__social-item"}>Instagram</span>
            <span className={"menu__social-item"}>Facebook</span>
            <span className={"menu__social-item"}>Soundcloud</span>
          </div>
        </nav>

        <div className={"body"}>
          <div
            className={cx("proglist__backdrop", progListaAbierta && "is-open")}
            onClick={() => setProgListaAbierta(false)}
            aria-hidden="true"
          />
          <aside
            className={cx("proglist", progListaAbierta && "is-open")}
            aria-label="Dial de programas"
          >
            <h2 className={cx("proglist__h", "hum")}>Programas</h2>
            <div className={"proglist__items"}>
              {programas.map((p, pi) => {
                const abierto = pi === currentPrograma;
                return (
                  <div className={cx("proglist__item", abierto && "is-open")} key={p.id}>
                    <button
                      type="button"
                      className={"proglist__hd"}
                      aria-expanded={abierto}
                      onClick={() => selectEpisodio(pi, abierto ? currentEpisodio : 0)}
                    >
                      <span className={"proglist__no"}>{String(pi + 1).padStart(2, "0")}</span>
                      <span className={cx("proglist__title", "hum")}>{soloPrimeraMayuscula(p.titulo)}</span>
                      {abierto && (
                        <>
                          <span className={"proglist__thumb"}>
                            <img src={p.icono} alt="" />
                          </span>
                          <span className={"proglist__chev"} aria-hidden="true">⌄</span>
                        </>
                      )}
                    </button>
                    {abierto && (
                      <div className={"proglist__eps"}>
                        {p.episodios.map((e, ei) => {
                          const reproduciendoEste =
                            reproduccion?.tipo === "grabacion" &&
                            reproduccion.programaIdx === pi &&
                            reproduccion.episodioIdx === ei &&
                            reproduciendo;
                          const esNuevo =
                            !reproduciendoEste && Date.now() - new Date(e.creadoEn).getTime() <= UNA_SEMANA_MS;
                          return (
                            <button
                              key={e.id}
                              type="button"
                              className={"proglist__ep"}
                              aria-current={pi === currentPrograma && ei === currentEpisodio}
                              onClick={() => {
                                selectEpisodio(pi, ei);
                                reproducirEpisodio(pi, ei);
                                setProgListaAbierta(false);
                              }}
                            >
                              <span className={"proglist__epno"}>{String(ei + 1).padStart(2, "0")}</span>
                              <span className={"proglist__eptt"}>{e.nombre}</span>
                              {reproduciendoEste && (
                                <span className={cx("proglist__eptag", "proglist__eptag--live")}>Reproduciendo</span>
                              )}
                              {esNuevo && <span className={cx("proglist__eptag", "proglist__eptag--new")}>Nuevo</span>}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </aside>

          <section
            className={cx("progmain", !!reproduccion && "progmain--with-player")}
            tabIndex={-1}
            ref={mainRef}
          >
            <button
              type="button"
              className={"progmain__menubtn"}
              onClick={() => setProgListaAbierta(true)}
            >
              ☰ Programas
            </button>
            <img className={"progmain__photo"} src={programaActual.icono} alt="" />
            <div className={"progmain__meta"}>
              <span>Episodio {currentEpisodio + 1}</span>
              <b>{episodioActual.duracion}</b>
              <button
                type="button"
                className={"progmain__play"}
                onClick={() =>
                  esteEpisodioReproduciendo
                    ? setReproduciendo((v) => !v)
                    : reproducirEpisodio(currentPrograma, currentEpisodio)
                }
              >
                {esteEpisodioReproduciendo && reproduciendo ? "‖ Pausar" : "► Reproducir"}
              </button>
            </div>
            <h2 className={cx("progmain__title", "fix")}>{soloPrimeraMayuscula(programaActual.titulo)}</h2>
            <p className={"progmain__date"}>{formatearFecha(episodioActual.creadoEn)}</p>
            <p className={cx("progmain__desc", !descAbierta && "is-clamped")}>{episodioActual.descripcion}</p>
            {episodioActual.descripcion.length > 180 && (
              <button type="button" className={"progmain__more"} onClick={() => setDescAbierta((v) => !v)}>
                {descAbierta ? "Leer menos" : "Leer más"}
              </button>
            )}
          </section>
        </div>
      </div>

      {/* ============ REPRODUCTOR GLOBAL ============ */}
      {reproduccion && (
        <div className={"player"}>
          {reproduccion.tipo === "vivo" ? (
            <span className={cx("player__photo", "player__photo--vivo")}>
              <img src="/images/icono-ondas.png" alt="" />
            </span>
          ) : (
            <span className={"player__photo"}>
              <img src={programaReproduccion?.icono} alt="" />
            </span>
          )}

          <div className={"player__body"}>
            <span className={"player__title"}>
              <b className={"player__ep"}>
                {reproduccion.tipo === "vivo" ? "En vivo" : soloPrimeraMayuscula(episodioReproduccion?.nombre ?? "")}
              </b>
              <span className={"player__prog"}>
                {reproduccion.tipo === "vivo"
                  ? "Ondas Disidentes"
                  : soloPrimeraMayuscula(programaReproduccion?.titulo ?? "")}
              </span>
            </span>

            {reproduccion.tipo === "vivo" ? (
              <div className={"player__live"}>
                <button
                  type="button"
                  className={"player__toggle"}
                  onClick={() => setReproduciendo((v) => !v)}
                  aria-label={reproduciendo ? "Pausar" : "Reproducir"}
                >
                  {reproduciendo ? "‖" : "►"}
                </button>
                <span className={cx("player__livedot", !reproduciendo && "off")} aria-hidden="true" />
                <span className={"player__livelbl"}>En vivo</span>
                <span className={"player__time"}>{formatearTiempo(vivoTiempo)}</span>
              </div>
            ) : contenidoReproduccion?.tipo === "soundcloud" ? (
              <a className={"player__sc"} href={contenidoReproduccion.url} target="_blank" rel="noreferrer">
                Escuchar en SoundCloud ↗
              </a>
            ) : audioUrlReproduccion ? (
              <div className={"player__controls"}>
                <button
                  type="button"
                  className={"player__skip"}
                  aria-label="Retroceder 15 segundos"
                  onClick={() => {
                    const el = recAudioRef.current;
                    if (el) el.currentTime = Math.max(0, el.currentTime - 15);
                  }}
                >
                  «15
                </button>
                <button
                  type="button"
                  className={"player__toggle"}
                  onClick={() => setReproduciendo((v) => !v)}
                  aria-label={reproduciendo ? "Pausar" : "Reproducir"}
                >
                  {reproduciendo ? "‖" : "►"}
                </button>
                <button
                  type="button"
                  className={"player__skip"}
                  aria-label="Adelantar 15 segundos"
                  onClick={() => {
                    const el = recAudioRef.current;
                    if (el) el.currentTime = Math.min(recTiempo.duracion || el.duration || 0, el.currentTime + 15);
                  }}
                >
                  15»
                </button>
                <span className={"player__time"}>{formatearTiempo(recTiempo.actual)}</span>
                <input
                  type="range"
                  className={"player__seek"}
                  min={0}
                  max={recTiempo.duracion || 0}
                  step={1}
                  value={Math.min(recTiempo.actual, recTiempo.duracion || 0)}
                  style={{ "--pct": `${recPct}%` } as React.CSSProperties}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setRecTiempo((t) => ({ ...t, actual: v }));
                    if (recAudioRef.current) recAudioRef.current.currentTime = v;
                  }}
                  aria-label="Progreso del episodio"
                />
                <span className={"player__time"}>{formatearTiempo(recTiempo.duracion)}</span>
              </div>
            ) : (
              <span className={"player__unavail"}>Audio no disponible todavía</span>
            )}

            <button
              type="button"
              className={"player__close"}
              onClick={cerrarReproductor}
              aria-label="Cerrar reproductor"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}
