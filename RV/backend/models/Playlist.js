const mongoose = require("mongoose");

const songNodeSchema = new mongoose.Schema({
  song: { type: mongoose.Schema.Types.ObjectId, ref: "Song" },
  prev: { type: mongoose.Schema.Types.ObjectId, ref: "SongNode", default: null },
  next: { type: mongoose.Schema.Types.ObjectId, ref: "SongNode", default: null },
});

const playlistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  isPublic: { type: Boolean, default: false },
  isFavorite: { type: Boolean, default: false },
  tags: [String],
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  songs: [songNodeSchema],
  head: { type: mongoose.Schema.Types.ObjectId, ref: "SongNode", default: null }, // Reference to first song in playlist
  tail: { type: mongoose.Schema.Types.ObjectId, ref: "SongNode", default: null }, // Reference to last song in playlist
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Pre-save middleware to update the updatedAt field
playlistSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Playlist", playlistSchema);