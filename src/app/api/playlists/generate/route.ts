import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(request: NextRequest) {
  console.log("🎵 Iniciando geração de playlist...");

  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Testar token primeiro
    const userResponse = await fetch("https://api.spotify.com/v1/me", {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    });

    if (!userResponse.ok) {
      console.error("❌ Token inválido:", userResponse.status);
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    const userData = await userResponse.json();
    console.log("✅ Token válido para:", userData.display_name);

    // Obter dados do body
    const body = await request.json();
    console.log("📦 Body completo recebido:", JSON.stringify(body, null, 2));

    const { moodInput, targetSize } = body;

    // Validar moodInput
    if (!moodInput) {
      console.error("❌ moodInput não fornecido");
      return NextResponse.json(
        { error: "moodInput é obrigatório" },
        { status: 400 }
      );
    }

    console.log("📦 Mood input:", JSON.stringify(moodInput, null, 2));

    // Estratégia 1: Usar search em vez de recommendations
    const tracks = await searchSpotifyTracksByMood(
      moodInput,
      session.accessToken,
      targetSize || 30
    );

    const playlist = {
      id: `mood-${Date.now()}`,
      name: `Playlist ${moodInput.type} - ${new Date().toLocaleDateString()}`,
      description: `Playlist gerada baseada no seu mood: ${moodInput.type}`,
      tracks: tracks,
      moodData: moodInput,
      createdAt: new Date().toISOString(),
      spotifyUrl: "",
    };

    // Salvar no Spotify se solicitados
    if (body.saveToSpotify) {
      console.log("💾 Salvando playlist no Spotify automaticamente...");
      try {
        const savedPlaylist = await savePlaylistToSpotify(
          playlist,
          session.accessToken,
          userData.id
        );
        playlist.spotifyUrl = savedPlaylist.external_urls.spotify;
        console.log("✅ Playlist salva automaticamente no Spotify");
      } catch (error) {
        console.error("⚠️ Erro ao salvar automaticamente:", error);
        // Não falhar a geração por causa do erro de salvamento
      }
    }

    console.log("🎉 Playlist gerada:", playlist.tracks.length, "músicas");
    return NextResponse.json(playlist);
  } catch (error: any) {
    console.error("💥 Erro:", error);
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

async function searchSpotifyTracksByMood(
  moodInput: any,
  accessToken: string,
  targetSize: number
) {
  console.log("🔍 Buscando músicas por mood...");

  // Mapear mood para termos de busca
  const searchTerms = getMoodSearchTerms(moodInput);
  console.log("🎯 Termos de busca:", searchTerms);

  const allTracks = [];

  // Fazer múltiplas buscas para obter variedade
  for (const term of searchTerms) {
    try {
      const tracks = await searchSpotifyTracks(
        term,
        accessToken,
        Math.ceil(targetSize / searchTerms.length)
      );
      allTracks.push(...tracks);
    } catch (error) {
      console.warn("⚠️ Erro na busca:", term, error);
    }
  }

  // Remover duplicatas e limitar
  const uniqueTracks = allTracks.filter(
    (track, index, self) => index === self.findIndex((t) => t.id === track.id)
  );

  return uniqueTracks.slice(0, targetSize);
}

function getMoodSearchTerms(moodInput: any): string[] {
  console.log("🎭 Processando mood input:", moodInput);

  // Verificar se moodInput existe
  if (!moodInput || !moodInput.type || !moodInput.value) {
    console.warn("⚠️ Mood input inválido, usando padrão");
    return ["popular music", "top hits", "feel good music"];
  }

  const { type, value } = moodInput;

  try {
    switch (type) {
      case "color":
        return getColorSearchTerms(value);
      case "emoji":
        return getEmojiSearchTerms(value);
      case "emotion":
        return getEmotionSearchTerms(value);
      case "coordinate":
        return getCoordinateSearchTerms(value);
      default:
        console.warn("⚠️ Tipo de mood desconhecido:", type);
        return ["popular music", "top hits", "feel good music"];
    }
  } catch (error) {
    console.error("❌ Erro ao processar mood:", error);
    return ["popular music", "top hits", "feel good music"];
  }
}

function getColorSearchTerms(color: string): string[] {
  console.log("🎨 Processando cor:", color);

  // Verificar se color é válido
  if (!color || typeof color !== "string") {
    console.warn("⚠️ Cor inválida, usando padrão");
    return ["popular music", "top hits"];
  }

  const colorMappings: { [key: string]: string[] } = {
    "#ff0000": ["rock music", "energetic songs", "powerful music"], // Vermelho
    "#0000ff": ["calm music", "chill songs", "relaxing music"], // Azul
    "#ffff00": ["happy music", "upbeat songs", "feel good music"], // Amarelo
    "#FFFF00": ["happy music", "upbeat songs", "feel good music"], // Amarelo maiúsculo
    "#800080": ["indie music", "alternative rock", "mysterious music"], // Roxo
    "#00ff00": ["nature sounds", "folk music", "acoustic songs"], // Verde
    "#ffa500": ["dance music", "party songs", "vibrant music"], // Laranja
    "#ff69b4": ["pop music", "fun songs", "catchy music"], // Rosa
    "#000000": ["dark music", "metal songs", "gothic music"], // Preto
    "#ffffff": ["pure music", "clean songs", "minimal music"], // Branco
  };

  const result = colorMappings[color] || ["popular music", "top hits"];
  console.log("🎨 Cor encontrada:", color, "-> Termos:", result);
  return result;
}

function getEmojiSearchTerms(emojis: string[]): string[] {
  console.log("😊 Processando emojis:", emojis);

  // Verificar se emojis é válido
  if (!emojis || !Array.isArray(emojis) || emojis.length === 0) {
    console.warn("⚠️ Emojis inválidos, usando padrão");
    return ["popular music", "top hits"];
  }

  const emojiMappings: { [key: string]: string[] } = {
    "😊": ["happy music", "feel good songs"],
    "😢": ["sad music", "emotional songs"],
    "😡": ["angry music", "rock songs"],
    "😴": ["sleep music", "calm songs"],
    "🎉": ["party music", "celebration songs"],
    "❤️": ["love songs", "romantic music"],
    "🔥": ["hot music", "trending songs"],
    "✨": ["magical music", "dreamy songs"],
    "🌙": ["night music", "moonlight songs"],
    "☀️": ["sunny music", "morning songs"],
  };

  const terms: string[] = [];
  emojis.forEach((emoji) => {
    if (emojiMappings[emoji]) {
      terms.push(...emojiMappings[emoji]);
    }
  });

  return terms.length > 0 ? terms : ["popular music", "top hits"];
}

function getEmotionSearchTerms(emotion: string): string[] {
  console.log("🧠 Processando emoção:", emotion);

  // Verificar se emotion é válido
  if (!emotion || typeof emotion !== "string" || emotion.trim() === "") {
    console.warn("⚠️ Emoção inválida, usando padrão");
    return ["popular music", "top hits", "feel good music"];
  }

  const emotionWords = emotion.toLowerCase().trim();

  if (
    emotionWords.includes("feliz") ||
    emotionWords.includes("alegre") ||
    emotionWords.includes("happy")
  ) {
    return ["happy music", "feel good songs", "upbeat music"];
  }
  if (
    emotionWords.includes("triste") ||
    emotionWords.includes("melancólico") ||
    emotionWords.includes("sad")
  ) {
    return ["sad music", "emotional songs", "melancholy music"];
  }
  if (
    emotionWords.includes("energético") ||
    emotionWords.includes("animado") ||
    emotionWords.includes("energetic")
  ) {
    return ["energetic music", "upbeat songs", "high energy music"];
  }
  if (
    emotionWords.includes("calmo") ||
    emotionWords.includes("relaxado") ||
    emotionWords.includes("calm")
  ) {
    return ["calm music", "relaxing songs", "chill music"];
  }
  if (
    emotionWords.includes("romântico") ||
    emotionWords.includes("amor") ||
    emotionWords.includes("romantic")
  ) {
    return ["romantic music", "love songs", "romantic ballads"];
  }
  if (
    emotionWords.includes("nostálgico") ||
    emotionWords.includes("saudade") ||
    emotionWords.includes("nostalgic")
  ) {
    return ["nostalgic music", "throwback songs", "classic hits"];
  }

  return ["popular music", "top hits", "feel good music"];
}

function getCoordinateSearchTerms(coordinates: {
  x: number;
  y: number;
}): string[] {
  console.log("📊 Processando coordenadas:", coordinates);

  // Verificar se coordinates existe e tem as propriedades necessárias
  if (
    !coordinates ||
    typeof coordinates.x !== "number" ||
    typeof coordinates.y !== "number"
  ) {
    console.warn("⚠️ Coordenadas inválidas, usando padrão");
    return ["popular music", "top hits", "feel good music"];
  }

  const valence = Math.max(0, Math.min(1, coordinates.x));
  const energy = Math.max(0, Math.min(1, coordinates.y));

  console.log("📊 Valence:", valence, "Energy:", energy);

  if (energy > 0.7) {
    return valence > 0.6
      ? ["dance music", "party songs", "upbeat music"]
      : ["rock music", "metal songs", "intense music"];
  } else if (energy < 0.3) {
    return valence > 0.6
      ? ["calm music", "peaceful songs", "ambient music"]
      : ["sad music", "melancholy songs", "emotional music"];
  } else {
    return valence > 0.6
      ? ["pop music", "feel good songs", "mainstream music"]
      : ["alternative music", "indie songs", "moody music"];
  }
}

async function searchSpotifyTracks(
  searchTerm: string,
  accessToken: string,
  limit: number
) {
  const params = new URLSearchParams({
    q: searchTerm,
    type: "track",
    limit: Math.min(limit, 50).toString(),
    market: "BR",
  });

  const url = `https://api.spotify.com/v1/search?${params}`;
  console.log("🌐 Buscando:", url);

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("❌ Erro na busca:", response.status, errorText);
    throw new Error(`Erro na busca: ${response.status}`);
  }

  const data = await response.json();

  if (!data.tracks?.items) {
    console.warn("⚠️ Nenhuma música encontrada para:", searchTerm);
    return [];
  }

  return data.tracks.items.map((track: any) => ({
    id: track.id,
    name: track.name,
    artists: track.artists.map((artist: any) => artist.name),
    album: track.album.name,
    preview_url: track.preview_url,
    external_urls: track.external_urls,
    duration_ms: track.duration_ms,
    popularity: track.popularity,
  }));
}

async function savePlaylistToSpotify(
  playlist: any,
  accessToken: string,
  userId: string
) {
  console.log("💾 Salvando playlist no Spotify...");

  // Criar playlist
  const createResponse = await fetch(
    `https://api.spotify.com/v1/users/${userId}/playlists`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: playlist.name,
        description: playlist.description,
        public: false,
      }),
    }
  );

  if (!createResponse.ok) {
    throw new Error("Falha ao criar playlist no Spotify");
  }

  const createdPlaylist = await createResponse.json();

  // Adicionar tracks
  const trackUris = playlist.tracks.map(
    (track: any) => `spotify:track:${track.id}`
  );

  const chunks = [];
  for (let i = 0; i < trackUris.length; i += 100) {
    chunks.push(trackUris.slice(i, i + 100));
  }

  for (const chunk of chunks) {
    await fetch(
      `https://api.spotify.com/v1/playlists/${createdPlaylist.id}/tracks`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uris: chunk,
        }),
      }
    );
  }

  return createdPlaylist;
}
