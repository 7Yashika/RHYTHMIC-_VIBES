const express = require("express");
const router = express.Router();
const favoriteController = require("../controllers/favoriteController");

router.post("/", favoriteController.addFavorite);
router.get("/:userId", favoriteController.getFavoritesByUser);
router.delete("/", favoriteController.removeFavorite);

module.exports = router;
