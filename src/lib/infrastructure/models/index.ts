import mongoose from "mongoose";

// User Schema
const userSchema = new mongoose.Schema({
  spotifyId: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  email: { type: String, required: true },
  profileImage: { type: String },
  accessToken: { type: String, required: true },
  refreshToken: { type: String, required: true },
  tokenExpiresAt: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Track Schema
const trackSchema = new mongoose.Schema({
  spotifyId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  artists: [{ type: String, required: true }],
  album: { type: String, required: true },
  durationMs: { type: Number, required: true },
  popularity: { type: Number, required: true },
  previewUrl: { type: String },
  spotifyUri: { type: String },
  albumImage: { type: String },
  audioFeatures: {
    danceability: { type: Number, required: true },
    energy: { type: Number, required: true },
    valence: { type: Number, required: true },
    acousticness: { type: Number, required: true },
    instrumentalness: { type: Number, required: true },
    speechiness: { type: Number, required: true },
    tempo: { type: Number, required: true },
    loudness: { type: Number, required: true },
    key: { type: Number },
    mode: { type: Number },
    timeSignature: { type: Number },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Playlist Schema
const playlistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  spotifyPlaylistId: { type: String },
  moodInput: {
    type: {
      type: String,
      enum: ["color", "emoji", "emotion", "coordinate"],
      required: true,
    },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  tracks: [
    {
      trackId: { type: mongoose.Schema.Types.ObjectId, ref: "Track" },
      addedAt: { type: Date, default: Date.now },
    },
  ],
  audioFeatureTargets: {
    danceability: {
      min: { type: Number },
      max: { type: Number },
      target: { type: Number },
    },
    energy: {
      min: { type: Number },
      max: { type: Number },
      target: { type: Number },
    },
    valence: {
      min: { type: Number },
      max: { type: Number },
      target: { type: Number },
    },
    acousticness: {
      min: { type: Number },
      max: { type: Number },
      target: { type: Number },
    },
    instrumentalness: {
      min: { type: Number },
      max: { type: Number },
      target: { type: Number },
    },
    speechiness: {
      min: { type: Number },
      max: { type: Number },
      target: { type: Number },
    },
    tempo: {
      min: { type: Number },
      max: { type: Number },
      target: { type: Number },
    },
    loudness: {
      min: { type: Number },
      max: { type: Number },
      target: { type: Number },
    },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Create indexes only if they don't exist
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });

trackSchema.index({ name: 1 });
trackSchema.index({ artists: 1 });
trackSchema.index({ createdAt: -1 });

playlistSchema.index({ userId: 1 });
playlistSchema.index({ createdAt: -1 });
playlistSchema.index({ "moodInput.type": 1 });

// Models
export const User = mongoose.models.User || mongoose.model("User", userSchema);
export const Track =
  mongoose.models.Track || mongoose.model("Track", trackSchema);
export const Playlist =
  mongoose.models.Playlist || mongoose.model("Playlist", playlistSchema);
