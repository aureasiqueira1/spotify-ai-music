import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(request: NextRequest) {
  console.log("💾 Iniciando salvamento no Spotify...");

  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      console.error("❌ Usuário não autenticado");
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Obter dados do usuário primeiro
    const userResponse = await fetch("https://api.spotify.com/v1/me", {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    });

    if (!userResponse.ok) {
      console.error("❌ Token inválido:", userResponse.status);
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    const userData = await userResponse.json();
    console.log("✅ Usuário autenticado:", userData.display_name);

    // Obter dados da playlist
    const body = await request.json();
    console.log("📦 Dados recebidos:", JSON.stringify(body, null, 2));

    const { playlist } = body;

    if (!playlist || !playlist.tracks || playlist.tracks.length === 0) {
      console.error("❌ Playlist inválida");
      return NextResponse.json({ error: "Playlist inválida" }, { status: 400 });
    }

    // Passo 1: Criar a playlist no Spotify
    console.log("🎵 Criando playlist no Spotify...");
    const createPlaylistResponse = await fetch(
      `https://api.spotify.com/v1/users/${userData.id}/playlists`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: playlist.name,
          description: playlist.description,
          public: false, // Playlist privada por padrão
        }),
      }
    );

    if (!createPlaylistResponse.ok) {
      const errorData = await createPlaylistResponse.json();
      console.error("❌ Erro ao criar playlist:", errorData);
      return NextResponse.json(
        { error: "Falha ao criar playlist no Spotify", details: errorData },
        { status: 500 }
      );
    }

    const createdPlaylist = await createPlaylistResponse.json();
    console.log(
      "✅ Playlist criada:",
      createdPlaylist.id,
      createdPlaylist.name
    );

    // Passo 2: Adicionar músicas à playlist
    console.log("🎶 Adicionando músicas à playlist...");

    // Converter IDs das músicas para URIs do Spotify
    const trackUris = playlist.tracks.map(
      (track: any) => `spotify:track:${track.id}`
    );
    console.log("🎯 Adicionando", trackUris.length, "músicas");

    // Spotify permite até 100 músicas por requisição
    const chunks = [];
    for (let i = 0; i < trackUris.length; i += 100) {
      chunks.push(trackUris.slice(i, i + 100));
    }

    for (const chunk of chunks) {
      const addTracksResponse = await fetch(
        `https://api.spotify.com/v1/playlists/${createdPlaylist.id}/tracks`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            uris: chunk,
          }),
        }
      );

      if (!addTracksResponse.ok) {
        const errorData = await addTracksResponse.json();
        console.error("❌ Erro ao adicionar músicas:", errorData);
        return NextResponse.json(
          {
            error: "Falha ao adicionar músicas à playlist",
            details: errorData,
          },
          { status: 500 }
        );
      }

      console.log("✅ Adicionadas", chunk.length, "músicas");
    }

    console.log("🎉 Playlist salva com sucesso no Spotify!");

    return NextResponse.json({
      success: true,
      playlist: {
        id: createdPlaylist.id,
        name: createdPlaylist.name,
        description: createdPlaylist.description,
        external_urls: createdPlaylist.external_urls,
        tracks: {
          total: playlist.tracks.length,
        },
      },
    });
  } catch (error: any) {
    console.error("💥 Erro ao salvar no Spotify:", error);
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        details: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
