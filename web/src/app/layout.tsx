import type { Metadata, Viewport } from "next";
import { humane, fixtureUltra, konsens } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ondas Disidentes — Radio alternativa",
  description:
    "Ondas Disidentes: radio alternativa. Las frecuencias también son un bien común. Nosotrxs las disputamos.",
};

export const viewport: Viewport = {
  themeColor: "#ECECE1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${humane.variable} ${fixtureUltra.variable} ${konsens.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
