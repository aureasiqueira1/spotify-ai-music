import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Spotify AI Music Discovery",
  description:
    "Descubra música através de cores, emojis e emoções com inteligência artificial",
  keywords: ["spotify", "música", "IA", "playlist", "mood", "emoções"],
  authors: [{ name: "Spotify AI Music Discovery" }],
  robots: "index, follow",
  openGraph: {
    title: "Spotify AI Music Discovery",
    description:
      "Descubra música através de cores, emojis e emoções com inteligência artificial",
    type: "website",
    locale: "pt_BR",
  },
  metadataBase: new URL("http://localhost:3000"),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
