import { SpotifyService } from "@/lib/application/services/SpotifyService";
import { EmotionType } from "@/lib/domain/entities/Emotion";
import { Playlist } from "@/lib/domain/entities/Playlist";
import { Track } from "@/lib/domain/entities/Track";
import { RecommendationEngine } from "@/lib/domain/services/RecommendationEngine";
import connectToDatabase from "@/lib/infrastructure/database/connection";
import { ClaudeAPI } from "@/lib/infrastructure/external/ClaudeAPI";
import {
  Playlist as PlaylistModel,
  User as UserModel,
} from "@/lib/infrastructure/models";
import { AudioFeatureTargets, PlaylistDTO } from "@/lib/types/common";
import {
  COLOR_MAPPINGS,
  COORDINATE_MAPPING,
  EMOJI_MAPPINGS,
  EMOTION_MAPPINGS,
} from "@/lib/utils/mappings";
import mongoose from "mongoose";
import { GeneratePlaylistCommand } from "../../dtos/Command";

export class GeneratePlaylistUC {
  constructor(
    private spotifyService: SpotifyService,
    private claudeAPI: ClaudeAPI
  ) {}

  async execute(command: GeneratePlaylistCommand): Promise<PlaylistDTO> {
    try {
      // 1. Interpretar mood input para audio features
      const audioFeatureTargets = await this.interpretMoodInput(
        command.moodInput
      );

      // 2. Buscar tracks com base nos targets
      const candidateTracks = await this.searchTracks(
        audioFeatureTargets,
        command.targetSize * 3
      );

      // 3. Calcular scores de compatibilidade
      const tracksWithScores = candidateTracks.map((track) => ({
        track,
        score: RecommendationEngine.calculateCompatibilityScore(
          track,
          audioFeatureTargets
        ),
      }));

      // 4. Ordenar por score
      const sortedTracks = tracksWithScores
        .sort((a, b) => b.score - a.score)
        .map((item) => item.track);

      // 5. Diversificar playlist
      const finalTracks = RecommendationEngine.diversifyPlaylist(
        sortedTracks,
        command.targetSize
      );

      if (finalTracks.length === 0) {
        throw new Error(
          "Não foi possível encontrar músicas compatíveis com seu mood"
        );
      }

      // 6. Gerar nome e descrição da playlist
      const playlistName =
        command.playlistName || this.generatePlaylistName(command.moodInput);
      const playlistDescription =
        command.playlistDescription ||
        (await this.generatePlaylistDescription(
          command.moodInput,
          finalTracks
        ));

      // 7. Criar playlist
      const playlist = new Playlist(
        new mongoose.Types.ObjectId().toString(),
        playlistName,
        playlistDescription,
        finalTracks,
        command.userId,
        command.moodInput,
        new Date(),
        new Date()
      );

      // 8. Salvar no banco
      const savedPlaylist = await this.savePlaylist(
        playlist,
        audioFeatureTargets
      );

      // 9. Salvar no Spotify se solicitado
      if (command.saveToSpotify) {
        try {
          const spotifyPlaylistId = await this.createSpotifyPlaylist(
            command.userId,
            playlistName,
            playlistDescription,
            finalTracks
          );
          savedPlaylist.spotifyPlaylistId = spotifyPlaylistId;
        } catch (error) {
          console.error("Erro ao salvar playlist no Spotify:", error);
          // Continuar mesmo se não conseguir salvar no Spotify
        }
      }

      return this.mapPlaylistToDTO(savedPlaylist);
    } catch (error) {
      console.error("Erro ao gerar playlist:", error);
      throw new Error(`Erro ao gerar playlist`);
    }
  }

  private async interpretMoodInput(
    moodInput: any
  ): Promise<AudioFeatureTargets> {
    switch (moodInput.type) {
      case "color":
        return this.interpretColorMood(moodInput.value);

      case "emoji":
        return this.interpretEmojiMood(moodInput.value);

      case "emotion":
        return await this.interpretEmotionMood(moodInput.value);

      case "coordinate":
        return this.interpretCoordinateMood(moodInput.value);

      default:
        throw new Error("Tipo de mood não suportado");
    }
  }

  private interpretColorMood(hexColor: string): AudioFeatureTargets {
    const mapping = COLOR_MAPPINGS[hexColor.toUpperCase()];
    if (mapping) {
      return mapping;
    }

    // Fallback: análise básica da cor
    const rgb = this.hexToRgb(hexColor);
    if (!rgb) {
      throw new Error("Cor inválida");
    }

    const { r, g, b } = rgb;
    const brightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
    const saturation = this.getSaturation(r, g, b);

    return {
      energy: { min: 0.3, max: 0.9, target: brightness },
      valence: { min: 0.2, max: 0.8, target: saturation },
      danceability: {
        min: 0.4,
        max: 0.9,
        target: (brightness + saturation) / 2,
      },
    };
  }

  private interpretEmojiMood(emoji: string): AudioFeatureTargets {
    const mapping = EMOJI_MAPPINGS[emoji];
    if (mapping) {
      return mapping;
    }

    // Fallback: interpretação básica
    return {
      energy: { min: 0.3, max: 0.7, target: 0.5 },
      valence: { min: 0.4, max: 0.8, target: 0.6 },
      danceability: { min: 0.4, max: 0.8, target: 0.6 },
    };
  }

  private async interpretEmotionMood(
    emotionalInput: string
  ): Promise<AudioFeatureTargets> {
    try {
      // Usar Claude para interpretação avançada
      return await this.claudeAPI.interpretEmotionalInput(emotionalInput);
    } catch (error) {
      console.error("Erro ao interpretar com Claude, usando fallback:", error);

      // Fallback: interpretação básica
      const emotion = this.detectBasicEmotion(emotionalInput);
      return (
        EMOTION_MAPPINGS[emotion] || {
          energy: { min: 0.3, max: 0.7, target: 0.5 },
          valence: { min: 0.4, max: 0.8, target: 0.6 },
        }
      );
    }
  }

  private interpretCoordinateMood(coordinates: {
    x: number;
    y: number;
  }): AudioFeatureTargets {
    return COORDINATE_MAPPING.mapCoordinateToAudioFeatures(
      coordinates.x,
      coordinates.y
    );
  }

  private async searchTracks(
    targets: AudioFeatureTargets,
    limit: number
  ): Promise<Track[]> {
    try {
      // Buscar tracks usando as características de áudio
      const tracks = await this.spotifyService.searchTracksByFeatures(
        targets,
        limit
      );

      if (tracks.length === 0) {
        // Fallback: buscar tracks populares e filtrar
        const popularTracks = await this.spotifyService.getTopTracks();
        return popularTracks.slice(0, Math.min(limit, popularTracks.length));
      }

      return tracks;
    } catch (error) {
      console.error("Erro ao buscar tracks:", error);
      throw new Error("Não foi possível encontrar músicas compatíveis");
    }
  }

  private generatePlaylistName(moodInput: any): string {
    const timestamp = new Date().toLocaleDateString("pt-BR");

    switch (moodInput.type) {
      case "color":
        return `Mood Color ${timestamp}`;
      case "emoji":
        return `${moodInput.value} Vibes - ${timestamp}`;
      case "emotion":
        return `${moodInput.value} - ${timestamp}`;
      case "coordinate":
        return `Custom Mood - ${timestamp}`;
      default:
        return `AI Playlist - ${timestamp}`;
    }
  }

  private async generatePlaylistDescription(
    moodInput: any,
    tracks: Track[]
  ): Promise<string> {
    try {
      const inputText =
        moodInput.type === "emotion"
          ? moodInput.value
          : `${moodInput.type}: ${moodInput.value}`;
      const trackData = tracks.slice(0, 10).map((track) => ({
        name: track.name,
        artists: track.artists,
      }));

      return await this.claudeAPI.generatePlaylistDescription(
        inputText,
        trackData
      );
    } catch (error) {
      console.error("Erro ao gerar descrição:", error);
      return `Playlist criada com IA baseada no seu mood: ${moodInput.value}`;
    }
  }

  private async savePlaylist(
    playlist: Playlist,
    audioFeatureTargets: AudioFeatureTargets
  ): Promise<Playlist> {
    try {
      await connectToDatabase();

      const playlistDoc = new PlaylistModel({
        name: playlist.name,
        description: playlist.description,
        userId: new mongoose.Types.ObjectId(playlist.userId),
        moodInput: playlist.moodInput,
        tracks: playlist.tracks.map((track) => ({
          trackId: new mongoose.Types.ObjectId(), // Placeholder - seria o ID do track no banco
          addedAt: new Date(),
        })),
        audioFeatureTargets:
          this.formatAudioFeatureTargets(audioFeatureTargets),
        createdAt: playlist.createdAt,
        updatedAt: playlist.updatedAt,
      });

      await playlistDoc.save();
      return playlist;
    } catch (error) {
      console.error("Erro ao salvar playlist:", error);
      throw new Error("Erro ao salvar playlist no banco de dados");
    }
  }

  private async createSpotifyPlaylist(
    userId: string,
    name: string,
    description: string,
    tracks: Track[]
  ): Promise<string> {
    try {
      await connectToDatabase();
      const user = await UserModel.findById(userId);

      if (!user) {
        throw new Error("Usuário não encontrado");
      }

      // Verificar se o token está válido
      if (user.tokenExpiresAt < Date.now()) {
        const newToken = await SpotifyService.refreshUserToken(userId);
        this.spotifyService = new SpotifyService(newToken);
      }

      const playlistId = await this.spotifyService.createPlaylist(
        user.spotifyId,
        name,
        description
      );
      await this.spotifyService.addTracksToPlaylist(playlistId, tracks);

      return playlistId;
    } catch (error) {
      console.error("Erro ao criar playlist no Spotify:", error);
      throw error;
    }
  }

  private mapPlaylistToDTO(playlist: Playlist): any {
    return {
      id: playlist.id,
      name: playlist.name,
      description: playlist.description,
      tracks: playlist.tracks.map((track) => ({
        id: track.id,
        name: track.name,
        artists: track.artists,
        album: track.album,
        audioFeatures: {
          danceability: track.audioFeatures.danceability,
          energy: track.audioFeatures.energy,
          valence: track.audioFeatures.valence,
          acousticness: track.audioFeatures.acousticness,
          instrumentalness: track.audioFeatures.instrumentalness,
          speechiness: track.audioFeatures.speechiness,
          tempo: track.audioFeatures.tempo,
          loudness: track.audioFeatures.loudness,
        },
        previewUrl: track.previewUrl,
        spotifyUri: track.spotifyUri,
        albumImage: track.albumImage,
        durationMs: track.durationMs,
        popularity: track.popularity,
      })),
      userId: playlist.userId,
      createdAt: playlist.createdAt.toISOString(),
      updatedAt: playlist.updatedAt.toISOString(),
      spotifyPlaylistId: playlist.spotifyPlaylistId,
      moodInput: playlist.moodInput,
    };
  }

  private formatAudioFeatureTargets(targets: AudioFeatureTargets): any {
    const formatted: any = {};

    Object.entries(targets).forEach(([key, value]) => {
      if (value) {
        formatted[key] = {
          min: value.min,
          max: value.max,
          target: value.target,
        };
      }
    });

    return formatted;
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  }

  private getSaturation(r: number, g: number, b: number): number {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    return max === 0 ? 0 : (max - min) / max;
  }

  private detectBasicEmotion(text: string): EmotionType {
    const lowerText = text.toLowerCase();

    const emotionKeywords = {
      [EmotionType.HAPPY]: [
        "feliz",
        "alegre",
        "animado",
        "contente",
        "eufórico",
      ],
      [EmotionType.SAD]: ["triste", "melancólico", "deprimido", "solitário"],
      [EmotionType.ENERGETIC]: [
        "energia",
        "agitado",
        "intenso",
        "ativo",
        "vibrante",
      ],
      [EmotionType.CALM]: ["calmo", "relaxado", "paz", "tranquilo", "sereno"],
      [EmotionType.ROMANTIC]: [
        "amor",
        "romântico",
        "paixão",
        "carinho",
        "íntimo",
      ],
      [EmotionType.FOCUSED]: [
        "foco",
        "concentração",
        "trabalho",
        "estudo",
        "produtivo",
      ],
    };

    let maxMatches = 0;
    let detectedEmotion = EmotionType.CALM;

    Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
      const matches = keywords.filter((keyword) =>
        lowerText.includes(keyword)
      ).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        detectedEmotion = emotion as EmotionType;
      }
    });

    return detectedEmotion;
  }
}
