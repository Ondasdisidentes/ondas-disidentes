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

export const fixtureUltra = localFont({
  src: [
    { path: "../../public/fonts/FixtureUltra-SemiBold.otf", weight: "600", style: "normal" },
    { path: "../../public/fonts/FixtureUltra-Bold.otf", weight: "700", style: "normal" },
  ],
  variable: "--font-fixture-ultra",
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
