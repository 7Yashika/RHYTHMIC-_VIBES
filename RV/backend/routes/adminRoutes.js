const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { authenticateAdmin } = require('../middleware/adminAuth');  

// Admin Routes
router.post("/register", adminController.registerAdmin);  // Register a new admin
router.post("/login", adminController.loginAdmin);        // Admin login

// User Management Routes (Admin only)
router.post("/users", authenticateAdmin, adminController.adminCreateUser);              // Admin create a new user
router.delete("/users/:id", authenticateAdmin, adminController.deleteUser);             // Admin delete user

module.exports = router;
