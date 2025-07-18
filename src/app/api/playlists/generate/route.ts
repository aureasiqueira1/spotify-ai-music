import { SpotifyService } from "@/lib/application/services/SpotifyService";
import { GeneratePlaylistUC } from "@/lib/application/usecases/playlists/GeneratePlaylistUC";
import { ClaudeAPI } from "@/lib/infrastructure/external/ClaudeAPI";
import { NextRequest, NextResponse } from "next/server";
import { GeneratePlaylistCommand } from "../../../../lib/application/dtos/Command";
import { getUserFromSession } from "../../../../lib/utils/auth";

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromSession(request);
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await request.json();

    // Validar corpo da requisição
    if (!body.moodInput) {
      return NextResponse.json(
        { error: "moodInput é obrigatório" },
        { status: 400 }
      );
    }

    // Criar comando
    const command = new GeneratePlaylistCommand({
      userId: user.id,
      moodInput: body.moodInput,
      playlistName: body.playlistName,
      playlistDescription: body.playlistDescription,
      targetSize: body.targetSize || 30,
      saveToSpotify: body.saveToSpotify || false,
    });

    // Inicializar serviços
    const spotifyService = new SpotifyService(user.accessToken);
    const claudeAPI = new ClaudeAPI(process.env.CLAUDE_API_KEY!);

    // Executar use case
    const generatePlaylistUC = new GeneratePlaylistUC(
      spotifyService,
      claudeAPI
    );
    const playlist = await generatePlaylistUC.execute(command);

    return NextResponse.json(playlist);
  } catch (error: any) {
    console.error("Erro ao gerar playlist:", error);

    if (error.message.includes("Token expirado")) {
      return NextResponse.json(
        { error: "Token expirado. Faça login novamente." },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
