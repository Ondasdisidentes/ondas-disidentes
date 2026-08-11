import type { Metadata, Viewport } from "next";
import { humane, fixtureUltra, konsens } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ondas Disidentes — Radio alternativa",
  description:
    "Ondas Disidentes: radio alternativa. Las frecuencias también son un bien común. Nosotrxs las disputamos.",
};

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: "#F4F4EF",
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
      <head>
        <style>{`
          .safari-edge-tint{position:fixed;left:0;width:100%;min-height:12px;background-color:#F4F4EF;pointer-events:none}
          .safari-edge-tint--top{top:-8px}
          .safari-edge-tint--bottom{bottom:-8px}
        `}</style>
      </head>
      <body>
        <div className="safari-edge-tint safari-edge-tint--top" aria-hidden="true" />
        {children}
        <div className="safari-edge-tint safari-edge-tint--bottom" aria-hidden="true" />
      </body>
    </html>
  );
}
