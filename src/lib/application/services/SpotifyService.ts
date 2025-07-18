import { Track } from "@/lib/domain/entities/Track";
import { User } from "@/lib/domain/entities/User";
import connectToDatabase from "@/lib/infrastructure/database/connection";
import { SpotifyAPI } from "@/lib/infrastructure/external/SpotifyAPI";
import {
  Track as TrackModel,
  User as UserModel,
} from "@/lib/infrastructure/models";
import { AudioFeatureTargets } from "@/lib/types/common";

export class SpotifyService {
  private spotifyAPI: SpotifyAPI;

  constructor(accessToken: string) {
    this.spotifyAPI = new SpotifyAPI(accessToken);
  }

  async getCurrentUser(): Promise<User> {
    try {
      const spotifyUser = await this.spotifyAPI.getCurrentUser();
      return User.fromSpotifyUser(spotifyUser, {
        access_token: this.spotifyAPI["accessToken"],
      });
    } catch (error: any) {
      if (error.message === "UNAUTHORIZED") {
        throw new Error("Token expirado ou inválido");
      }
      throw error;
    }
  }

  async searchTracksByFeatures(
    targets: AudioFeatureTargets,
    limit: number = 100,
    additionalQuery?: string
  ): Promise<Track[]> {
    try {
      // Construir parâmetros para recomendações
      const recommendationParams: any = {
        limit: Math.min(limit, 100),
        market: "US",
      };

      // Mapear targets para parâmetros do Spotify
      Object.entries(targets).forEach(([feature, range]) => {
        if (range) {
          if (range.min !== undefined) {
            recommendationParams[`min_${feature}`] = range.min;
          }
          if (range.max !== undefined) {
            recommendationParams[`max_${feature}`] = range.max;
          }
          if (range.target !== undefined) {
            recommendationParams[`target_${feature}`] = range.target;
          }
        }
      });

      // Adicionar sementes (gêneros populares)
      const genres = ["pop", "rock", "hip-hop", "electronic", "indie"];
      recommendationParams.seed_genres = genres.slice(0, 2);

      // Buscar recomendações
      const recommendations = await this.spotifyAPI.getRecommendations(
        recommendationParams
      );
      const tracks = recommendations.tracks;

      if (tracks.length === 0) {
        throw new Error(
          "Nenhuma música encontrada com os critérios especificados"
        );
      }

      // Buscar audio features para todos os tracks
      const trackIds = tracks.map((track) => track.id);
      const audioFeaturesResponse = await this.spotifyAPI.getAudioFeatures(
        trackIds
      );
      const audioFeatures = audioFeaturesResponse.audio_features;

      // Combinar tracks com audio features
      const tracksWithFeatures = tracks
        .map((track, index) => {
          const features = audioFeatures[index];
          if (!features) return null;

          return Track.fromSpotifyTrack(track, features);
        })
        .filter((track) => track !== null) as Track[];

      // Salvar tracks no banco para cache
      await this.saveTracksToDatabase(tracksWithFeatures);

      return tracksWithFeatures;
    } catch (error: any) {
      console.error("Erro ao buscar tracks por features:", error);
      throw new Error(`Erro ao buscar músicas: ${error.message}`);
    }
  }

  async searchTracksByText(
    query: string,
    limit: number = 50
  ): Promise<Track[]> {
    try {
      const searchResponse = await this.spotifyAPI.searchTracks(query, limit);
      const tracks = searchResponse.tracks.items;

      if (tracks.length === 0) {
        return [];
      }

      // Buscar audio features
      const trackIds = tracks.map((track) => track.id);
      const audioFeaturesResponse = await this.spotifyAPI.getAudioFeatures(
        trackIds
      );
      const audioFeatures = audioFeaturesResponse.audio_features;

      // Combinar dados
      const tracksWithFeatures = tracks
        .map((track, index) => {
          const features = audioFeatures[index];
          if (!features) return null;

          return Track.fromSpotifyTrack(track, features);
        })
        .filter((track) => track !== null) as Track[];

      await this.saveTracksToDatabase(tracksWithFeatures);

      return tracksWithFeatures;
    } catch (error: any) {
      console.error("Erro ao buscar tracks por texto:", error);
      throw new Error(`Erro ao buscar músicas: ${error.message}`);
    }
  }

  async getTopTracks(
    timeRange: "short_term" | "medium_term" | "long_term" = "medium_term"
  ): Promise<Track[]> {
    try {
      const topTracksResponse = await this.spotifyAPI.getTopTracks(
        timeRange,
        50
      );
      const tracks = topTracksResponse.items;

      if (tracks.length === 0) {
        return [];
      }

      // Buscar audio features
      const trackIds = tracks.map((track) => track.id);
      const audioFeaturesResponse = await this.spotifyAPI.getAudioFeatures(
        trackIds
      );
      const audioFeatures = audioFeaturesResponse.audio_features;

      // Combinar dados
      const tracksWithFeatures = tracks
        .map((track, index) => {
          const features = audioFeatures[index];
          if (!features) return null;

          return Track.fromSpotifyTrack(track, features);
        })
        .filter((track) => track !== null) as Track[];

      await this.saveTracksToDatabase(tracksWithFeatures);

      return tracksWithFeatures;
    } catch (error: any) {
      console.error("Erro ao buscar top tracks:", error);
      throw new Error(
        `Erro ao buscar suas músicas favoritas: ${error.message}`
      );
    }
  }

  async createPlaylist(
    userId: string,
    name: string,
    description: string
  ): Promise<string> {
    try {
      const playlist = await this.spotifyAPI.createPlaylist(
        userId,
        name,
        description
      );
      return playlist.id;
    } catch (error: any) {
      console.error("Erro ao criar playlist:", error);
      throw new Error(`Erro ao criar playlist: ${error.message}`);
    }
  }

  async addTracksToPlaylist(
    playlistId: string,
    tracks: Track[]
  ): Promise<void> {
    try {
      const trackUris = tracks
        .filter((track) => track.spotifyUri)
        .map((track) => track.spotifyUri!);

      if (trackUris.length === 0) {
        throw new Error("Nenhuma música válida para adicionar à playlist");
      }

      // Spotify permite até 100 tracks por requisição
      const batchSize = 100;
      for (let i = 0; i < trackUris.length; i += batchSize) {
        const batch = trackUris.slice(i, i + batchSize);
        await this.spotifyAPI.addTracksToPlaylist(playlistId, batch);
      }
    } catch (error: any) {
      console.error("Erro ao adicionar tracks à playlist:", error);
      throw new Error(`Erro ao adicionar músicas à playlist: ${error.message}`);
    }
  }

  async getUserPlaylists(): Promise<any[]> {
    try {
      const playlistsResponse = await this.spotifyAPI.getUserPlaylists();
      return playlistsResponse.items;
    } catch (error: any) {
      console.error("Erro ao buscar playlists do usuário:", error);
      throw new Error(`Erro ao buscar suas playlists: ${error.message}`);
    }
  }

  async getAdvancedRecommendations(
    targets: AudioFeatureTargets,
    options: {
      seedGenres?: string[];
      seedArtists?: string[];
      seedTracks?: string[];
      limit?: number;
      market?: string;
    } = {}
  ): Promise<Track[]> {
    try {
      const {
        seedGenres,
        seedArtists,
        seedTracks,
        limit = 50,
        market = "US",
      } = options;

      // Preparar parâmetros
      const params: any = {
        limit: Math.min(limit, 100),
        market,
      };

      // Adicionar sementes
      if (seedGenres?.length) params.seed_genres = seedGenres.slice(0, 2);
      if (seedArtists?.length) params.seed_artists = seedArtists.slice(0, 2);
      if (seedTracks?.length) params.seed_tracks = seedTracks.slice(0, 2);

      // Se não tiver sementes, usar gêneros populares
      if (!seedGenres && !seedArtists && !seedTracks) {
        params.seed_genres = ["pop", "rock"];
      }

      // Mapear targets
      Object.entries(targets).forEach(([feature, range]) => {
        if (range) {
          if (range.min !== undefined) params[`min_${feature}`] = range.min;
          if (range.max !== undefined) params[`max_${feature}`] = range.max;
          if (range.target !== undefined)
            params[`target_${feature}`] = range.target;
        }
      });

      // Buscar recomendações
      const recommendations = await this.spotifyAPI.getRecommendations(params);
      const tracks = recommendations.tracks;

      if (tracks.length === 0) {
        // Tentar busca mais ampla se não encontrar nada
        const relaxedParams = { ...params };
        Object.keys(relaxedParams).forEach((key) => {
          if (key.startsWith("min_") || key.startsWith("max_")) {
            delete relaxedParams[key];
          }
        });

        const relaxedRecommendations = await this.spotifyAPI.getRecommendations(
          relaxedParams
        );
        const relaxedTracks = relaxedRecommendations.tracks;

        if (relaxedTracks.length === 0) {
          throw new Error("Nenhuma música encontrada");
        }

        return this.processTrackResults(relaxedTracks);
      }

      return this.processTrackResults(tracks);
    } catch (error: any) {
      console.error("Erro ao buscar recomendações avançadas:", error);
      throw new Error(`Erro ao buscar recomendações: ${error.message}`);
    }
  }

  private async processTrackResults(tracks: any[]): Promise<Track[]> {
    // Buscar audio features
    const trackIds = tracks.map((track) => track.id);
    const audioFeaturesResponse = await this.spotifyAPI.getAudioFeatures(
      trackIds
    );
    const audioFeatures = audioFeaturesResponse.audio_features;

    // Combinar dados
    const tracksWithFeatures = tracks
      .map((track, index) => {
        const features = audioFeatures[index];
        if (!features) return null;

        return Track.fromSpotifyTrack(track, features);
      })
      .filter((track) => track !== null) as Track[];

    await this.saveTracksToDatabase(tracksWithFeatures);

    return tracksWithFeatures;
  }

  private async saveTracksToDatabase(tracks: Track[]): Promise<void> {
    try {
      await connectToDatabase();

      const bulkOps = tracks.map((track) => ({
        updateOne: {
          filter: { spotifyId: track.id },
          update: {
            $set: {
              spotifyId: track.id,
              name: track.name,
              artists: track.artists,
              album: track.album,
              durationMs: track.durationMs,
              popularity: track.popularity,
              previewUrl: track.previewUrl,
              spotifyUri: track.spotifyUri,
              albumImage: track.albumImage,
              audioFeatures: {
                danceability: track.audioFeatures.danceability,
                energy: track.audioFeatures.energy,
                valence: track.audioFeatures.valence,
                acousticness: track.audioFeatures.acousticness,
                instrumentalness: track.audioFeatures.instrumentalness,
                speechiness: track.audioFeatures.speechiness,
                tempo: track.audioFeatures.tempo,
                loudness: track.audioFeatures.loudness,
                key: track.audioFeatures.key,
                mode: track.audioFeatures.mode,
                timeSignature: track.audioFeatures.timeSignature,
              },
              updatedAt: new Date(),
            },
          },
          upsert: true,
        },
      }));

      if (bulkOps.length > 0) {
        await TrackModel.bulkWrite(bulkOps);
      }
    } catch (error: any) {
      console.error("Erro ao salvar tracks no banco:", error);
      // Não falhar se não conseguir salvar no cache
    }
  }

  static async refreshUserToken(userId: string): Promise<string> {
    try {
      await connectToDatabase();
      const user = await UserModel.findById(userId);

      if (!user) {
        throw new Error("Usuário não encontrado");
      }

      const tokenResponse = await SpotifyAPI.refreshToken(user.refreshToken);

      // Atualizar tokens no banco
      user.accessToken = tokenResponse.access_token;
      user.tokenExpiresAt = Date.now() + tokenResponse.expires_in * 1000;
      if (tokenResponse.refresh_token) {
        user.refreshToken = tokenResponse.refresh_token;
      }
      user.updatedAt = new Date();

      await user.save();

      return tokenResponse.access_token;
    } catch (error: any) {
      console.error("Erro ao atualizar token:", error);
      throw new Error(`Erro ao atualizar token: ${error.message}`);
    }
  }
}
