const express = require('express');
const router = express.Router();
const { 
  getUserPlaylists, 
  getPlaylist, 
  createPlaylist, 
  updatePlaylist, 
  deletePlaylist,
  addSong,
  removeSong,
  reorderSongs
} = require('../controllers/playlistController');
const { protect } = require('../middleware/authMiddleware');

// Apply auth middleware to all routes
router.use(protect);

// Basic CRUD routes
router.route('/')
  .get(getUserPlaylists)
  .post(createPlaylist);

router.route('/:id')
  .get(getPlaylist)
  .put(updatePlaylist)
  .delete(deletePlaylist);

// Song management routes
router.route('/:id/add')
  .post(addSong);

router.route('/:id/songs/:songNodeId')
  .delete(removeSong);

router.route('/:id/reorder')
  .post(reorderSongs);

module.exports = router;