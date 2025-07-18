import { EmotionType } from "@/lib/domain/entities/Emotion";
import { AudioFeatureTargets } from "@/lib/types/common";

export const COLOR_MAPPINGS: Record<string, AudioFeatureTargets> = {
  "#FF0000": {
    // Vermelho - Energia alta, valência alta
    energy: { min: 0.7, max: 1.0, target: 0.85 },
    valence: { min: 0.6, max: 1.0, target: 0.8 },
    danceability: { min: 0.5, max: 1.0, target: 0.7 },
    tempo: { min: 120, max: 180, target: 150 },
  },
  "#0000FF": {
    // Azul - Calmo, introspectivo
    energy: { min: 0.0, max: 0.4, target: 0.2 },
    valence: { min: 0.0, max: 0.5, target: 0.3 },
    acousticness: { min: 0.4, max: 1.0, target: 0.7 },
    tempo: { min: 60, max: 120, target: 90 },
  },
  "#FFFF00": {
    // Amarelo - Dançante, alegre
    danceability: { min: 0.7, max: 1.0, target: 0.9 },
    valence: { min: 0.7, max: 1.0, target: 0.85 },
    energy: { min: 0.6, max: 0.9, target: 0.75 },
    tempo: { min: 110, max: 160, target: 135 },
  },
  "#800080": {
    // Roxo - Misterioso, eletrônico
    energy: { min: 0.5, max: 0.8, target: 0.65 },
    instrumentalness: { min: 0.3, max: 0.8, target: 0.6 },
    valence: { min: 0.3, max: 0.7, target: 0.5 },
    acousticness: { min: 0.0, max: 0.4, target: 0.2 },
  },
  "#FFA500": {
    // Laranja - Energético, quente
    energy: { min: 0.6, max: 0.9, target: 0.75 },
    valence: { min: 0.5, max: 0.8, target: 0.7 },
    tempo: { min: 120, max: 180, target: 150 },
    danceability: { min: 0.4, max: 0.8, target: 0.6 },
  },
  "#008000": {
    // Verde - Natural, equilibrado
    energy: { min: 0.4, max: 0.7, target: 0.55 },
    valence: { min: 0.4, max: 0.7, target: 0.55 },
    acousticness: { min: 0.3, max: 0.7, target: 0.5 },
    tempo: { min: 90, max: 140, target: 115 },
  },
  "#FFC0CB": {
    // Rosa - Romântico, suave
    valence: { min: 0.6, max: 0.9, target: 0.75 },
    energy: { min: 0.2, max: 0.6, target: 0.4 },
    acousticness: { min: 0.3, max: 0.8, target: 0.6 },
    tempo: { min: 70, max: 130, target: 100 },
  },
  "#000000": {
    // Preto - Intenso, dramático
    energy: { min: 0.7, max: 1.0, target: 0.85 },
    valence: { min: 0.0, max: 0.4, target: 0.2 },
    loudness: { min: -10, max: 0, target: -5 },
    tempo: { min: 100, max: 200, target: 140 },
  },
  "#FFFFFF": {
    // Branco - Limpo, minimalista
    acousticness: { min: 0.5, max: 1.0, target: 0.8 },
    energy: { min: 0.2, max: 0.6, target: 0.4 },
    valence: { min: 0.4, max: 0.8, target: 0.6 },
    instrumentalness: { min: 0.3, max: 0.9, target: 0.6 },
  },
};

export const EMOJI_MAPPINGS: Record<string, AudioFeatureTargets> = {
  "💃": {
    // Dança
    danceability: { min: 0.8, max: 1.0, target: 0.9 },
    energy: { min: 0.6, max: 0.9, target: 0.8 },
    valence: { min: 0.6, max: 1.0, target: 0.8 },
    tempo: { min: 110, max: 170, target: 140 },
  },
  "😭": {
    // Tristeza
    valence: { min: 0.0, max: 0.3, target: 0.15 },
    energy: { min: 0.0, max: 0.4, target: 0.2 },
    acousticness: { min: 0.4, max: 1.0, target: 0.7 },
    tempo: { min: 60, max: 100, target: 80 },
  },
  "🔥": {
    // Intensidade
    energy: { min: 0.8, max: 1.0, target: 0.9 },
    tempo: { min: 140, max: 200, target: 170 },
    loudness: { min: -8, max: 0, target: -3 },
    valence: { min: 0.5, max: 1.0, target: 0.7 },
  },
  "🌊": {
    // Calma, fluidez
    acousticness: { min: 0.5, max: 1.0, target: 0.8 },
    energy: { min: 0.0, max: 0.5, target: 0.3 },
    valence: { min: 0.3, max: 0.7, target: 0.5 },
    tempo: { min: 60, max: 110, target: 85 },
  },
  "⚡": {
    // Energia elétrica
    energy: { min: 0.8, max: 1.0, target: 0.9 },
    danceability: { min: 0.6, max: 1.0, target: 0.8 },
    instrumentalness: { min: 0.0, max: 0.3, target: 0.1 },
    tempo: { min: 120, max: 180, target: 150 },
  },
  "🌙": {
    // Noturno, sonhador
    energy: { min: 0.0, max: 0.4, target: 0.2 },
    valence: { min: 0.2, max: 0.6, target: 0.4 },
    acousticness: { min: 0.4, max: 0.9, target: 0.7 },
    tempo: { min: 60, max: 100, target: 80 },
  },
  "☀️": {
    // Alegria, manhã
    valence: { min: 0.7, max: 1.0, target: 0.85 },
    energy: { min: 0.5, max: 0.8, target: 0.7 },
    danceability: { min: 0.5, max: 0.9, target: 0.7 },
    tempo: { min: 100, max: 150, target: 125 },
  },
  "🎭": {
    // Dramático, teatral
    energy: { min: 0.6, max: 0.9, target: 0.75 },
    valence: { min: 0.2, max: 0.8, target: 0.5 },
    speechiness: { min: 0.1, max: 0.4, target: 0.2 },
    acousticness: { min: 0.0, max: 0.5, target: 0.2 },
  },
  "❤️": {
    // Amor, romance
    valence: { min: 0.5, max: 0.9, target: 0.7 },
    energy: { min: 0.2, max: 0.6, target: 0.4 },
    acousticness: { min: 0.3, max: 0.8, target: 0.6 },
    tempo: { min: 70, max: 120, target: 95 },
  },
  "🌈": {
    // Diversidade, colorido
    valence: { min: 0.6, max: 1.0, target: 0.8 },
    energy: { min: 0.4, max: 0.8, target: 0.6 },
    danceability: { min: 0.4, max: 0.8, target: 0.6 },
    tempo: { min: 90, max: 140, target: 115 },
  },
  "🎵": {
    // Musical, melódico
    acousticness: { min: 0.3, max: 0.8, target: 0.6 },
    instrumentalness: { min: 0.0, max: 0.6, target: 0.3 },
    energy: { min: 0.3, max: 0.7, target: 0.5 },
    valence: { min: 0.4, max: 0.8, target: 0.6 },
  },
  "🚀": {
    // Futurista, espacial
    energy: { min: 0.6, max: 0.9, target: 0.8 },
    instrumentalness: { min: 0.4, max: 0.9, target: 0.7 },
    acousticness: { min: 0.0, max: 0.3, target: 0.1 },
    tempo: { min: 110, max: 160, target: 135 },
  },
};

export const EMOTION_MAPPINGS: Record<EmotionType, AudioFeatureTargets> = {
  [EmotionType.HAPPY]: {
    valence: { min: 0.7, max: 1.0, target: 0.85 },
    energy: { min: 0.5, max: 0.9, target: 0.7 },
    danceability: { min: 0.6, max: 1.0, target: 0.8 },
    tempo: { min: 100, max: 160, target: 130 },
  },
  [EmotionType.SAD]: {
    valence: { min: 0.0, max: 0.3, target: 0.15 },
    energy: { min: 0.0, max: 0.4, target: 0.2 },
    acousticness: { min: 0.4, max: 1.0, target: 0.7 },
    tempo: { min: 60, max: 100, target: 80 },
  },
  [EmotionType.ENERGETIC]: {
    energy: { min: 0.8, max: 1.0, target: 0.9 },
    tempo: { min: 120, max: 180, target: 150 },
    danceability: { min: 0.6, max: 1.0, target: 0.8 },
    valence: { min: 0.5, max: 1.0, target: 0.7 },
  },
  [EmotionType.CALM]: {
    energy: { min: 0.0, max: 0.4, target: 0.2 },
    acousticness: { min: 0.5, max: 1.0, target: 0.8 },
    valence: { min: 0.3, max: 0.7, target: 0.5 },
    tempo: { min: 60, max: 110, target: 85 },
  },
  [EmotionType.NOSTALGIC]: {
    valence: { min: 0.3, max: 0.7, target: 0.5 },
    energy: { min: 0.2, max: 0.6, target: 0.4 },
    acousticness: { min: 0.4, max: 0.9, target: 0.7 },
    tempo: { min: 70, max: 120, target: 95 },
  },
  [EmotionType.ROMANTIC]: {
    valence: { min: 0.5, max: 0.8, target: 0.65 },
    energy: { min: 0.2, max: 0.6, target: 0.4 },
    acousticness: { min: 0.3, max: 0.8, target: 0.6 },
    tempo: { min: 70, max: 120, target: 95 },
  },
  [EmotionType.ANGRY]: {
    energy: { min: 0.7, max: 1.0, target: 0.9 },
    valence: { min: 0.0, max: 0.4, target: 0.2 },
    loudness: { min: -10, max: 0, target: -3 },
    tempo: { min: 100, max: 200, target: 150 },
  },
  [EmotionType.FOCUSED]: {
    energy: { min: 0.3, max: 0.7, target: 0.5 },
    instrumentalness: { min: 0.5, max: 1.0, target: 0.8 },
    speechiness: { min: 0.0, max: 0.2, target: 0.1 },
    acousticness: { min: 0.0, max: 0.5, target: 0.2 },
  },
  [EmotionType.DREAMY]: {
    energy: { min: 0.1, max: 0.5, target: 0.3 },
    valence: { min: 0.4, max: 0.7, target: 0.55 },
    acousticness: { min: 0.5, max: 0.9, target: 0.7 },
    tempo: { min: 60, max: 100, target: 80 },
  },
  [EmotionType.EXCITED]: {
    energy: { min: 0.7, max: 1.0, target: 0.85 },
    valence: { min: 0.7, max: 1.0, target: 0.85 },
    danceability: { min: 0.5, max: 1.0, target: 0.8 },
    tempo: { min: 120, max: 180, target: 150 },
  },
};

export const COORDINATE_MAPPING = {
  // Função para mapear coordenadas (x, y) para características de áudio
  // x = danceability, y = acousticness
  mapCoordinateToAudioFeatures: (x: number, y: number): AudioFeatureTargets => {
    const tolerance = 0.15;

    return {
      danceability: {
        min: Math.max(0, x - tolerance),
        max: Math.min(1, x + tolerance),
        target: x,
      },
      acousticness: {
        min: Math.max(0, y - tolerance),
        max: Math.min(1, y + tolerance),
        target: y,
      },
      energy: {
        min: Math.max(0, x - tolerance),
        max: Math.min(1, x + tolerance),
        target: x,
      },
      valence: {
        min: Math.max(0, y - tolerance),
        max: Math.min(1, y + tolerance),
        target: y,
      },
    };
  },
};

export const POPULAR_GENRES = [
  "pop",
  "rock",
  "hip-hop",
  "electronic",
  "jazz",
  "classical",
  "indie",
  "alternative",
  "r&b",
  "country",
  "folk",
  "blues",
  "metal",
  "punk",
  "reggae",
  "funk",
  "soul",
  "disco",
  "house",
  "techno",
  "ambient",
  "world",
  "latin",
  "gospel",
];

export const MOOD_PRESETS = {
  morning: {
    valence: { min: 0.6, max: 1.0, target: 0.8 },
    energy: { min: 0.4, max: 0.8, target: 0.6 },
    tempo: { min: 100, max: 140, target: 120 },
  },
  workout: {
    energy: { min: 0.8, max: 1.0, target: 0.9 },
    tempo: { min: 120, max: 180, target: 150 },
    danceability: { min: 0.6, max: 1.0, target: 0.8 },
  },
  study: {
    instrumentalness: { min: 0.5, max: 1.0, target: 0.8 },
    energy: { min: 0.2, max: 0.6, target: 0.4 },
    speechiness: { min: 0.0, max: 0.2, target: 0.1 },
  },
  sleep: {
    energy: { min: 0.0, max: 0.3, target: 0.15 },
    acousticness: { min: 0.6, max: 1.0, target: 0.8 },
    tempo: { min: 60, max: 90, target: 75 },
  },
  party: {
    danceability: { min: 0.7, max: 1.0, target: 0.9 },
    energy: { min: 0.7, max: 1.0, target: 0.85 },
    valence: { min: 0.6, max: 1.0, target: 0.8 },
  },
  relax: {
    energy: { min: 0.0, max: 0.4, target: 0.2 },
    acousticness: { min: 0.4, max: 1.0, target: 0.7 },
    valence: { min: 0.3, max: 0.7, target: 0.5 },
  },
};
