import { AudioFeatureTargets } from "@/lib/types/common";
import { Track } from "../entities/Track";

export class RecommendationEngine {
  static calculateCompatibilityScore(
    track: Track,
    targets: AudioFeatureTargets
  ): number {
    let score = 0;
    let criteriaCount = 0;

    Object.entries(targets).forEach(([feature, range]) => {
      if (
        range &&
        track.audioFeatures[feature as keyof typeof track.audioFeatures]
      ) {
        const value = track.audioFeatures[
          feature as keyof typeof track.audioFeatures
        ] as number;

        // Verificar se o valor está dentro da faixa
        if (value >= range.min && value <= range.max) {
          // Calcular proximidade do target ou centro da faixa
          const target = range.target || (range.min + range.max) / 2;
          const distance = Math.abs(value - target);
          const maxDistance = Math.max(target - range.min, range.max - target);

          // Pontuação de 0.5 a 1.0 (dentro da faixa)
          score += 0.5 + 0.5 * (1 - distance / maxDistance);
        } else {
          // Penalizar valores fora da faixa
          const distanceFromRange = Math.min(
            Math.abs(value - range.min),
            Math.abs(value - range.max)
          );
          score += Math.max(0, 0.5 - distanceFromRange);
        }

        criteriaCount++;
      }
    });

    return criteriaCount > 0 ? score / criteriaCount : 0;
  }

  static diversifyPlaylist(tracks: Track[], maxTracks: number = 30): Track[] {
    if (tracks.length <= maxTracks) return tracks;

    const diversified: Track[] = [];
    const remaining = [...tracks];

    // Sempre incluir as top 5 por compatibilidade
    const topTracks = Math.min(5, remaining.length);
    diversified.push(...remaining.splice(0, topTracks));

    // Diversificar o resto baseado em diferentes características
    while (diversified.length < maxTracks && remaining.length > 0) {
      let bestIndex = 0;
      let bestDiversity = -1;

      for (let i = 0; i < remaining.length; i++) {
        const diversity = this.calculateDiversityScore(
          remaining[i],
          diversified
        );

        if (diversity > bestDiversity) {
          bestDiversity = diversity;
          bestIndex = i;
        }
      }

      diversified.push(remaining.splice(bestIndex, 1)[0]);
    }

    return diversified;
  }

  private static calculateDiversityScore(
    candidate: Track,
    existing: Track[]
  ): number {
    if (existing.length === 0) return 1;

    let totalDifference = 0;
    const features = [
      "danceability",
      "energy",
      "valence",
      "acousticness",
      "tempo",
    ];

    existing.forEach((track) => {
      let trackDifference = 0;
      features.forEach((feature) => {
        let candidateValue = candidate.audioFeatures[
          feature as keyof typeof candidate.audioFeatures
        ] as number;
        let trackValue = track.audioFeatures[
          feature as keyof typeof track.audioFeatures
        ] as number;

        // Normalizar tempo para escala 0-1
        if (feature === "tempo") {
          candidateValue = candidateValue / 200;
          trackValue = trackValue / 200;
        }

        const diff = Math.abs(candidateValue - trackValue);
        trackDifference += diff;
      });
      totalDifference += trackDifference / features.length;
    });

    const avgDifference = totalDifference / existing.length;

    // Adicionar bonus por diferentes artistas
    const artistBonus = existing.some((track) =>
      track.artists.some((artist) => candidate.artists.includes(artist))
    )
      ? 0
      : 0.1;

    return avgDifference + artistBonus;
  }

  static balancePlaylist(tracks: Track[]): Track[] {
    if (tracks.length <= 10) return tracks;

    // Organizar por energia para criar flow
    const sortedByEnergy = [...tracks].sort(
      (a, b) => a.audioFeatures.energy - b.audioFeatures.energy
    );

    const balanced: Track[] = [];
    const high = sortedByEnergy.filter((t) => t.audioFeatures.energy > 0.6);
    const medium = sortedByEnergy.filter(
      (t) => t.audioFeatures.energy >= 0.3 && t.audioFeatures.energy <= 0.6
    );
    const low = sortedByEnergy.filter((t) => t.audioFeatures.energy < 0.3);

    // Intercalar diferentes níveis de energia
    const maxLength = Math.max(high.length, medium.length, low.length);

    for (let i = 0; i < maxLength; i++) {
      if (i < medium.length) balanced.push(medium[i]);
      if (i < high.length) balanced.push(high[i]);
      if (i < low.length) balanced.push(low[i]);
    }

    return balanced;
  }

  static analyzePlaylistMood(tracks: Track[]): {
    dominant: string;
    energy: number;
    valence: number;
    danceability: number;
    acousticness: number;
    description: string;
  } {
    if (tracks.length === 0) {
      return {
        dominant: "unknown",
        energy: 0,
        valence: 0,
        danceability: 0,
        acousticness: 0,
        description: "Playlist vazia",
      };
    }

    const avgFeatures = tracks.reduce(
      (acc, track) => {
        acc.energy += track.audioFeatures.energy;
        acc.valence += track.audioFeatures.valence;
        acc.danceability += track.audioFeatures.danceability;
        acc.acousticness += track.audioFeatures.acousticness;
        return acc;
      },
      { energy: 0, valence: 0, danceability: 0, acousticness: 0 }
    );

    const count = tracks.length;
    const energy = avgFeatures.energy / count;
    const valence = avgFeatures.valence / count;
    const danceability = avgFeatures.danceability / count;
    const acousticness = avgFeatures.acousticness / count;

    // Determinar mood dominante
    let dominant = "balanced";
    let description = "Playlist equilibrada";

    if (energy > 0.7 && valence > 0.6) {
      dominant = "energetic-happy";
      description = "Playlist energética e alegre";
    } else if (energy < 0.3 && valence < 0.4) {
      dominant = "calm-melancholic";
      description = "Playlist calma e melancólica";
    } else if (danceability > 0.7) {
      dominant = "danceable";
      description = "Playlist dançante";
    } else if (acousticness > 0.7) {
      dominant = "acoustic";
      description = "Playlist acústica";
    } else if (energy > 0.7) {
      dominant = "energetic";
      description = "Playlist energética";
    } else if (valence > 0.7) {
      dominant = "happy";
      description = "Playlist alegre";
    } else if (valence < 0.3) {
      dominant = "sad";
      description = "Playlist melancólica";
    } else if (energy < 0.3) {
      dominant = "calm";
      description = "Playlist calma";
    }

    return {
      dominant,
      energy,
      valence,
      danceability,
      acousticness,
      description,
    };
  }

  static generatePlaylistVariations(
    baseTargets: AudioFeatureTargets,
    count: number = 3
  ): AudioFeatureTargets[] {
    const variations: AudioFeatureTargets[] = [baseTargets];

    for (let i = 1; i < count; i++) {
      const variation: AudioFeatureTargets = {};

      Object.entries(baseTargets).forEach(([feature, range]) => {
        if (range) {
          const variance = 0.1 + i * 0.05; // Aumentar variação
          const newMin = Math.max(0, range.min - variance);
          const newMax = Math.min(1, range.max + variance);
          const newTarget = range.target
            ? Math.max(
                newMin,
                Math.min(
                  newMax,
                  range.target + (Math.random() - 0.5) * variance
                )
              )
            : undefined;

          variation[feature as keyof AudioFeatureTargets] = {
            min: newMin,
            max: newMax,
            target: newTarget,
          };
        }
      });

      variations.push(variation);
    }

    return variations;
  }
}
