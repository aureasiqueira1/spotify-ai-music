export class MoodMapping {
  constructor(
    public input: MoodInput,
    public audioFeatureTargets: AudioFeatureTargets,
    public description: string
  ) {}
}

export interface MoodInput {
  type: "color" | "emoji" | "emotion" | "coordinate";
  value: string | { x: number; y: number };
}

export interface AudioFeatureTargets {
  danceability?: { min: number; max: number; target?: number };
  energy?: { min: number; max: number; target?: number };
  valence?: { min: number; max: number; target?: number };
  acousticness?: { min: number; max: number; target?: number };
  instrumentalness?: { min: number; max: number; target?: number };
  tempo?: { min: number; max: number; target?: number };
}
