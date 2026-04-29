// ============================================
//  routes/mood.js
//  Handles: Log mood, Get mood history
// ============================================

const express = require('express');
const { body, validationResult } = require('express-validator');
const Mood    = require('../models/Mood');
const User    = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All mood routes require login
router.use(protect);

// Emoji map based on mood level
const MOOD_EMOJI = { 1: '😔', 2: '😕', 3: '😐', 4: '🙂', 5: '😊' };

// ─────────────────────────────────────────────
//  POST /api/mood
//  Log today's mood
// ─────────────────────────────────────────────
router.post(
  '/',
  [
    body('moodLevel').isInt({ min: 1, max: 5 }).withMessage('Mood level must be 1–5'),
    body('energyLevel').optional().isInt({ min: 1, max: 10 }),
    body('triggers').optional().isArray(),
    body('note').optional().isLength({ max: 200 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { moodLevel, energyLevel, triggers, note } = req.body;

      // Get today's date (no time)
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Check if user already logged mood today
      // findOneAndUpdate with upsert = update if exists, create if not
      const mood = await Mood.findOneAndUpdate(
        { user: req.user._id, date: today },
        {
          moodLevel,
          energyLevel: energyLevel || 5,
          moodEmoji: MOOD_EMOJI[moodLevel],
          triggers:  triggers || [],
          note:      note || '',
        },
        { new: true, upsert: true } // upsert: create if doesn't exist
      );

      // Update the user's streak
      const user = await User.findById(req.user._id);
      user.updateStreak();

      // Recalculate wellness score
      // Simple formula: mood * 15 + energy * 5 (max 100)
      user.wellnessScore = Math.min(
        100,
        Math.round((moodLevel / 5) * 70 + (energyLevel / 10) * 30)
      );
      await user.save();

      res.status(201).json({
        message: 'Mood logged! 🌿',
        mood,
        streak:       user.currentStreak,
        wellnessScore: user.wellnessScore,
      });

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// ─────────────────────────────────────────────
//  GET /api/mood/today
//  Get today's mood entry (if logged)
// ─────────────────────────────────────────────
router.get('/today', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const mood = await Mood.findOne({ user: req.user._id, date: today });

    res.json({ mood: mood || null, checkedIn: !!mood });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
//  GET /api/mood/history?days=7
//  Get mood history for last N days
// ─────────────────────────────────────────────
router.get('/history', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;

    // Calculate start date (N days ago)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const moods = await Mood
      .find({
        user: req.user._id,
        date: { $gte: startDate },   // $gte = "greater than or equal to"
      })
      .sort({ date: 1 });            // oldest first for chart display

    // Calculate average mood for the period
    const avgMood = moods.length
      ? (moods.reduce((sum, m) => sum + m.moodLevel, 0) / moods.length).toFixed(1)
      : null;

    res.json({ moods, avgMood, totalEntries: moods.length });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
//  GET /api/mood/weekly-summary
//  Average mood grouped by day of week
//  Used for the "best day of week" chart
// ─────────────────────────────────────────────
router.get('/weekly-summary', async (req, res) => {
  try {
    // MongoDB aggregation pipeline
    // Think of it like a series of data transformations
    const summary = await Mood.aggregate([
      // Stage 1: Only this user's data
      { $match: { user: req.user._id } },

      // Stage 2: Group by day of week (1=Sun, 2=Mon, ..., 7=Sat)
      {
        $group: {
          _id: { $dayOfWeek: '$date' },
          avgMood: { $avg: '$moodLevel' },
          count:   { $sum: 1 },
        },
      },

      // Stage 3: Sort by day
      { $sort: { _id: 1 } },
    ]);

    // Map numbers to day names
    const DAY_NAMES = ['', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const result = summary.map(s => ({
      day: DAY_NAMES[s._id],
      avgMood: parseFloat(s.avgMood.toFixed(1)),
      count: s.count,
    }));

    res.json({ weeklySummary: result });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
