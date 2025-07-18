import {
  SpotifyAudioFeatures,
  SpotifyPlaylist,
  SpotifyRecommendationSeed,
  SpotifySearchResponse,
  SpotifyTokenResponse,
  SpotifyTrack,
  SpotifyUser,
} from "@/lib/types/spotify";

export class SpotifyAPI {
  private baseURL = "https://api.spotify.com/v1";
  private accountsURL = "https://accounts.spotify.com";

  constructor(private accessToken: string) {}

  // Auth methods
  static getAuthURL(): string {
    const scopes = [
      "user-read-private",
      "user-read-email",
      "playlist-read-private",
      "playlist-modify-public",
      "playlist-modify-private",
      "user-library-read",
      "user-top-read",
    ].join(" ");

    const params = new URLSearchParams({
      response_type: "code",
      client_id: process.env.SPOTIFY_CLIENT_ID!,
      scope: scopes,
      redirect_uri: process.env.SPOTIFY_REDIRECT_URI!,
      show_dialog: "true",
    });

    return `https://accounts.spotify.com/authorize?${params.toString()}`;
  }

  static async exchangeCodeForToken(
    code: string
  ): Promise<SpotifyTokenResponse> {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI!,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to exchange code for token: ${response.statusText}`
      );
    }

    return await response.json();
  }

  static async refreshToken(
    refreshToken: string
  ): Promise<SpotifyTokenResponse> {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to refresh token: ${response.statusText}`);
    }

    return await response.json();
  }

  // User methods
  async getCurrentUser(): Promise<SpotifyUser> {
    return this.makeRequest<SpotifyUser>("/me");
  }

  // Search methods
  async searchTracks(
    query: string,
    limit: number = 50
  ): Promise<SpotifySearchResponse> {
    const params = new URLSearchParams({
      q: query,
      type: "track",
      limit: limit.toString(),
      market: "US",
    });

    return this.makeRequest<SpotifySearchResponse>(
      `/search?${params.toString()}`
    );
  }

  // Recommendations
  async getRecommendations(
    params: SpotifyRecommendationSeed
  ): Promise<{ tracks: SpotifyTrack[] }> {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          searchParams.append(key, value.join(","));
        } else {
          searchParams.append(key, value.toString());
        }
      }
    });

    return this.makeRequest<{ tracks: SpotifyTrack[] }>(
      `/recommendations?${searchParams.toString()}`
    );
  }

  // Audio Features
  async getAudioFeatures(
    trackIds: string[]
  ): Promise<{ audio_features: SpotifyAudioFeatures[] }> {
    const ids = trackIds.join(",");
    return this.makeRequest<{ audio_features: SpotifyAudioFeatures[] }>(
      `/audio-features?ids=${ids}`
    );
  }

  async getAudioFeaturesForTrack(
    trackId: string
  ): Promise<SpotifyAudioFeatures> {
    return this.makeRequest<SpotifyAudioFeatures>(`/audio-features/${trackId}`);
  }

  // Playlists
  async getUserPlaylists(
    limit: number = 50
  ): Promise<{ items: SpotifyPlaylist[] }> {
    const params = new URLSearchParams({
      limit: limit.toString(),
    });

    return this.makeRequest<{ items: SpotifyPlaylist[] }>(
      `/me/playlists?${params.toString()}`
    );
  }

  async createPlaylist(
    userId: string,
    name: string,
    description?: string
  ): Promise<SpotifyPlaylist> {
    return this.makeRequest<SpotifyPlaylist>(`/users/${userId}/playlists`, {
      method: "POST",
      body: JSON.stringify({
        name,
        description: description || "",
        public: false,
      }),
    });
  }

  async addTracksToPlaylist(
    playlistId: string,
    trackUris: string[]
  ): Promise<{ snapshot_id: string }> {
    return this.makeRequest<{ snapshot_id: string }>(
      `/playlists/${playlistId}/tracks`,
      {
        method: "POST",
        body: JSON.stringify({
          uris: trackUris,
        }),
      }
    );
  }

  // Top tracks and artists
  async getTopTracks(
    timeRange: "short_term" | "medium_term" | "long_term" = "medium_term",
    limit: number = 50
  ): Promise<{ items: SpotifyTrack[] }> {
    const params = new URLSearchParams({
      time_range: timeRange,
      limit: limit.toString(),
    });

    return this.makeRequest<{ items: SpotifyTrack[] }>(
      `/me/top/tracks?${params.toString()}`
    );
  }

  async getTopArtists(
    timeRange: "short_term" | "medium_term" | "long_term" = "medium_term",
    limit: number = 50
  ): Promise<{ items: any[] }> {
    const params = new URLSearchParams({
      time_range: timeRange,
      limit: limit.toString(),
    });

    return this.makeRequest<{ items: any[] }>(
      `/me/top/artists?${params.toString()}`
    );
  }

  // Generic request method
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      Authorization: `Bearer ${this.accessToken}`,
      "Content-Type": "application/json",
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("UNAUTHORIZED");
      }
      throw new Error(
        `Spotify API Error: ${response.status} - ${response.statusText}`
      );
    }

    return await response.json();
  }

  // Helper methods for complex searches
  async searchByGenreAndFeatures(
    genre: string,
    audioFeatures: Partial<SpotifyRecommendationSeed>,
    limit: number = 50
  ): Promise<{ tracks: SpotifyTrack[] }> {
    const params: SpotifyRecommendationSeed = {
      seed_genres: [genre],
      limit,
      market: "US",
      ...audioFeatures,
    };

    return this.getRecommendations(params);
  }

  async searchByArtistAndFeatures(
    artistId: string,
    audioFeatures: Partial<SpotifyRecommendationSeed>,
    limit: number = 50
  ): Promise<{ tracks: SpotifyTrack[] }> {
    const params: SpotifyRecommendationSeed = {
      seed_artists: [artistId],
      limit,
      market: "US",
      ...audioFeatures,
    };

    return this.getRecommendations(params);
  }

  async getDetailedTrackInfo(trackId: string): Promise<{
    track: SpotifyTrack;
    audioFeatures: SpotifyAudioFeatures;
  }> {
    const [trackResponse, audioFeaturesResponse] = await Promise.all([
      this.makeRequest<SpotifyTrack>(`/tracks/${trackId}`),
      this.getAudioFeaturesForTrack(trackId),
    ]);

    return {
      track: trackResponse,
      audioFeatures: audioFeaturesResponse,
    };
  }

  // Advanced search with multiple criteria
  async advancedSearch(params: {
    query?: string;
    genres?: string[];
    artists?: string[];
    tracks?: string[];
    audioFeatures?: Partial<SpotifyRecommendationSeed>;
    limit?: number;
  }): Promise<{ tracks: SpotifyTrack[] }> {
    const {
      query,
      genres,
      artists,
      tracks,
      audioFeatures,
      limit = 50,
    } = params;

    if (query) {
      // Use search endpoint for text queries
      const searchResponse = await this.searchTracks(query, limit);
      return { tracks: searchResponse.tracks.items };
    } else if (genres || artists || tracks || audioFeatures) {
      // Use recommendations endpoint for feature-based search
      const recommendationParams: SpotifyRecommendationSeed = {
        seed_genres: genres,
        seed_artists: artists,
        seed_tracks: tracks,
        limit,
        market: "US",
        ...audioFeatures,
      };

      return this.getRecommendations(recommendationParams);
    } else {
      throw new Error("Must provide at least one search criteria");
    }
  }
}
