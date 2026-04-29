// ============================================
//  models/JournalEntry.js
//  Stores journal entries + AI responses
// ============================================

const mongoose = require('mongoose');

const journalEntrySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // The journal text the user wrote
    content: {
      type: String,
      required: [true, 'Journal content is required'],
      minlength: [3, 'Entry is too short'],
      maxlength: [5000, 'Entry cannot exceed 5000 characters'],
    },

    // Word count — calculated automatically before save
    wordCount: {
      type: Number,
      default: 0,
    },

    // Mood at time of writing (optional link)
    moodLevel: {
      type: Number,
      min: 1,
      max: 5,
    },

    moodEmoji: {
      type: String,
    },

    // The AI-generated reflection/suggestion
    aiSuggestion: {
      type: String,
      default: '',
    },

    // Sentiment analysis result from AI
    // positive | neutral | negative
    sentiment: {
      type: String,
      enum: ['positive', 'neutral', 'negative', 'mixed'],
      default: 'neutral',
    },

    // Tags auto-extracted or manually added
    tags: [{ type: String }],

    // User can mark as favorite
    isFavorite: {
      type: Boolean,
      default: false,
    },

    // Date (without time) for daily grouping
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

// Auto-calculate word count before every save
journalEntrySchema.pre('save', function (next) {
  if (this.isModified('content')) {
    const words = this.content.trim().split(/\s+/).filter(w => w.length > 0);
    this.wordCount = words.length;
  }
  next();
});

module.exports = mongoose.model('JournalEntry', journalEntrySchema);
