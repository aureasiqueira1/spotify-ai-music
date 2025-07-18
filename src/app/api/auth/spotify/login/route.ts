import { SpotifyAPI } from "@/lib/infrastructure/external/SpotifyAPI";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const authURL = SpotifyAPI.getAuthURL();

    return NextResponse.redirect(authURL);
  } catch (error) {
    console.error("Erro ao gerar URL de autenticação:", error);

    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
