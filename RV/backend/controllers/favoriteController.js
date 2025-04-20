const Favorite = require("../models/Favorite");

// Add a song to favorites
exports.addFavorite = async (req, res) => {
  try {
    const { userId, songId } = req.body;
    const favorite = await Favorite.create({ user: userId, song: songId });
    res.status(201).json(favorite);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Song already favorited" });
    }
    res.status(500).json({ error: error.message });
  }
};

// Get all favorite songs for a user
exports.getFavoritesByUser = async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.params.userId }).populate("song");
    res.status(200).json(favorites);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Remove a song from favorites
exports.removeFavorite = async (req, res) => {
  try {
    const { userId, songId } = req.body;
    const result = await Favorite.findOneAndDelete({ user: userId, song: songId });
    if (!result) return res.status(404).json({ message: "Favorite not found" });
    res.status(200).json({ message: "Favorite removed" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
