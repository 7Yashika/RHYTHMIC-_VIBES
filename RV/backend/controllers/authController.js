// const User = require('../models/User');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const SystemLog = require('../models/SystemLog');

// exports.register = async (req, res) => {
//   try {
//     const { username, email, password } = req.body;

//     // Check if user already exists
//     const existingUser = await User.findOne({ $or: [{ email }, { username }] });
//     if (existingUser) {
//       return res.status(400).json({
//         success: false,
//         message: 'User already exists'
//       });
//     }

//     // Hash password
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     // Create new user
//     const user = new User({
//       username,
//       email,
//       password: hashedPassword
//     });

//     await user.save();

//     // Log the registration
//     await new SystemLog({
//       action: 'USER_REGISTER',
//       user: user._id,
//       details: { username, email },
//       ipAddress: req.ip
//     }).save();

//     // Create token
//     const token = jwt.sign(
//       { id: user._id, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: '1d' }
//     );

//     res.status(201).json({
//       success: true,
//       message: 'User registered successfully',
//       token,
//       user: {
//         id: user._id,
//         username: user.username,
//         email: user.email,
//         role: user.role
//       }
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Error registering user',
//       error: error.message
//     });
//   }
// };

// exports.login = async (req, res) => {
//   try {
//     const { username, password } = req.body;

//     // Find user
//     const user = await User.findOne({ username });
//     if (!user) {
//       return res.status(401).json({
//         success: false,
//         message: 'Invalid credentials'
//       });
//     }

//     // Check if account is active
//     if (user.accountStatus !== 'active') {
//       return res.status(401).json({
//         success: false,
//         message: `Account is ${user.accountStatus}`
//       });
//     }

//     // Check password
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       // Increment login attempts
//       user.loginAttempts += 1;
      
//       // Lock account after 5 failed attempts
//       if (user.loginAttempts >= 5) {
//         user.accountStatus = 'locked';
//       }
      
//       await user.save();
      
//       return res.status(401).json({
//         success: false,
//         message: 'Invalid credentials'
//       });
//     }

//     // Reset login attempts on successful login
//     user.loginAttempts = 0;
//     user.lastLogin = Date.now();
//     await user.save();

//     // Log the login
//     await new SystemLog({
//       action: 'USER_LOGIN',
//       user: user._id,
//       details: { username },
//       ipAddress: req.ip,
//       userAgent: req.headers['user-agent']
//     }).save();

//     // Create token
//     const token = jwt.sign(
//       { id: user._id, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: '1d' }
//     );

//     res.json({
//       success: true,
//       message: 'Login successful',
//       token,
//       user: {
//         id: user._id,
//         username: user.username,
//         email: user.email,
//         role: user.role
//       }
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Error during login',
//       error: error.message
//     });
//   }
// };
