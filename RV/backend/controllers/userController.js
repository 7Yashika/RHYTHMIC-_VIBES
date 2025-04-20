const User = require('../models/User');
const Song = require('../models/Song');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const sendError = (res, status, message) => {
  return res.status(status).json({ success: false, error: message });
};

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return sendError(res, 400, 'Please fill all fields');
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) return sendError(res, 400, 'User already exists');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    const token = generateToken(newUser._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        profilePicture: newUser.profilePicture,
      },
    });
  } catch (err) {
    sendError(res, 500, 'Server Error');
  }
};

exports.login = async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    const user = await User.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
    });

    if (!user) return sendError(res, 400, 'Invalid credentials');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return sendError(res, 400, 'Invalid credentials');

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
      },
    });
  } catch (err) {
    sendError(res, 500, 'Server Error');
  }
};

// Logout (client should just clear the token)
exports.logout = async (req, res) => {
  res.status(200).json({ success: true, message: 'Logout successful (token cleared on client)' });
};


exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return sendError(res, 404, 'User not found');

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    sendError(res, 500, 'Server Error');
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { username, email, profilePicture } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return sendError(res, 404, 'User not found');

    if (username && username !== user.username) {
      const exists = await User.findOne({ username });
      if (exists) return sendError(res, 400, 'Username is already taken');
      user.username = username;
    }

    if (email && email !== user.email) {
      const exists = await User.findOne({ email });
      if (exists) return sendError(res, 400, 'Email is already taken');
      user.email = email;
    }

    if (profilePicture) user.profilePicture = profilePicture;

    await user.save();

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
      },
    });
  } catch (err) {
    sendError(res, 500, 'Server Error');
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return sendError(res, 404, 'User not found');

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    sendError(res, 500, 'Server Error');
  }
};


exports.addToFavorites = async (req, res) => {
  try {
    const { songId } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return sendError(res, 404, 'User not found');

    const song = await Song.findById(songId);
    if (!song) return sendError(res, 404, 'Song not found');

    if (user.favorites.includes(songId)) {
      return sendError(res, 400, 'Song is already in favorites');
    }

    user.favorites.push(songId);
    await user.save();

    res.status(200).json({ success: true, message: 'Song added to favorites' });
  } catch (err) {
    sendError(res, 500, 'Server Error');
  }
};

exports.removeFromFavorites = async (req, res) => {
  try {
    const { songId } = req.params;
    const user = await User.findById(req.user.id);
    if (!user) return sendError(res, 404, 'User not found');

    if (!user.favorites.includes(songId)) {
      return sendError(res, 400, 'Song is not in favorites');
    }

    user.favorites = user.favorites.filter(id => id.toString() !== songId);
    await user.save();

    res.status(200).json({ success: true, message: 'Song removed from favorites' });
  } catch (err) {
    sendError(res, 500, 'Server Error');
  }
};

exports.getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('favorites', 'title artist album duration imageUrl');

    if (!user) return sendError(res, 404, 'User not found');

    res.status(200).json({
      success: true,
      count: user.favorites.length,
      data: user.favorites,
    });
  } catch (err) {
    sendError(res, 500, 'Server Error');
  }
};

// exports.getUserPlaylists = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id)
//       .populate('playlists', 'name description isPublic isFavorite tags createdAt updatedAt');

//     if (!user) return sendError(res, 404, 'User not found');

//     res.status(200).json({
//       success: true,
//       count: user.playlists.length,
//       data: user.playlists,
//     });
//   } catch (err) {
//     sendError(res, 500, 'Server Error');
//   }
// };

exports.deactivateAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return sendError(res, 404, 'User not found');

    user.accountStatus = 'deactivated';
    await user.save();

    res.status(200).json({ success: true, message: 'Account deactivated successfully' });
  } catch (err) {
    sendError(res, 500, 'Server Error');
  }
};
