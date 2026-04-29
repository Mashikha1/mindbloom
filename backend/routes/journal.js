// ============================================
//  routes/journal.js
//  Handles: Create, Read, Update, Delete entries
// ============================================

const express = require('express');
const { body, validationResult } = require('express-validator');
const JournalEntry = require('../models/JournalEntry');
const { protect }  = require('../middleware/auth');

const router = express.Router();

// All journal routes require login
router.use(protect);

// ─────────────────────────────────────────────
//  POST /api/journal
//  Create a new journal entry
// ─────────────────────────────────────────────
router.post(
  '/',
  [
    body('content')
      .trim()
      .notEmpty().withMessage('Journal content is required')
      .isLength({ min: 3 }).withMessage('Entry is too short')
      .isLength({ max: 5000 }).withMessage('Entry too long (max 5000 chars)'),
    body('moodLevel').optional().isInt({ min: 1, max: 5 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { content, moodLevel, moodEmoji } = req.body;

      const entry = await JournalEntry.create({
        user:      req.user._id,
        content,
        moodLevel: moodLevel || null,
        moodEmoji: moodEmoji || null,
      });

      res.status(201).json({
        message: 'Entry saved! ✨',
        entry,
      });

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// ─────────────────────────────────────────────
//  GET /api/journal
//  Get all journal entries (paginated)
//  Query params: page, limit, mood, favorite
// ─────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const page      = parseInt(req.query.page)  || 1;
    const limit     = parseInt(req.query.limit) || 10;
    const skip      = (page - 1) * limit;

    // Build filter object
    const filter = { user: req.user._id };

    // Optional: filter by mood level
    if (req.query.mood) {
      filter.moodLevel = parseInt(req.query.mood);
    }

    // Optional: filter favorites only
    if (req.query.favorite === 'true') {
      filter.isFavorite = true;
    }

    // Get total count for pagination info
    const total = await JournalEntry.countDocuments(filter);

    const entries = await JournalEntry
      .find(filter)
      .sort({ createdAt: -1 })    // newest first
      .skip(skip)
      .limit(limit);

    res.json({
      entries,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalEntries: total,
        hasMore: page * limit < total,
      },
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
//  GET /api/journal/:id
//  Get a single entry by ID
// ─────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const entry = await JournalEntry.findOne({
      _id:  req.params.id,
      user: req.user._id,         // ensure user owns this entry
    });

    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    res.json({ entry });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
//  PATCH /api/journal/:id
//  Update an entry (content or favorite status)
// ─────────────────────────────────────────────
router.patch('/:id', async (req, res) => {
  try {
    const { content, isFavorite, aiSuggestion, sentiment } = req.body;

    // Build update object with only provided fields
    const updates = {};
    if (content      !== undefined) updates.content      = content;
    if (isFavorite   !== undefined) updates.isFavorite   = isFavorite;
    if (aiSuggestion !== undefined) updates.aiSuggestion = aiSuggestion;
    if (sentiment    !== undefined) updates.sentiment    = sentiment;

    const entry = await JournalEntry.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      updates,
      { new: true, runValidators: true }
    );

    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    res.json({ message: 'Entry updated', entry });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
//  DELETE /api/journal/:id
//  Delete a journal entry
// ─────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const entry = await JournalEntry.findOneAndDelete({
      _id:  req.params.id,
      user: req.user._id,
    });

    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    res.json({ message: 'Entry deleted' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
