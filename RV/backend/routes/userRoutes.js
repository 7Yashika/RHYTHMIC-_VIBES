const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// ======== AUTH ROUTES ========
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/logout', protect, userController.logout);

// ======== PROFILE ROUTES ========
router.get('/profile', protect, userController.getProfile);
router.put('/profile', protect, userController.updateProfile);
router.put('/change-password', protect, userController.changePassword);

// ======== FAVORITES ========
router.post('/favorites', protect, userController.addToFavorites);
router.delete('/favorites/:songId', protect, userController.removeFromFavorites);
router.get('/favorites', protect, userController.getFavorites);

// ======== USER PLAYLISTS ========
// router.get('/playlists', protect, userController.getUserPlaylists);

// ======== ACCOUNT ========
// router.put('/deactivate', protect, userController.deactivateAccount);

module.exports = router;
