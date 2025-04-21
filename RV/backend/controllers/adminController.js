const Admin = require('../models/Admin');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Include User model
const SECRET_KEY = process.env.JWT_SECRET // Use env in production

// Register a new admin
exports.registerAdmin = async (req, res) => {
  try {
    const { admin_name, email, password } = req.body;

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) return res.status(400).json({ message: 'Admin already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({ admin_name, email, password: hashedPassword });
    await newAdmin.save();

    // await Log.create({
    //   activity_description: `New admin ${email} registered`,
    //   admin_id: newAdmin._id,
    // });

    res.status(201).json({ message: 'Admin registered successfully' });
  } catch (error) {
    console.error("Register Admin Error:", error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Login admin
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ adminId: admin._id }, SECRET_KEY, { expiresIn: '1h' });

    // await Log.create({
    //   activity_description: `Admin ${email} logged in`,
    //   admin_id: admin._id,
    // });

    res.json({ token });
  } catch (error) {
    console.error("Login Admin Error:", error.message);
    res.status(500).json({ message: 'Server error' });
  }
};


// Admin: Create User (Manage Users)
exports.adminCreateUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    // Hash password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      isActive: true, // Ensure new user is active by default
    });

    await newUser.save();

    res.status(201).json({ message: "User created successfully by admin" });
  } catch (error) {
    console.error("Admin Create User Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};


// Admin: Delete User (Manage Users)
exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await User.findByIdAndDelete(id);

    res.json({ message: `User with ID ${id} deleted successfully` });
  } catch (error) {
    console.error("Delete User Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

