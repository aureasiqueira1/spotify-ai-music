import { AudioFeatureTargets } from "@/lib/types/common";

export class ClaudeAPI {
  private apiKey: string;
  private baseURL = "https://api.anthropic.com/v1";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async interpretEmotionalInput(input: string): Promise<AudioFeatureTargets> {
    const prompt = `
Você é um especialista em análise musical e emocional. Analise o seguinte texto e converta-o em parâmetros de características de áudio do Spotify.

Texto do usuário: "${input}"

Características disponíveis (valores de 0.0 a 1.0, exceto tempo):
- danceability: o quão adequada é para dança (0.0 = não dançável, 1.0 = muito dançável)
- energy: intensidade e energia percebida (0.0 = baixa energia, 1.0 = alta energia)
- valence: positividade musical (0.0 = negativo/triste, 1.0 = positivo/feliz)
- acousticness: se a música é acústica (0.0 = eletrônica, 1.0 = acústica)
- instrumentalness: se não tem vocais (0.0 = com vocais, 1.0 = instrumental)
- speechiness: presença de palavras faladas (0.0 = música, 1.0 = falado)
- tempo: batidas por minuto (70-200 BPM)
- loudness: volume em decibéis (-60 a 0 dB)

Analise o contexto emocional, palavras-chave e sentimentos expressos no texto. Considere:
- Palavras relacionadas à energia (calmo, agitado, intenso, relaxado)
- Palavras relacionadas ao humor (feliz, triste, nostálgico, romantique)
- Palavras relacionadas ao ritmo (dançante, lento, rápido)
- Palavras relacionadas ao estilo (acústico, eletrônico, instrumental)

Responda APENAS com um JSON válido no formato:
{
  "danceability": {"min": 0.0, "max": 1.0, "target": 0.5},
  "energy": {"min": 0.0, "max": 1.0, "target": 0.5},
  "valence": {"min": 0.0, "max": 1.0, "target": 0.5},
  "acousticness": {"min": 0.0, "max": 1.0, "target": 0.5},
  "tempo": {"min": 70, "max": 200, "target": 120}
}

Inclua apenas as características mais relevantes para a emoção/contexto descrito. Use faixas (min/max) para dar flexibilidade e target para o valor ideal.
`;

    try {
      const response = await fetch(`${this.baseURL}/messages`, {
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

      if (!response.ok) {
        throw new Error(
          `Claude API Error: ${response.status} - ${response.statusText}`
        );
      }

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

  async generatePlaylistDescription(
    moodInput: string,
    tracks: Array<{ name: string; artists: string[] }>
  ): Promise<string> {
    const trackList = tracks
      .slice(0, 10)
      .map((t) => `${t.name} - ${t.artists.join(", ")}`)
      .join("\n");

    const prompt = `
Baseado no mood/sentimento "${moodInput}" e nestas primeiras músicas da playlist:

${trackList}

Crie uma descrição criativa e envolvente para a playlist (máximo 150 caracteres). A descrição deve:
- Capturar o sentimento/mood descrito
- Ser emotiva e inspiradora
- Usar linguagem poética mas acessível
- Mencionar sutilmente o aspecto de IA/descoberta

Responda apenas com a descrição, sem aspas ou formatação extra.
`;

    try {
      const response = await fetch(`${this.baseURL}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-3-sonnet-20240229",
          max_tokens: 200,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Claude API Error: ${response.status} - ${response.statusText}`
        );
      }

      const data = await response.json();
      return data.content[0].text.trim();
    } catch (error) {
      console.error("Erro ao gerar descrição da playlist:", error);
      return `Playlist criada com IA baseada no mood: ${moodInput}`;
    }
  }

  async improveMoodInterpretation(
    originalInput: string,
    currentTargets: AudioFeatureTargets,
    userFeedback:
      | "too_energetic"
      | "too_calm"
      | "too_happy"
      | "too_sad"
      | "perfect"
  ): Promise<AudioFeatureTargets> {
    const prompt = `
Você tem uma interpretação atual de um mood musical e precisa ajustá-la baseado no feedback do usuário.

Entrada original: "${originalInput}"

Interpretação atual:
${JSON.stringify(currentTargets, null, 2)}

Feedback do usuário: "${userFeedback}"

Ajuste a interpretação baseado no feedback:
- "too_energetic": diminua energy, tempo e danceability
- "too_calm": aumente energy, tempo e danceability
- "too_happy": diminua valence
- "too_sad": aumente valence
- "perfect": mantenha os valores atuais

Responda APENAS com um JSON válido no mesmo formato da interpretação atual.
`;

    try {
      const response = await fetch(`${this.baseURL}/messages`, {
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

      if (!response.ok) {
        throw new Error(
          `Claude API Error: ${response.status} - ${response.statusText}`
        );
      }

      const data = await response.json();
      const content = data.content[0].text;

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      throw new Error("Não foi possível interpretar a resposta da IA");
    } catch (error) {
      console.error("Erro ao melhorar interpretação:", error);
      return this.adjustTargetsBasedOnFeedback(currentTargets, userFeedback);
    }
  }

  private basicEmotionalInterpretation(input: string): AudioFeatureTargets {
    const lowerInput = input.toLowerCase();

    // Palavras-chave para diferentes emoções
    const keywords = {
      happy: [
        "feliz",
        "alegre",
        "animado",
        "festa",
        "celebrar",
        "eufórico",
        "contente",
      ],
      sad: [
        "triste",
        "melancólico",
        "deprimido",
        "chorar",
        "lamento",
        "solitário",
      ],
      energetic: [
        "energia",
        "agitado",
        "intenso",
        "corrida",
        "treino",
        "vibrante",
        "ativo",
      ],
      calm: [
        "calmo",
        "relaxar",
        "paz",
        "tranquilo",
        "meditação",
        "zen",
        "sereno",
      ],
      romantic: ["amor", "romântico", "paixão", "coração", "carinho", "íntimo"],
      focused: [
        "foco",
        "concentração",
        "trabalho",
        "estudo",
        "produtivo",
        "atenção",
      ],
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

  private adjustTargetsBasedOnFeedback(
    currentTargets: AudioFeatureTargets,
    feedback: string
  ): AudioFeatureTargets {
    const adjusted = { ...currentTargets };

    switch (feedback) {
      case "too_energetic":
        if (adjusted.energy) {
          adjusted.energy.target = Math.max(
            0,
            (adjusted.energy.target || 0.5) - 0.2
          );
          adjusted.energy.max = Math.min(adjusted.energy.max - 0.1, 1);
        }
        if (adjusted.tempo) {
          adjusted.tempo.target = Math.max(
            70,
            (adjusted.tempo.target || 120) - 20
          );
          adjusted.tempo.max = Math.min(adjusted.tempo.max - 10, 200);
        }
        break;

      case "too_calm":
        if (adjusted.energy) {
          adjusted.energy.target = Math.min(
            1,
            (adjusted.energy.target || 0.5) + 0.2
          );
          adjusted.energy.min = Math.max(adjusted.energy.min + 0.1, 0);
        }
        if (adjusted.tempo) {
          adjusted.tempo.target = Math.min(
            200,
            (adjusted.tempo.target || 120) + 20
          );
          adjusted.tempo.min = Math.max(adjusted.tempo.min + 10, 70);
        }
        break;

      case "too_happy":
        if (adjusted.valence) {
          adjusted.valence.target = Math.max(
            0,
            (adjusted.valence.target || 0.5) - 0.2
          );
          adjusted.valence.max = Math.min(adjusted.valence.max - 0.1, 1);
        }
        break;

      case "too_sad":
        if (adjusted.valence) {
          adjusted.valence.target = Math.min(
            1,
            (adjusted.valence.target || 0.5) + 0.2
          );
          adjusted.valence.min = Math.max(adjusted.valence.min + 0.1, 0);
        }
        break;
    }

    return adjusted;
  }
}
