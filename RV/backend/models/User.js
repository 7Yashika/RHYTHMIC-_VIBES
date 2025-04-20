const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Hashed password
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  accountStatus: { type: String, enum: ['active', 'deactivated', 'locked'], default: 'active' },
  playlists: [{ type: mongoose.Schema.Types.ObjectId, ref: "Playlist" }],
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Song" }], // Direct reference to favorite songs
  profilePicture: { type: String ,default: "/images/default-avatar.png"},
  loginAttempts: { type: Number, default: 0 },
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  
});

// Pre-save middleware to update the updatedAt field
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("User", userSchema);