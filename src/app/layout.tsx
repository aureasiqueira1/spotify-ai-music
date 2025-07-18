import TokenStatus from "@/components/auth/TokenStatus";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NextAuthSessionProvider from "./providers/SessionProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Spotify AI Music Discovery",
  description: "Descubra músicas baseadas no seu mood usando IA",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <NextAuthSessionProvider>
          <TokenStatus />
          {children}
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}
