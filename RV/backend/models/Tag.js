const mongoose = require("mongoose");

const tagSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  playlists: [{ type: mongoose.Schema.Types.ObjectId, ref: "Playlist" }],
  createdAt: { type: Date, default: Date.now }
});

// Text index for searching tags
tagSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model("Tag", tagSchema);