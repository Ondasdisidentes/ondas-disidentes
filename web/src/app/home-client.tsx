"use client";

import { useEffect, useState } from "react";
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

type Mode = "home" | "prog";
type WinName = "inicio" | "invest" | "nosotrxs";

function useBoliviaClock() {
  const [time, setTime] = useState("--:--:--");
  useEffect(() => {
    function fmt() {
      try {
        return new Intl.DateTimeFormat("es-BO", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
          timeZone: "America/La_Paz",
        }).format(new Date());
      } catch {
        const d = new Date();
        return [d.getHours(), d.getMinutes(), d.getSeconds()]
          .map((x) => (x < 10 ? "0" + x : String(x)))
          .join(":");
      }
    }
    const id = setInterval(() => setTime(fmt()), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

function useLiveStatus() {
  const [live, setLive] = useState(false);
  useEffect(() => {
    let cancelled = false;
    async function check() {
      try {
        const res = await fetch("/api/icecast-status", { cache: "no-store" });
        const data = await res.json();
        if (!cancelled) setLive(Boolean(data.live));
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
  return live;
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
  const [isPlaying, setIsPlaying] = useState(false);

  const clock = useBoliviaClock();
  const isLive = useLiveStatus();

  function openPrograma(i: number, autoplay?: boolean) {
    if (i >= 0) {
      setCurrentPrograma(i);
      setCurrentEpisodio(0);
    }
    setMode("prog");
    if (autoplay) setIsPlaying(true);
  }

  function selectEpisodio(programaIdx: number, episodioIdx: number) {
    setCurrentPrograma(programaIdx);
    setCurrentEpisodio(episodioIdx);
  }

  function playEpisodio(programaIdx: number, episodioIdx: number) {
    setCurrentPrograma(programaIdx);
    setCurrentEpisodio(episodioIdx);
    setMode("prog");
    setIsPlaying(true);
  }

  function stopAndGoHome() {
    setIsPlaying(false);
    setMode("home");
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
      {/* ============ HOME (ventanas) ============ */}
      <div id="home" style={{ display: mode === "home" ? "flex" : "none" }}>
        <div className={"hbar"}>
          <button className={cx("hbar__tag", "lbl")} onClick={() => openPrograma(-1)}>
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
            <button onClick={() => setWin("invest")}>Investigación</button>
            <button onClick={() => setWin("nosotrxs")}>Sobre nosotrxs</button>
          </div>
          <div className={"menu__line"} aria-hidden="true" />
          <div className={"menu__social"}>
            <a href="#" aria-label="Instagram" target="_blank" rel="noopener">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4.2" />
                <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
              </svg>
            </a>
            <a href="#" aria-label="Facebook" target="_blank" rel="noopener">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <circle cx="12" cy="12" r="9" />
                <path d="M13.6 20.6v-6.9h2.3l.35-2.7h-2.65V9.2c0-.78.22-1.31 1.34-1.31h1.43V5.47a19 19 0 0 0-2.08-.1c-2.06 0-3.47 1.26-3.47 3.56v1.98H8.5v2.7h2.36v6.9" />
              </svg>
            </a>
            <a href="#" aria-label="SoundCloud" target="_blank" rel="noopener">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M7 17.5h9.5a3.3 3.3 0 0 0 .4-6.58 4.3 4.3 0 0 0-8.2-1.4A2.8 2.8 0 0 0 7 17.5Z" />
                <path d="M9 12v5M11 10.5v6.5M13 11v6M5 14v3.5" strokeLinecap="round" />
              </svg>
            </a>
          </div>
        </nav>

        <div className={"winwrap"}>
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
                            <img src={episodio.imagenUrl || "/images/portada-default.webp"} alt="" />
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
                <div>
                  <h2 className={"fix"}>
                    Man<span className={"hm"}>if</span>iesto
                  </h2>
                  <img className={"tz"} src="/images/manifiesto-doodle.webp" alt="" aria-hidden="true" />
                  <p>
                    Ondas Disidentes nace desde <span className={"u"}>el común</span>: entendemos la
                    comunicación no como transmisión, sino como acción comunitaria. Sucede en la proximidad,
                    cuando hay cuerpos que se encuentran y una voz dice algo porque sabe que hay otras que
                    escuchan.
                  </p>
                  <blockquote className={cx("manif__q", "fix")}>
                    Por una comunicación del común: medios comunitarios, proximidad y acción.
                  </blockquote>
                  <p>
                    Las voces históricamente silenciadas disputan quién establece las reglas del decir y hacen
                    que la palabra vuele sin censura, desde lo común.
                  </p>
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
                  <img
                    className={cx("manif__tzc", "manif__tzc--1")}
                    src="/images/manifiesto-doodle-1.webp"
                    alt=""
                    aria-hidden="true"
                  />
                  <img
                    className={cx("manif__tzc", "manif__tzc--2")}
                    src="/images/manifiesto-doodle-2.webp"
                    alt=""
                    aria-hidden="true"
                  />
                  <div className={"manif__collage"}>
                    <div className={cx("mc", "mc--big", "halftone")}>
                      <img src="/images/megafono-principal.webp" alt="Radialista en la consola" />
                    </div>
                    <div className={cx("mc", "mc--sm", "halftone")}>
                      <img src="/images/megafono.webp" alt="Megáfono" />
                    </div>
                    <div className={cx("mc", "mc--sm2", "halftone")}>
                      <img src="/images/voz-al-aire.webp" alt="Voz al aire" />
                    </div>
                    <span className={cx("mc__tag", "fix")}>
                      Comunicación
                      <br />
                      del común
                    </span>
                  </div>
                  <a
                    className={cx("dlpdf", "dlpdf--wide")}
                    href="/docs/manifiesto-ondas-disidentes.pdf"
                    download="Manifiesto-Ondas-Disidentes.pdf"
                  >
                    <span className={"dlpdf__ic"} aria-hidden="true">↓</span>
                    <span className={"dlpdf__tx"}>
                      <b>Descargar el manifiesto</b>
                      <span>PDF · Ondas Disidentes</span>
                    </span>
                  </a>
                </div>
              </section>

              <div className={"endline"}>Ondas Disidentes · Radio alternativa</div>
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
        <div className={"topbar"}>
          <div className={"grp"}>
            <button className={"back"} onClick={() => setMode("home")}>← Inicio</button>
            <span className={"id"}>
              <span className={"fix"} style={{ fontSize: "1rem" }}>Programas</span>
              <span>Radio alternativa</span>
            </span>
          </div>
          <div className={"clock"}>
            En vivo · <time>{clock}</time> Bolivia
          </div>
        </div>

        <div className={"body"}>
          <aside className={"tuner"} aria-label="Dial de programas">
            <div className={cx("hd", "lbl")}>Dial · Programas</div>
            <div className={"tuner__list"}>
              {programas.map((p, pi) => (
                <div className={"freqgrp"} key={p.id}>
                  <div className={"freqgrp__hd"}>
                    <img src={p.icono} alt="" />
                    <span>{p.titulo}</span>
                  </div>
                  {p.episodios.map((e, ei) => (
                    <button
                      key={e.id}
                      className={"freq"}
                      aria-current={pi === currentPrograma && ei === currentEpisodio}
                      onClick={() => selectEpisodio(pi, ei)}
                    >
                      <span className={"no"}>{String(ei + 1).padStart(2, "0")}</span>
                      <span className={"tt"}>{e.nombre}</span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </aside>

          <section className={"main"} tabIndex={-1}>
            <div className={"panelhead"}>
              <div>
                <div className={"meta"}>
                  <span>{programaActual.titulo}</span>
                  <b>{episodioActual.duracion}</b>
                </div>
                <h2 className={"big"}>
                  <span className={cx("hm", "a")}>{episodioActual.nombre}</span>
                </h2>
              </div>
              <img className={"pimg"} src={programaActual.icono} alt="" />
            </div>
            <p className={"desc"}>{episodioActual.descripcion}</p>

            <div className={"live"}>
              <div className={"live__hd"}>
                <span className={"live__dot"} />
                <span className={"lbl"}>En directo · Icecast</span>
              </div>
              <div className={"live__now"}>
                <span className={"live__nowlbl"}>Sonando ahora</span>
                <span className={"live__nowt"}>—</span>
              </div>
              <div className={"live__row"}>
                <button
                  className={cx("btn", "btn--solid")}
                  onClick={() => setIsPlaying((v) => !v)}
                >
                  {isPlaying ? "‖ Detener en vivo" : "► Escuchar en vivo"}
                </button>
                <span className={"live__meta"}>
                  Transmisión pendiente de conectar (giss.tv)
                </span>
              </div>
            </div>
          </section>
        </div>

        <div className={"transport"}>
          <button
            className={"tbtn"}
            aria-label={isPlaying ? "Pausar transmisión" : "Reproducir en vivo"}
            onClick={() => setIsPlaying((v) => !v)}
          >
            {isPlaying ? "‖" : "►"}
          </button>
          <button className={"tbtn"} aria-label="Detener y volver a inicio" onClick={stopAndGoHome}>■</button>
          <div className={cx("nowair", !isPlaying && "off")}>
            <span className={"sq"} aria-hidden="true" />
            <span className={"t"}>
              Al aire<b>{isPlaying ? "En vivo · Ondas Disidentes" : "—"}</b>
            </span>
          </div>
          <div className={cx("marq", !isPlaying && "paused")}>
            <span className={"marq__t"}>
              En vivo <i>●</i> Ondas Disidentes <i>●</i> Radio alternativa <i>●</i> En vivo <i>●</i> Ondas
              Disidentes <i>●</i> Radio alternativa <i>●</i>
            </span>
          </div>
          <div className={"tclock"}>
            Señal · <time>{clock}</time>
          </div>
        </div>
      </div>
    </>
  );
}
