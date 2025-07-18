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
  spotifyUrl: string;
  artists: string[];
  album: string;
  audioFeatures: {
    danceability: number;
    energy: number;
    valence: number;
    acousticness: number;
    instrumentalness: number;
    speechiness: number;
    tempo: number;
    loudness: number;
  };
  previewUrl: string;
  spotifyUri: string;
  albumImage: string;
  durationMs: number;
  popularity: number;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: string[];
  album: string;
  external_urls?: {
    spotify: string;
  };
  duration_ms?: number;
  audioFeatures: {
    danceability: number;
    energy: number;
    valence: number;
    acousticness: number;
    instrumentalness: number;
    speechiness: number;
    tempo: number;
    loudness: number;
  };
  previewUrl: string;
  spotifyUri: string;
  albumImage: string;
  durationMs: number;
  popularity: number;
}

export interface AudioFeatureTargets {
  danceability?: {
    min: number;
    max: number;
    target: number;
  };
  energy?: {
    min: number;
    max: number;
    target: number;
  };
  acousticness?: {
    min: number;
    max: number;
    target: number;
  };
  instrumentalness?: {
    min: number;
    max: number;
    target: number;
  };
  liveness?: {
    min: number;
    max: number;
    target: number;
  };
  loudness?: {
    min: number;
    max: number;
    target: number;
  };
  speechiness?: {
    min: number;
    max: number;
    target: number;
  };
  tempo?: {
    min: number;
    max: number;
    target: number;
  };
  valence?: {
    min: number;
    max: number;
    target: number;
  };
}

export interface MoodInput {
  type: "color" | "emoji" | "emotion" | "coordinate";
  value: string | string[] | { x: number; y: number };
}
