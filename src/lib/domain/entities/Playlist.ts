import { MoodInput } from "@/lib/types/common";
import { Track } from "./Track";

export class Playlist {
  constructor(
    public id: string,
    public name: string,
    public description: string,
    public tracks: Track[],
    public userId: string,
    public moodInput: MoodInput,
    public createdAt: Date,
    public updatedAt: Date,
    public spotifyPlaylistId?: string
  ) {}

  getTotalDuration(): number {
    return this.tracks.reduce((total, track) => total + track.durationMs, 0);
  }

  getTotalDurationString(): string {
    const totalMs = this.getTotalDuration();
    const hours = Math.floor(totalMs / 3600000);
    const minutes = Math.floor((totalMs % 3600000) / 60000);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  getAverageAudioFeatures(): any {
    if (this.tracks.length === 0) return null;

    const features = this.tracks.reduce(
      (acc, track) => {
        acc.danceability += track.audioFeatures.danceability;
        acc.energy += track.audioFeatures.energy;
        acc.valence += track.audioFeatures.valence;
        acc.acousticness += track.audioFeatures.acousticness;
        acc.instrumentalness += track.audioFeatures.instrumentalness;
        acc.speechiness += track.audioFeatures.speechiness;
        acc.tempo += track.audioFeatures.tempo;
        acc.loudness += track.audioFeatures.loudness;
        return acc;
      },
      {
        danceability: 0,
        energy: 0,
        valence: 0,
        acousticness: 0,
        instrumentalness: 0,
        speechiness: 0,
        tempo: 0,
        loudness: 0,
      }
    );

    const count = this.tracks.length;
    return {
      danceability: features.danceability / count,
      energy: features.energy / count,
      valence: features.valence / count,
      acousticness: features.acousticness / count,
      instrumentalness: features.instrumentalness / count,
      speechiness: features.speechiness / count,
      tempo: features.tempo / count,
      loudness: features.loudness / count,
    };
  }

  getMoodDescription(): string {
    const avgFeatures = this.getAverageAudioFeatures();
    if (!avgFeatures) return "Empty playlist";

    const descriptors = [];

    if (avgFeatures.valence > 0.7) descriptors.push("Uplifting");
    else if (avgFeatures.valence < 0.3) descriptors.push("Melancholic");

    if (avgFeatures.energy > 0.7) descriptors.push("High-energy");
    else if (avgFeatures.energy < 0.3) descriptors.push("Chill");

    if (avgFeatures.danceability > 0.7) descriptors.push("Danceable");
    if (avgFeatures.acousticness > 0.7) descriptors.push("Acoustic");

    return descriptors.join(", ") || "Balanced";
  }

  addTrack(track: Track): void {
    this.tracks.push(track);
    this.updatedAt = new Date();
  }

  removeTrack(trackId: string): void {
    this.tracks = this.tracks.filter((track) => track.id !== trackId);
    this.updatedAt = new Date();
  }

  static generateName(moodInput: MoodInput): string {
    const timestamp = new Date().toLocaleDateString();

    switch (moodInput.type) {
      case "color":
        return `Color Mood - ${timestamp}`;
      case "emoji":
        return `${moodInput.value} Vibes - ${timestamp}`;
      case "emotion":
        return `${moodInput.value} Mood - ${timestamp}`;
      case "coordinate":
        return `Custom Mood - ${timestamp}`;
      default:
        return `AI Playlist - ${timestamp}`;
    }
  }
}
