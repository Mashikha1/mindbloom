// ============================================
//  routes/ai.js — FIXED & COMPLETE
//  Replace your existing routes/ai.js with this
// ============================================

const express      = require('express');
const { body, validationResult } = require('express-validator');
const OpenAI       = require('openai');
const JournalEntry = require('../models/JournalEntry');
const Mood         = require('../models/Mood');
const { protect }  = require('../middleware/auth');

const router = express.Router();
router.use(protect);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function callOpenAI(systemPrompt, userMessage, maxTokens = 300) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: maxTokens,
    temperature: 0.8,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user',   content: userMessage  },
    ],
  });
  return response.choices[0].message.content.trim();
}

// POST /api/ai/reflect
router.post('/reflect',
  [
    body('entryId').notEmpty().withMessage('Entry ID is required'),
    body('content').trim().notEmpty().withMessage('Content is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { entryId, content, moodLevel } = req.body;

      const crisisKeywords = ['suicide','kill myself','end my life','dont want to live',"don't want to live",'self harm','hurt myself','cutting','no reason to live'];
      const lowerContent = content.toLowerCase();
      const crisisDetected = crisisKeywords.some(kw => lowerContent.includes(kw));

      if (crisisDetected) {
        return res.json({
          suggestion: "I'm really glad you're sharing this, and I'm genuinely concerned about you right now. Please reach out — iCall: 9152987821 or Vandrevala Foundation: 1860-2662-345. You don't have to face this alone. 💙",
          sentiment: 'negative',
          isCrisis: true,
        });
      }

      const moodContext = moodLevel ? `The user's current mood level is ${moodLevel}/5.` : '';
      const systemPrompt = `You are MindBloom, a compassionate mental wellness companion. Give gentle, supportive reflections. Be empathetic, warm, and non-clinical. Keep responses to 2-3 sentences. Never diagnose. ${moodContext}`;

      const reflection = await callOpenAI(systemPrompt, `The user wrote: "${content}"\n\nProvide a warm reflection.`);
      const sentimentRaw = await callOpenAI('You are a sentiment classifier. Respond with exactly one word: positive, negative, neutral, or mixed.', `Classify: "${content}"`);
      const sentiment = ['positive','negative','neutral','mixed'].find(s => sentimentRaw.toLowerCase().includes(s)) || 'neutral';

      await JournalEntry.findOneAndUpdate({ _id: entryId, user: req.user._id }, { aiSuggestion: reflection, sentiment });

      res.json({ suggestion: reflection, sentiment, isCrisis: false });
    } catch (err) {
      console.error('OpenAI error:', err.message);
      res.json({ suggestion: "Thank you for sharing today. Whatever you're feeling is completely valid. Take a moment to breathe — you're doing better than you think. 🌿", sentiment: 'neutral', isCrisis: false, fallback: true });
    }
  }
);

// POST /api/ai/affirmation
router.post('/affirmation', async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentMoods = await Mood.find({ user: req.user._id, date: { $gte: sevenDaysAgo } }).sort({ date: -1 }).limit(7);
    const avgMood = recentMoods.length ? recentMoods.reduce((s, m) => s + m.moodLevel, 0) / recentMoods.length : 3;

    let moodContext = 'The user has been feeling okay lately.';
    if (avgMood <= 2)      moodContext = 'The user has been struggling lately and needs extra encouragement.';
    else if (avgMood >= 4) moodContext = 'The user has been doing well and should be celebrated.';

    const affirmation = await callOpenAI(
      `You create short powerful personalized affirmations for a mental wellness app. ${moodContext} Rules: 1-2 sentences. Warm and personal. No clichés. Start with "You" or a direct statement.`,
      'Create one unique affirmation for this user.'
    );
    res.json({ affirmation });
  } catch (err) {
    const fallbacks = ['You are carrying more strength than you realize right now.','Every small step you take today is proof of your resilience.','You deserve the same kindness you give to everyone else.'];
    res.json({ affirmation: fallbacks[Math.floor(Math.random() * fallbacks.length)], fallback: true });
  }
});

// POST /api/ai/breathing-tip
router.post('/breathing-tip', async (req, res) => {
  try {
    const { moodLevel, energyLevel } = req.body;
    const tip = await callOpenAI(
      'You give short calming tips before breathing exercises. 1 sentence only. Warm tone.',
      `User mood: ${moodLevel || 3}/5, energy: ${energyLevel || 5}/10. Give a gentle tip.`
    );
    res.json({ tip });
  } catch (err) {
    res.json({ tip: "Find a comfortable position. Let your shoulders drop. You're safe here. 🌿", fallback: true });
  }
});

// POST /api/ai/gratitude-prompt  ← THIS WAS MISSING/BROKEN
router.post('/gratitude-prompt', async (req, res) => {
  try {
    const prompt = await callOpenAI(
      'You create thoughtful gratitude journal prompts. One question only. Warm and specific. Must end with "?".',
      'Create a unique gratitude reflection prompt for someone doing a mental wellness check-in.'
    );
    res.json({ prompt });
  } catch (err) {
    const fallbacks = [
      'What is one small thing that made you smile today?',
      'Who is someone that has genuinely supported you recently?',
      'What is one thing your body did for you today that you are grateful for?',
      'What is one challenge you faced this week that made you stronger?',
    ];
    res.json({ prompt: fallbacks[Math.floor(Math.random() * fallbacks.length)], fallback: true });
  }
});

module.exports = router;
