import { SpotifyService } from "@/lib/application/services/SpotifyService";
import connectToDatabase from "@/lib/infrastructure/database/connection";
import { Playlist as PlaylistModel } from "@/lib/infrastructure/models";
import { getUserFromSession } from "@/lib/utils/auth";
import { NextRequest, NextResponse } from "next/server";
import { SavePlaylistCommand } from "../../../../lib/application/dtos/Command";
import { Track } from "../../../../lib/domain/entities/Track";

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromSession(request);
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await request.json();

    // Validar corpo da requisição
    if (!body.playlistId || !body.name) {
      return NextResponse.json(
        { error: "playlistId e name são obrigatórios" },
        { status: 400 }
      );
    }

    // Criar comando
    const command = new SavePlaylistCommand({
      userId: user.id,
      playlistId: body.playlistId,
      name: body.name,
      description: body.description,
      saveToSpotify: body.saveToSpotify || false,
    });

    // Buscar playlist no banco
    await connectToDatabase();
    const playlist = await PlaylistModel.findById(command.playlistId);

    if (!playlist) {
      return NextResponse.json(
        { error: "Playlist não encontrada" },
        { status: 404 }
      );
    }

    // Verificar se o usuário é o dono da playlist
    if (playlist.userId.toString() !== command.userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    let spotifyPlaylistId = playlist.spotifyPlaylistId;

    // Salvar no Spotify se solicitado
    if (command.saveToSpotify) {
      const spotifyService = new SpotifyService(user.accessToken);

      try {
        // Criar playlist no Spotify
        spotifyPlaylistId = await spotifyService.createPlaylist(
          user.spotifyId,
          command.name,
          command.description || playlist.description
        );

        // Adicionar tracks à playlist
        // Nota: Precisaríamos buscar os tracks completos do banco ou da API
        // Por enquanto, vamos assumir que os tracks têm spotifyUri
        const tracks: Track[] = []; // Aqui você buscaria os tracks completos
        await spotifyService.addTracksToPlaylist(spotifyPlaylistId, tracks);

        // Atualizar playlist no banco
        playlist.spotifyPlaylistId = spotifyPlaylistId;
        await playlist.save();
      } catch (error: any) {
        console.error("Erro ao salvar no Spotify:", error);
        return NextResponse.json(
          { error: "Erro ao salvar playlist no Spotify" },
          { status: 500 }
        );
      }
    }

    // Atualizar nome e descrição no banco
    playlist.name = command.name;
    if (command.description) {
      playlist.description = command.description;
    }
    playlist.updatedAt = new Date();
    await playlist.save();

    return NextResponse.json({
      success: true,
      playlist: {
        id: playlist._id.toString(),
        name: playlist.name,
        description: playlist.description,
        spotifyPlaylistId: playlist.spotifyPlaylistId,
      },
    });
  } catch (error: any) {
    console.error("Erro ao salvar playlist:", error);

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
