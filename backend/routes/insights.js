// ============================================
//  routes/insights.js
//  Analytics: mood trends, patterns, scores
// ============================================

const express      = require('express');
const Mood         = require('../models/Mood');
const JournalEntry = require('../models/JournalEntry');
const { protect }  = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// ─────────────────────────────────────────────
//  GET /api/insights/overview
//  Full dashboard stats for the Insights page
// ─────────────────────────────────────────────
router.get('/overview', async (req, res) => {
  try {
    const userId = req.user._id;

    // Get dates
    const now          = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);

    // ── Mood Breakdown (last 30 days) ──────
    // Count how many times each mood level appeared
    const moodBreakdown = await Mood.aggregate([
      { $match: { user: userId, date: { $gte: thirtyDaysAgo } } },
      { $group: { _id: '$moodLevel', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const totalMoodEntries = moodBreakdown.reduce((sum, m) => sum + m.count, 0);

    // Convert to percentages
    const moodPercentages = moodBreakdown.map(m => ({
      level: m._id,
      count: m.count,
      percentage: totalMoodEntries
        ? Math.round((m.count / totalMoodEntries) * 100)
        : 0,
    }));

    // ── Best Day of Week ───────────────────
    const dayOfWeekData = await Mood.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id:     { $dayOfWeek: '$date' },
          avgMood: { $avg: '$moodLevel' },
          count:   { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const DAY_NAMES = ['', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const bestDay   = dayOfWeekData.reduce(
      (best, d) => (d.avgMood > best.avgMood ? d : best),
      { _id: 0, avgMood: 0 }
    );

    // ── Trigger Analysis ───────────────────
    // Find which triggers are most common when mood is low
    const triggerAnalysis = await Mood.aggregate([
      { $match: { user: userId, moodLevel: { $lte: 2 } } },
      { $unwind: '$triggers' },     // flatten array of triggers
      { $group: { _id: '$triggers', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 3 },
    ]);

    // ── Sentiment Distribution ─────────────
    const sentimentData = await JournalEntry.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$sentiment', count: { $sum: 1 } } },
    ]);

    // ── Total Counts ───────────────────────
    const totalJournalEntries = await JournalEntry.countDocuments({ user: userId });
    const totalMoodCheckins   = await Mood.countDocuments({ user: userId });

    res.json({
      moodBreakdown:     moodPercentages,
      totalMoodEntries,
      dayOfWeekData:     dayOfWeekData.map(d => ({
        day:     DAY_NAMES[d._id],
        avgMood: parseFloat(d.avgMood.toFixed(1)),
        count:   d.count,
      })),
      bestDay: {
        day:     DAY_NAMES[bestDay._id] || 'N/A',
        avgMood: parseFloat((bestDay.avgMood || 0).toFixed(1)),
      },
      topTriggers:          triggerAnalysis,
      sentimentDistribution: sentimentData,
      totalJournalEntries,
      totalMoodCheckins,
      streak:        req.user.currentStreak,
      longestStreak: req.user.longestStreak,
      wellnessScore: req.user.wellnessScore,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
//  GET /api/insights/mood-trend?days=30
//  Raw mood data for chart (array of {date, mood})
// ─────────────────────────────────────────────
router.get('/mood-trend', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const moods = await Mood
      .find({ user: req.user._id, date: { $gte: startDate } })
      .select('date moodLevel energyLevel moodEmoji')
      .sort({ date: 1 });

    res.json({ moods });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
