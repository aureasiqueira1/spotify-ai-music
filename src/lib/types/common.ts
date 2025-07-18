// lib/types/common.ts
export interface PlaylistDTO {
  id: string;
  name: string;
  description: string;
  tracks: SpotifyTrack[];
  moodData?: {
    type: "color" | "emoji" | "emotion" | "coordinate";
    value: any;
  };
  createdAt: string;
  spotifyUrl?: string;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: string[];
  album: string;
  preview_url: string | null;
  external_urls?: {
    spotify: string;
  };
  duration_ms?: number;
  popularity?: number;
}

export interface AudioFeatureTargets {
  acousticness?: number;
  danceability?: number;
  energy?: number;
  instrumentalness?: number;
  liveness?: number;
  loudness?: number;
  speechiness?: number;
  tempo?: number;
  valence?: number;
}

export interface MoodInput {
  type: "color" | "emoji" | "emotion" | "coordinate";
  value: string | string[] | { x: number; y: number };
}
