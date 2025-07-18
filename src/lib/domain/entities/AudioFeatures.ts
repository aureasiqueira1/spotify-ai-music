export class AudioFeatures {
  constructor(
    public danceability: number, // 0.0 - 1.0
    public energy: number, // 0.0 - 1.0
    public valence: number, // 0.0 - 1.0 (positivity)
    public acousticness: number, // 0.0 - 1.0
    public instrumentalness: number, // 0.0 - 1.0
    public speechiness: number, // 0.0 - 1.0
    public tempo: number, // BPM
    public loudness: number // dB
  ) {}
}
