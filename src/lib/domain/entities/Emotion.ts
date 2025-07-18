export class Emotion {
  constructor(
    public type: EmotionType,
    public intensity: number,
    public audioFeatureMappings: any[]
  ) {}

  static fromText(text: string): Emotion {
    const lowerText = text.toLowerCase();

    // Detectar tipo de emoção baseado em palavras-chave
    const emotionKeywords = {
      [EmotionType.HAPPY]: [
        "feliz",
        "alegre",
        "animado",
        "contente",
        "eufórico",
        "festa",
        "celebrar",
      ],
      [EmotionType.SAD]: [
        "triste",
        "melancólico",
        "deprimido",
        "solitário",
        "nostálgico",
        "chorar",
      ],
      [EmotionType.ENERGETIC]: [
        "energia",
        "agitado",
        "intenso",
        "ativo",
        "vibrante",
        "corrida",
        "treino",
      ],
      [EmotionType.CALM]: [
        "calmo",
        "relaxado",
        "paz",
        "tranquilo",
        "sereno",
        "meditação",
        "zen",
      ],
      [EmotionType.ROMANTIC]: [
        "amor",
        "romântico",
        "paixão",
        "carinho",
        "íntimo",
        "coração",
      ],
      [EmotionType.ANGRY]: [
        "raiva",
        "irritado",
        "furioso",
        "bravo",
        "revoltado",
        "indignado",
      ],
      [EmotionType.FOCUSED]: [
        "foco",
        "concentração",
        "trabalho",
        "estudo",
        "produtivo",
        "atenção",
      ],
      [EmotionType.DREAMY]: [
        "sonhador",
        "fantasia",
        "imaginação",
        "etéreo",
        "flutuante",
        "celestial",
      ],
      [EmotionType.NOSTALGIC]: [
        "saudade",
        "nostalgia",
        "memórias",
        "passado",
        "lembranças",
      ],
      [EmotionType.EXCITED]: [
        "empolgado",
        "excitado",
        "ansioso",
        "expectativa",
        "entusiasmado",
      ],
    };

    let detectedType = EmotionType.CALM;
    let maxMatches = 0;
    let totalWords = 0;

    Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
      const matches = keywords.filter((keyword) =>
        lowerText.includes(keyword)
      ).length;
      totalWords += keywords.length;

      if (matches > maxMatches) {
        maxMatches = matches;
        detectedType = emotion as EmotionType;
      }
    });

    // Calcular intensidade baseada na quantidade de palavras emocionais
    const intensity = Math.min(
      1,
      (maxMatches + lowerText.split(" ").length * 0.1) / 3
    );

    return new Emotion(detectedType, intensity, []);
  }

  getDescription(): string {
    const descriptions = {
      [EmotionType.HAPPY]: "Alegre e positivo",
      [EmotionType.SAD]: "Melancólico e introspectivo",
      [EmotionType.ENERGETIC]: "Energético e vibrante",
      [EmotionType.CALM]: "Calmo e relaxante",
      [EmotionType.ROMANTIC]: "Romântico e íntimo",
      [EmotionType.ANGRY]: "Intenso e poderoso",
      [EmotionType.FOCUSED]: "Focado e concentrado",
      [EmotionType.DREAMY]: "Sonhador e etéreo",
      [EmotionType.NOSTALGIC]: "Nostálgico e saudoso",
      [EmotionType.EXCITED]: "Empolgante e entusiasmado",
    };

    return descriptions[this.type];
  }

  getIntensityDescription(): string {
    if (this.intensity >= 0.8) return "Muito intenso";
    if (this.intensity >= 0.6) return "Intenso";
    if (this.intensity >= 0.4) return "Moderado";
    if (this.intensity >= 0.2) return "Leve";
    return "Muito leve";
  }
}

export enum EmotionType {
  HAPPY = "happy",
  SAD = "sad",
  ENERGETIC = "energetic",
  CALM = "calm",
  NOSTALGIC = "nostalgic",
  ROMANTIC = "romantic",
  ANGRY = "angry",
  FOCUSED = "focused",
  DREAMY = "dreamy",
  EXCITED = "excited",
}
