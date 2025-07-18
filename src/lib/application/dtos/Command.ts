import { AudioFeatureTargets, MoodInput } from "@/lib/types/common";

// Generate Playlist Command
export class GeneratePlaylistCommand {
  userId: string;
  moodInput: MoodInput;
  playlistName?: string;
  playlistDescription?: string;
  targetSize: number;
  saveToSpotify: boolean;

  constructor(data: {
    userId: string;
    moodInput: MoodInput;
    playlistName?: string;
    playlistDescription?: string;
    targetSize?: number;
    saveToSpotify?: boolean;
  }) {
    this.userId = data.userId;
    this.moodInput = data.moodInput;
    this.playlistName = data.playlistName;
    this.playlistDescription = data.playlistDescription;
    this.targetSize = data.targetSize || 30;
    this.saveToSpotify = data.saveToSpotify || false;

    this.validate();
  }

  private validate(): void {
    if (!this.userId || this.userId.trim().length === 0) {
      throw new Error("ID do usuário é obrigatório");
    }

    if (!this.moodInput) {
      throw new Error("Entrada de mood é obrigatória");
    }

    if (
      !this.moodInput.type ||
      !["color", "emoji", "emotion", "coordinate"].includes(this.moodInput.type)
    ) {
      throw new Error(
        "Tipo de mood deve ser: color, emoji, emotion ou coordinate"
      );
    }

    if (!this.moodInput.value) {
      throw new Error("Valor do mood é obrigatório");
    }

    if (this.targetSize < 10 || this.targetSize > 100) {
      throw new Error("Tamanho da playlist deve estar entre 10 e 100 músicas");
    }

    if (this.playlistName && this.playlistName.length > 100) {
      throw new Error("Nome da playlist não pode ter mais de 100 caracteres");
    }

    if (this.playlistDescription && this.playlistDescription.length > 300) {
      throw new Error(
        "Descrição da playlist não pode ter mais de 300 caracteres"
      );
    }
  }
}

// Color Recommendation Command
export class ColorRecommendationCommand {
  userId: string;
  hexColor: string;
  targetSize: number;
  includePopular: boolean;

  constructor(data: {
    userId: string;
    hexColor: string;
    targetSize?: number;
    includePopular?: boolean;
  }) {
    this.userId = data.userId;
    this.hexColor = data.hexColor;
    this.targetSize = data.targetSize || 30;
    this.includePopular = data.includePopular || false;

    this.validate();
  }

  private validate(): void {
    if (!this.userId || this.userId.trim().length === 0) {
      throw new Error("ID do usuário é obrigatório");
    }

    if (!this.hexColor) {
      throw new Error("Cor em formato hexadecimal é obrigatória");
    }

    // Validar formato hexadecimal
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!hexRegex.test(this.hexColor)) {
      throw new Error(
        "Cor deve estar no formato hexadecimal válido (ex: #FF0000)"
      );
    }

    if (this.targetSize < 10 || this.targetSize > 100) {
      throw new Error("Tamanho da playlist deve estar entre 10 e 100 músicas");
    }
  }
}

// Emoji Recommendation Command
export class EmojiRecommendationCommand {
  userId: string;
  emojis: string[];
  targetSize: number;
  combineEmojis: boolean;

  constructor(data: {
    userId: string;
    emojis: string[];
    targetSize?: number;
    combineEmojis?: boolean;
  }) {
    this.userId = data.userId;
    this.emojis = data.emojis;
    this.targetSize = data.targetSize || 30;
    this.combineEmojis = data.combineEmojis || false;

    this.validate();
  }

  private validate(): void {
    if (!this.userId || this.userId.trim().length === 0) {
      throw new Error("ID do usuário é obrigatório");
    }

    if (!this.emojis || this.emojis.length === 0) {
      throw new Error("Pelo menos um emoji é obrigatório");
    }

    if (this.emojis.length > 5) {
      throw new Error("Máximo de 5 emojis permitidos");
    }

    // Validar se são emojis válidos (verificação básica)
    const emojiRegex = /[\p{Emoji}]/u;
    this.emojis.forEach((emoji) => {
      if (!emojiRegex.test(emoji)) {
        throw new Error(`"${emoji}" não é um emoji válido`);
      }
    });

    if (this.targetSize < 10 || this.targetSize > 100) {
      throw new Error("Tamanho da playlist deve estar entre 10 e 100 músicas");
    }
  }
}

// Emotion Recommendation Command
export class EmotionRecommendationCommand {
  userId: string;
  emotionalInput: string;
  targetSize: number;
  useAI: boolean;
  market: string;

  constructor(data: {
    userId: string;
    emotionalInput: string;
    targetSize?: number;
    useAI?: boolean;
    market?: string;
  }) {
    this.userId = data.userId;
    this.emotionalInput = data.emotionalInput;
    this.targetSize = data.targetSize || 30;
    this.useAI = data.useAI !== false; // Default true
    this.market = data.market || "US";

    this.validate();
  }

  private validate(): void {
    if (!this.userId || this.userId.trim().length === 0) {
      throw new Error("ID do usuário é obrigatório");
    }

    if (!this.emotionalInput || this.emotionalInput.trim().length === 0) {
      throw new Error("Entrada emocional é obrigatória");
    }

    if (this.emotionalInput.length > 500) {
      throw new Error("Entrada emocional não pode ter mais de 500 caracteres");
    }

    if (this.targetSize < 10 || this.targetSize > 100) {
      throw new Error("Tamanho da playlist deve estar entre 10 e 100 músicas");
    }

    // Validar market code (ISO 3166-1 alpha-2)
    const marketRegex = /^[A-Z]{2}$/;
    if (!marketRegex.test(this.market)) {
      throw new Error(
        "Código de mercado deve estar no formato ISO 3166-1 alpha-2 (ex: US, BR)"
      );
    }
  }
}

// Mood Graph Command
export class MoodGraphCommand {
  userId: string;
  coordinates: { x: number; y: number };
  targetSize: number;
  intensityMultiplier: number;

  constructor(data: {
    userId: string;
    coordinates: { x: number; y: number };
    targetSize?: number;
    intensityMultiplier?: number;
  }) {
    this.userId = data.userId;
    this.coordinates = data.coordinates;
    this.targetSize = data.targetSize || 30;
    this.intensityMultiplier = data.intensityMultiplier || 1.0;

    this.validate();
  }

  private validate(): void {
    if (!this.userId || this.userId.trim().length === 0) {
      throw new Error("ID do usuário é obrigatório");
    }

    if (!this.coordinates) {
      throw new Error("Coordenadas são obrigatórias");
    }

    if (
      typeof this.coordinates.x !== "number" ||
      typeof this.coordinates.y !== "number"
    ) {
      throw new Error("Coordenadas devem ser números");
    }

    if (this.coordinates.x < 0 || this.coordinates.x > 1) {
      throw new Error("Coordenada X deve estar entre 0 e 1");
    }

    if (this.coordinates.y < 0 || this.coordinates.y > 1) {
      throw new Error("Coordenada Y deve estar entre 0 e 1");
    }

    if (this.targetSize < 10 || this.targetSize > 100) {
      throw new Error("Tamanho da playlist deve estar entre 10 e 100 músicas");
    }

    if (this.intensityMultiplier < 0.1 || this.intensityMultiplier > 2.0) {
      throw new Error(
        "Multiplicador de intensidade deve estar entre 0.1 e 2.0"
      );
    }
  }
}

// Save Playlist Command
export class SavePlaylistCommand {
  userId: string;
  playlistId: string;
  name: string;
  description?: string;
  saveToSpotify: boolean;

  constructor(data: {
    userId: string;
    playlistId: string;
    name: string;
    description?: string;
    saveToSpotify?: boolean;
  }) {
    this.userId = data.userId;
    this.playlistId = data.playlistId;
    this.name = data.name;
    this.description = data.description;
    this.saveToSpotify = data.saveToSpotify || false;

    this.validate();
  }

  private validate(): void {
    if (!this.userId || this.userId.trim().length === 0) {
      throw new Error("ID do usuário é obrigatório");
    }

    if (!this.playlistId || this.playlistId.trim().length === 0) {
      throw new Error("ID da playlist é obrigatório");
    }

    if (!this.name || this.name.trim().length === 0) {
      throw new Error("Nome da playlist é obrigatório");
    }

    if (this.name.length > 100) {
      throw new Error("Nome da playlist não pode ter mais de 100 caracteres");
    }

    if (this.description && this.description.length > 300) {
      throw new Error(
        "Descrição da playlist não pode ter mais de 300 caracteres"
      );
    }
  }
}

// Improve Recommendations Command
export class ImproveRecommendationsCommand {
  userId: string;
  originalMoodInput: MoodInput;
  currentTargets: AudioFeatureTargets;
  feedback: "too_energetic" | "too_calm" | "too_happy" | "too_sad" | "perfect";
  targetSize: number;

  constructor(data: {
    userId: string;
    originalMoodInput: MoodInput;
    currentTargets: AudioFeatureTargets;
    feedback: string;
    targetSize?: number;
  }) {
    this.userId = data.userId;
    this.originalMoodInput = data.originalMoodInput;
    this.currentTargets = data.currentTargets;
    this.feedback = data.feedback as any;
    this.targetSize = data.targetSize || 30;

    this.validate();
  }

  private validate(): void {
    if (!this.userId || this.userId.trim().length === 0) {
      throw new Error("ID do usuário é obrigatório");
    }

    if (!this.originalMoodInput) {
      throw new Error("Entrada de mood original é obrigatória");
    }

    if (!this.currentTargets) {
      throw new Error("Targets atuais são obrigatórios");
    }

    const validFeedback = [
      "too_energetic",
      "too_calm",
      "too_happy",
      "too_sad",
      "perfect",
    ];
    if (!validFeedback.includes(this.feedback)) {
      throw new Error(
        "Feedback deve ser um dos valores: " + validFeedback.join(", ")
      );
    }

    if (this.targetSize < 10 || this.targetSize > 100) {
      throw new Error("Tamanho da playlist deve estar entre 10 e 100 músicas");
    }
  }
}
