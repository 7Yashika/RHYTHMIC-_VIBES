const Song = require("../models/Song");

// Get all songs (optionally filter by query)
exports.getAllSongs = async (req, res) => {
  try {
    const search = req.query.search;
    let query = {};

    if (search) {
      query = { $text: { $search: search } };
    }

    const songs = await Song.find(query).limit(50).sort({ createdAt: -1 });
    res.json(songs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch songs" });
  }
};

// Add a new song (from Jamendo API result)
exports.addSong = async (req, res) => {
  try {
    const {
      title,
      artist,
      album,
      genre,
      url,
      albumArt,
      duration,
      releaseDate,
      externalId,
      metadata
    } = req.body;

    // Check if already exists
    const existing = await Song.findOne({ externalId });
    if (existing) return res.status(200).json(existing);

    const song = new Song({
      title,
      artist,
      album,
      genre,
      url,
      albumArt,
      duration,
      releaseDate,
      externalId,
      metadata
    });

    await song.save();
    res.status(201).json(song);
  } catch (err) {
    console.error("Add song error:", err);
    res.status(500).json({ error: "Failed to add song" });
  }
};

// Get song by ID
exports.getSongById = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) return res.status(404).json({ error: "Song not found" });
    res.json(song);
  } catch (err) {
    res.status(500).json({ error: "Error retrieving song" });
  }
};
