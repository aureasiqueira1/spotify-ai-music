import { SpotifyService } from "@/lib/application/services/SpotifyService";
import { RecommendationEngine } from "@/lib/domain/services/RecommendationEngine";
import { ClaudeAPI } from "@/lib/infrastructure/external/ClaudeAPI";
import { getUserFromSession } from "@/lib/utils/auth";
import { COLOR_MAPPINGS } from "@/lib/utils/mappings";
import { NextRequest, NextResponse } from "next/server";
import { ColorRecommendationCommand } from "../../../lib/application/dtos/Command";

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromSession(request);
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const { type, ...params } = body;

    if (!type || !["color", "emoji", "emotion", "coordinate"].includes(type)) {
      return NextResponse.json(
        { error: "Tipo de recomendação inválido" },
        { status: 400 }
      );
    }

    // Inicializar serviços
    const spotifyService = new SpotifyService(user.accessToken);
    const claudeAPI = new ClaudeAPI(process.env.CLAUDE_API_KEY!);

    let recommendations;

    switch (type) {
      case "color":
        recommendations = await handleColorRecommendation(
          user.id,
          params,
          spotifyService
        );
        break;

        // case 'emoji':
        //   recommendations = await handleEmojiRecommendation(
        //     user.id,
        //     params,
        //     spotifyService
        //   );
        //   break;

        // case 'emotion':
        //   recommendations = await handleEmotionRecommendation(
        //     user.id,
        //     params,
        //     spotifyService,
        //     claudeAPI
        //   );
        //   break;

        // case 'coordinate':
        //   recommendations = await handleCoordinateRecommendation(
        //     user.id,
        //     params,
        //     spotifyService
        //   );
        break;
    }

    return NextResponse.json(recommendations);
  } catch (error: any) {
    console.error("Erro ao gerar recomendações:", error);

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

async function handleColorRecommendation(
  userId: string,
  params: any,
  spotifyService: SpotifyService
) {
  const command = new ColorRecommendationCommand({
    userId,
    hexColor: params.hexColor,
    targetSize: params.targetSize,
    includePopular: params.includePopular,
  });

  const targets = COLOR_MAPPINGS[command.hexColor.toUpperCase()];
  if (!targets) {
    throw new Error("Cor não suportada");
  }

  const tracks = await spotifyService.searchTracksByFeatures(
    targets,
    command.targetSize * 2
  );
  const scoredTracks = tracks.map((track) => ({
    track,
    score: RecommendationEngine.calculateCompatibilityScore(track, targets),
  }));

  const sortedTracks = scoredTracks
    .sort((a, b) => b.score - a.score)
    .slice(0, command.targetSize)
    .map((item) => item.track);

  return {
    tracks: sortedTracks,
    interpretation: {
      originalInput: command.hexColor,
      audioFeatureTargets: targets,
      confidence: calculateAverageScore(scoredTracks),
    },
  };
}

function calculateAverageScore(
  scoredTracks: Array<{ track: any; score: number }>
): number {
  if (scoredTracks.length === 0) return 0;
  return (
    scoredTracks.reduce((sum, item) => sum + item.score, 0) /
    scoredTracks.length
  );
}
