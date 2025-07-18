export interface AudioFeatureTargets {
  danceability?: { min: number; max: number; target?: number };
  energy?: { min: number; max: number; target?: number };
  valence?: { min: number; max: number; target?: number };
  acousticness?: { min: number; max: number; target?: number };
  instrumentalness?: { min: number; max: number; target?: number };
  speechiness?: { min: number; max: number; target?: number };
  tempo?: { min: number; max: number; target?: number };
  loudness?: { min: number; max: number; target?: number };
}

export interface MoodInput {
  type: "color" | "emoji" | "emotion" | "coordinate";
  value: string | { x: number; y: number };
}

export interface AudioFeatureMapping {
  feature: keyof AudioFeatureTargets;
  weight: number;
}

export interface RecommendationResultDTO {
  tracks: TrackDTO[];
  interpretation: {
    originalInput: string;
    audioFeatureTargets: AudioFeatureTargets;
    confidence: number;
  };
  metadata: {
    totalCandidates: number;
    averageScore: number;
  };
}

export interface TrackDTO {
  id: string;
  name: string;
  artists: string[];
  album: string;
  audioFeatures: AudioFeaturesDTO;
  previewUrl?: string;
  spotifyUri?: string;
  albumImage?: string;
  durationMs: number;
  popularity: number;
}

export interface AudioFeaturesDTO {
  danceability: number;
  energy: number;
  valence: number;
  acousticness: number;
  instrumentalness: number;
  speechiness: number;
  tempo: number;
  loudness: number;
}

export interface PlaylistDTO {
  id: string;
  name: string;
  description: string;
  tracks: TrackDTO[];
  userId: string;
  createdAt: string;
  updatedAt: string;
  spotifyPlaylistId?: string;
  moodInput: MoodInput;
}

export interface UserDTO {
  id: string;
  displayName: string;
  email: string;
  spotifyId: string;
  profileImage?: string;
  accessToken: string;
  refreshToken: string;
  tokenExpiresAt: number;
}
