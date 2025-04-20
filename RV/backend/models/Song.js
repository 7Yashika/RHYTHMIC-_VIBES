const mongoose = require("mongoose");

const songSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artist: { type: String, required: true },
  album: { type: String },
  genre: { type: String },
  url: { type: String, required: true },
  albumArt: { type: String }, // URL to album artwork
  duration: { type: Number }, // Duration in seconds
  releaseDate: { type: Date },
  playlists: [{ type: mongoose.Schema.Types.ObjectId, ref: "Playlist" }],
  metadata: { type: mongoose.Schema.Types.Mixed }, // For storing additional metadata
  externalId: { type: String }, // ID from external API
  createdAt: { type: Date, default: Date.now }
});

// Index for searching songs
songSchema.index({ title: 'text', artist: 'text', album: 'text', genre: 'text' });

module.exports = mongoose.model("Song", songSchema);