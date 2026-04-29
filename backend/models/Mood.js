// ============================================
//  models/Mood.js
//  Stores each daily mood check-in
// ============================================

const mongoose = require('mongoose');

const moodSchema = new mongoose.Schema(
  {
    // Which user this belongs to
    // "ref: 'User'" means this links to the User model
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,   // index = faster database lookups by user
    },

    // Mood level 1–5 (1=terrible, 5=great)
    moodLevel: {
      type: Number,
      required: [true, 'Mood level is required'],
      min: 1,
      max: 5,
    },

    // Emoji label for the mood
    moodEmoji: {
      type: String,
      enum: ['😔', '😕', '😐', '🙂', '😊'],
    },

    // Energy level 1–10
    energyLevel: {
      type: Number,
      min: 1,
      max: 10,
      default: 5,
    },

    // What factors affected mood today (user can select multiple)
    triggers: [{
      type: String,
      enum: ['sleep', 'studies', 'exercise', 'social', 'food', 'weather', 'work', 'family', 'health', 'other'],
    }],

    // Short optional note with mood
    note: {
      type: String,
      maxlength: 200,
      default: '',
    },

    // Store the date separately for easy daily queries
    // We strip time so "today" is always comparable
    date: {
      type: Date,
      default: () => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
      },
    },
  },
  {
    timestamps: true,
  }
);

// Compound index: one mood entry per user per day
// This prevents duplicate check-ins on the same day
moodSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Mood', moodSchema);
