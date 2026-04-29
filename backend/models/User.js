// ============================================
//  models/User.js
//  Defines what a "User" looks like in MongoDB
// ============================================

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

// "Schema" = the shape/structure of a document in MongoDB
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,              // removes extra spaces
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,            // no two users can have same email
      lowercase: true,         // always store as lowercase
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,           // NEVER return password in queries by default
    },

    avatar: {
      type: String,
      default: '',
    },

    // Streak tracking
    currentStreak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
    lastCheckinDate: {
      type: Date,
      default: null,
    },

    // Wellness score (0–100, calculated from mood + journal activity)
    wellnessScore: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
    },

    // User preferences
    preferences: {
      reminderEnabled: { type: Boolean, default: true },
      reminderTime:    { type: String,  default: '21:00' },   // 9 PM
      aiSuggestions:   { type: Boolean, default: true },
      darkMode:        { type: Boolean, default: true },
    },
  },
  {
    timestamps: true, // auto-adds createdAt and updatedAt fields
  }
);

// ─── HASH PASSWORD BEFORE SAVING ──────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    // Force a simpler salt for troubleshooting
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    console.log(`🔐 Password hashed for user: ${this.email}`);
    next();
  } catch (err) {
    next(err);
  }
});

// ─── METHOD: CHECK PASSWORD ───────────────
// Call this as: user.comparePassword(inputPassword)
// Returns true if password is correct
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ─── METHOD: UPDATE STREAK ────────────────
userSchema.methods.updateStreak = function () {
  const today     = new Date();
  today.setHours(0, 0, 0, 0);

  const lastDate  = this.lastCheckinDate
    ? new Date(this.lastCheckinDate)
    : null;

  if (lastDate) {
    lastDate.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return;          // already checked in today
    if (diffDays === 1) {
      this.currentStreak += 1;           // consecutive day → increase streak
    } else {
      this.currentStreak = 1;            // gap in days → reset streak
    }
  } else {
    this.currentStreak = 1;              // first ever check-in
  }

  // Update longest streak record
  if (this.currentStreak > this.longestStreak) {
    this.longestStreak = this.currentStreak;
  }

  this.lastCheckinDate = today;
};

module.exports = mongoose.model('User', userSchema);
