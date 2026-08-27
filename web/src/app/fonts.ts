import localFont from "next/font/local";

// Los archivos .otf viven en web/public/fonts/, fuera de git (licencia comercial).
// Cópialos ahí desde ../assets/fuentes/ antes de correr `npm run dev` o `npm run build`.
// En producción se servirán desde Supabase Storage (pendiente de conectar).

export const humane = localFont({
  src: "../../public/fonts/Humane-Bold.otf",
  weight: "700",
  style: "normal",
  variable: "--font-humane",
  display: "swap",
});

// Tipografía de títulos. Es una sola cara estática de peso 400 (no hay bold ni
// versión variable), así que .fix/.fx en theme.css NO deben pedir font-weight:700:
// el navegador sintetizaría una negrita falsa. Ver --f-tit.
export const warsawGothicCond = localFont({
  src: "../../public/fonts/WarsawGothic-Condensed.otf",
  weight: "400",
  style: "normal",
  variable: "--font-warsaw-cond",
  display: "swap",
});

export const konsens = localFont({
  src: [
    { path: "../../public/fonts/Konsens-Regular.otf", weight: "400", style: "normal" },
    { path: "../../public/fonts/Konsens-Bold.otf", weight: "700", style: "normal" },
  ],
  variable: "--font-konsens",
  display: "swap",
});
