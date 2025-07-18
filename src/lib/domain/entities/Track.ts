export class Track {
  constructor(
    public id: string,
    public name: string,
    public artists: string[],
    public album: string,
    public audioFeatures: AudioFeatures,
    public durationMs: number,
    public popularity: number,
    public previewUrl: string,
    public spotifyUri: string,
    public albumImage: string
  ) {}

  getDurationMinutes(): string {
    const minutes = Math.floor(this.durationMs / 60000);
    const seconds = Math.floor((this.durationMs % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }

  getArtistsString(): string {
    return this.artists.join(", ");
  }

  static fromSpotifyTrack(spotifyTrack: any, audioFeatures: any): Track {
    return new Track(
      spotifyTrack.id,
      spotifyTrack.name,
      spotifyTrack.artists.map((artist: any) => artist.name),
      spotifyTrack.album.name,
      AudioFeatures.fromSpotifyAudioFeatures(audioFeatures),
      spotifyTrack.duration_ms,
      spotifyTrack.popularity,
      spotifyTrack.preview_url,
      spotifyTrack.uri,
      spotifyTrack.album.images?.[0]?.url
    );
  }
}

export class AudioFeatures {
  constructor(
    public danceability: number,
    public energy: number,
    public valence: number,
    public acousticness: number,
    public instrumentalness: number,
    public speechiness: number,
    public tempo: number,
    public loudness: number,
    public key?: number,
    public mode?: number,
    public timeSignature?: number
  ) {}

  static fromSpotifyAudioFeatures(spotifyFeatures: any): AudioFeatures {
    return new AudioFeatures(
      spotifyFeatures.danceability,
      spotifyFeatures.energy,
      spotifyFeatures.valence,
      spotifyFeatures.acousticness,
      spotifyFeatures.instrumentalness,
      spotifyFeatures.speechiness,
      spotifyFeatures.tempo,
      spotifyFeatures.loudness,
      spotifyFeatures.key,
      spotifyFeatures.mode,
      spotifyFeatures.time_signature
    );
  }

  getEmotionalProfile(): string {
    const profiles = [];

    if (this.valence > 0.7) profiles.push("Happy");
    else if (this.valence < 0.3) profiles.push("Sad");

    if (this.energy > 0.7) profiles.push("Energetic");
    else if (this.energy < 0.3) profiles.push("Calm");

    if (this.danceability > 0.7) profiles.push("Danceable");
    if (this.acousticness > 0.7) profiles.push("Acoustic");

    return profiles.join(", ") || "Neutral";
  }
}
