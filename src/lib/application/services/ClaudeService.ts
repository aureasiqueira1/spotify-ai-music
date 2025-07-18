import { AudioFeatureTargets } from "../../types/common";

export class ClaudeService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async interpretEmotionalInput(input: string): Promise<AudioFeatureTargets> {
    const prompt = `
Você é um especialista em análise musical e emocional. Analise o seguinte texto e converta-o em parâmetros de características de áudio do Spotify.

Texto do usuário: "${input}"

Características disponíveis (valores de 0.0 a 1.0):
- danceability: o quão adequada é para dança
- energy: intensidade e energia percebida
- valence: positividade musical (0 = negativo, 1 = positivo)
- acousticness: se a música é acústica
- instrumentalness: se não tem vocais
- speechiness: presença de palavras faladas
- tempo: batidas por minuto (70-200 BPM)
- loudness: volume em decibéis (-60 a 0 dB)

Responda APENAS com um JSON válido no formato:
{
  "danceability": {"min": 0.0, "max": 1.0, "target": 0.5},
  "energy": {"min": 0.0, "max": 1.0, "target": 0.5},
  "valence": {"min": 0.0, "max": 1.0, "target": 0.5},
  "acousticness": {"min": 0.0, "max": 1.0, "target": 0.5},
  "tempo": {"min": 70, "max": 200, "target": 120}
}

Inclua apenas as características relevantes para a emoção/contexto descrito.
`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-3-sonnet-20240229",
          max_tokens: 1000,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      });

      const data = await response.json();
      const content = data.content[0].text;

      // Extrair JSON da resposta
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      throw new Error("Não foi possível interpretar a resposta da IA");
    } catch (error) {
      console.error("Erro ao interpretar entrada emocional:", error);
      // Fallback para interpretação básica
      return this.basicEmotionalInterpretation(input);
    }
  }

  private basicEmotionalInterpretation(input: string): AudioFeatureTargets {
    const lowerInput = input.toLowerCase();

    // Palavras-chave para diferentes emoções
    const keywords = {
      happy: ["feliz", "alegre", "animado", "festa", "celebrar"],
      sad: ["triste", "melancólico", "deprimido", "chorar", "lamento"],
      energetic: ["energia", "agitado", "intenso", "corrida", "treino"],
      calm: ["calmo", "relaxar", "paz", "tranquilo", "meditação"],
      romantic: ["amor", "romântico", "paixão", "coração", "carinho"],
      focused: ["foco", "concentração", "trabalho", "estudo", "produtivo"],
    };

    // Determinar emoção dominante
    let dominantEmotion = "calm";
    let maxMatches = 0;

    Object.entries(keywords).forEach(([emotion, words]) => {
      const matches = words.filter((word) => lowerInput.includes(word)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        dominantEmotion = emotion;
      }
    });

    // Mapear para características de áudio
    const mappings = {
      happy: {
        valence: { min: 0.7, max: 1.0, target: 0.85 },
        energy: { min: 0.5, max: 0.9, target: 0.7 },
        danceability: { min: 0.6, max: 1.0, target: 0.8 },
      },
      sad: {
        valence: { min: 0.0, max: 0.3, target: 0.15 },
        energy: { min: 0.0, max: 0.4, target: 0.2 },
        acousticness: { min: 0.4, max: 1.0, target: 0.7 },
      },
      energetic: {
        energy: { min: 0.8, max: 1.0, target: 0.9 },
        tempo: { min: 120, max: 180, target: 150 },
        danceability: { min: 0.6, max: 1.0, target: 0.8 },
      },
      calm: {
        energy: { min: 0.0, max: 0.4, target: 0.2 },
        acousticness: { min: 0.5, max: 1.0, target: 0.7 },
        valence: { min: 0.3, max: 0.7, target: 0.5 },
      },
      romantic: {
        valence: { min: 0.5, max: 0.8, target: 0.65 },
        energy: { min: 0.2, max: 0.6, target: 0.4 },
        acousticness: { min: 0.3, max: 0.8, target: 0.6 },
      },
      focused: {
        energy: { min: 0.3, max: 0.7, target: 0.5 },
        instrumentalness: { min: 0.5, max: 1.0, target: 0.8 },
        speechiness: { min: 0.0, max: 0.2, target: 0.1 },
      },
    };

    return mappings[dominantEmotion as keyof typeof mappings];
  }
}
