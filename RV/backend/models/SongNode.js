const mongoose = require("mongoose");

const songNodeSchema = new mongoose.Schema({
  song: { type: mongoose.Schema.Types.ObjectId, ref: "Song", required: true },
  playlist: { type: mongoose.Schema.Types.ObjectId, ref: "Playlist", required: true },
  prev: { type: mongoose.Schema.Types.ObjectId, ref: "SongNode", default: null },
  next: { type: mongoose.Schema.Types.ObjectId, ref: "SongNode", default: null },
  addedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("SongNode", songNodeSchema);