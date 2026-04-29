// ============================================
//  routes/auth.js
//  Handles: Register, Login, Get current user
// ============================================

const express  = require('express');
const jwt      = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User     = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// ─── HELPER: CREATE JWT TOKEN ─────────────
// Creates a signed token with user's ID inside
// Expires in whatever JWT_EXPIRES_IN is set to (.env)
const createToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// ─────────────────────────────────────────────
//  POST /api/auth/register
//  Create a new account
// ─────────────────────────────────────────────
router.post(
  '/register',
  [
    // Validation rules using express-validator
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  async (req, res) => {
    try {
      // Check if validation failed
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, email, password } = req.body;

      // Check if email already registered
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ error: 'Email already registered' });
      }

      // Create user — password gets hashed automatically (see User model)
      const user = await User.create({ name, email, password });

      // Create token
      const token = createToken(user._id);

      res.status(201).json({
        message: 'Account created successfully! 🌸',
        token,
        user: {
          id:           user._id,
          name:         user.name,
          email:        user.email,
          currentStreak: user.currentStreak,
          wellnessScore: user.wellnessScore,
        },
      });

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// ─────────────────────────────────────────────
//  POST /api/auth/login
//  Login with email + password
// ─────────────────────────────────────────────
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Find user — we need password so we use .select('+password')
      // (password has select:false in schema, so we explicitly include it)
      const user = await User.findOne({ email }).select('+password');

      if (!user) {
        console.log(`🔍 Login failed: User not found (${email})`);
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Check password using our model method
      const isMatch = await user.comparePassword(password);
      
      // DEBUG: Log the result
      console.log(`🔍 Login attempt for: ${email}`);
      console.log(`🔍 Password match result: ${isMatch}`);

      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const token = createToken(user._id);

      res.json({
        message: `Welcome back, ${user.name}! 🌿`,
        token,
        user: {
          id:            user._id,
          name:          user.name,
          email:         user.email,
          currentStreak: user.currentStreak,
          longestStreak: user.longestStreak,
          wellnessScore: user.wellnessScore,
          preferences:   user.preferences,
        },
      });

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// ─────────────────────────────────────────────
//  GET /api/auth/me
//  Get currently logged-in user's info
//  Protected — needs valid token
// ─────────────────────────────────────────────
router.get('/me', protect, async (req, res) => {
  try {
    // req.user is set by the protect middleware
    res.json({ user: req.user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
