// routes/jamendoRoutes.js

const express = require('express');
const router = express.Router();
const jamendoController = require('../controllers/jamendoController');

// Advanced search with support for name, artist, album filters
// Example: /api/jamendo/search?q=general&name=songname&artist=artistname&album=albumname&type=all&limit=20
router.get('/search', jamendoController.searchSongs);

// Get tracks by artist name
// Example: /api/jamendo/artist/Madonna
router.get('/artist/:artistName', jamendoController.getTracksByArtist);

// Get tracks by album name
// Example: /api/jamendo/album/Like%20a%20Prayer
router.get('/album/:albumName', jamendoController.getTracksByAlbum);

// Get popular tracks from Jamendo
router.get('/popular', jamendoController.getPopularTracks);

// Get tracks by genre from Jamendo
router.get('/genre/:genre', jamendoController.getTracksByGenre);

// Get track details by ID
router.get('/track/:id', jamendoController.getTrackById);

// Save a Jamendo track to local database
router.post('/save', jamendoController.saveSong);

module.exports = router;