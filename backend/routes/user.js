// ============================================
//  routes/user.js
//  User profile + preferences management
// ============================================

const express = require('express');
const { body, validationResult } = require('express-validator');
const User    = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// ─────────────────────────────────────────────
//  GET /api/user/profile
//  Get full user profile with stats
// ─────────────────────────────────────────────
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
//  PATCH /api/user/profile
//  Update name or avatar
// ─────────────────────────────────────────────
router.patch(
  '/profile',
  [
    body('name').optional().trim().isLength({ min: 1, max: 50 }),
    body('avatar').optional().isURL().withMessage('Avatar must be a valid URL'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, avatar } = req.body;
      const updates = {};
      if (name   !== undefined) updates.name   = name;
      if (avatar !== undefined) updates.avatar = avatar;

      const user = await User.findByIdAndUpdate(
        req.user._id,
        updates,
        { new: true, runValidators: true }
      );

      res.json({ message: 'Profile updated', user });

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// ─────────────────────────────────────────────
//  PATCH /api/user/preferences
//  Update notification, AI, dark mode settings
// ─────────────────────────────────────────────
router.patch('/preferences', async (req, res) => {
  try {
    const { reminderEnabled, reminderTime, aiSuggestions, darkMode } = req.body;

    const prefUpdates = {};
    if (reminderEnabled !== undefined) prefUpdates['preferences.reminderEnabled'] = reminderEnabled;
    if (reminderTime    !== undefined) prefUpdates['preferences.reminderTime']    = reminderTime;
    if (aiSuggestions   !== undefined) prefUpdates['preferences.aiSuggestions']   = aiSuggestions;
    if (darkMode        !== undefined) prefUpdates['preferences.darkMode']        = darkMode;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      prefUpdates,
      { new: true }
    );

    res.json({ message: 'Preferences saved', preferences: user.preferences });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
//  POST /api/user/change-password
// ─────────────────────────────────────────────
router.post(
  '/change-password',
  [
    body('currentPassword').notEmpty().withMessage('Current password required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be 6+ characters'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { currentPassword, newPassword } = req.body;

      // Get user with password included
      const user = await User.findById(req.user._id).select('+password');

      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }

      user.password = newPassword;  // pre-save hook will hash it
      await user.save();

      res.json({ message: 'Password changed successfully' });

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;
