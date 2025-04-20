const express = require("express");
const router = express.Router();
const songController = require("../controllers/songController");
const Song = require("../models/Song");
const Playlist = require("../models/Playlist");
const axios = require("axios");
require("dotenv").config();
// Routes
router.get("/", songController.getAllSongs); // Optional ?search= keyword
router.post("/", songController.addSong);
router.get("/:id", songController.getSongById);
// POST /api/songs/saveOrGetId
router.post('/saveOrGetId', async (req, res) => {
    const { title, artist, audioUrl, coverUrl } = req.body;
  
    try {
      let song = await Song.findOne({ title, artist });
  
      if (!song) {
        song = new Song({
          title,
          artist,
          url: audioUrl,
          albumArt: coverUrl
        });
        await song.save();
      }
  
      res.json({ songId: song._id });
    } catch (error) {
      console.error("❌ Failed to save or fetch song:", error);
      res.status(500).json({ error: 'Failed to save or fetch song' });
    }
  });
  
module.exports = router;
