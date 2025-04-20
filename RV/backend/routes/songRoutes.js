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

module.exports = router;
