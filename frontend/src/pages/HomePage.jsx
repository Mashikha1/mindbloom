// ============================================
//  src/pages/HomePage.jsx
//  Main dashboard: mood check-in, journal,
//  AI reflection, streak, mood chart,
//  affirmation, crisis banner
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { moodAPI, journalAPI, aiAPI, insightsAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Card, SectionLabel, BtnPrimary, BtnIcon, EmptyState } from '../components/ui/Card';
import toast from 'react-hot-toast';

const MOOD_OPTIONS = [
  { level: 1, emoji: '😔', label: 'Low',   color: 'var(--rose)'    },
  { level: 2, emoji: '😕', label: 'Meh',   color: '#e8a87c'        },
  { level: 3, emoji: '😐', label: 'Okay',  color: 'var(--amber)'   },
  { level: 4, emoji: '🙂', label: 'Good',  color: 'var(--sage)'    },
  { level: 5, emoji: '😊', label: 'Great', color: '#7fcc9a'        },
];

const AFFIRMATIONS = [
  '"You are allowed to be both a masterpiece and a work in progress simultaneously."',
  '"Your mental health is a priority. Your happiness is essential."',
  '"Not every day will be good, but there is something good in every day."',
  '"You survived 100% of your worst days. You\'re doing better than you think."',
  '"Healing is not linear. Be patient with yourself."',
  '"You are enough, just as you are, in this moment."',
];

export default function HomePage() {
  const { user, updateUser } = useAuth();

  // Mood state
  const [selectedMood,  setSelectedMood]  = useState(null);
  const [energyLevel,   setEnergyLevel]   = useState(6);
  const [moodLogged,    setMoodLogged]    = useState(false);

  // Journal state
  const [journalText,   setJournalText]   = useState('');
  const [journalEntry,  setJournalEntry]  = useState(null); // saved entry from DB
  const [aiSuggestion,  setAiSuggestion]  = useState('');
  const [aiLoading,     setAiLoading]     = useState(false);

  // Chart data
  const [chartData,     setChartData]     = useState([]);

  // Affirmation
  const [affirmIdx,     setAffirmIdx]     = useState(0);
  const [affirmLoading, setAffirmLoading] = useState(false);
  const [customAffirm,  setCustomAffirm]  = useState('');

  // Greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  // Load today's mood + chart on mount
  useEffect(() => {
    loadTodayMood();
    loadChartData();
  }, []);

  const loadTodayMood = async () => {
    try {
      const { data } = await moodAPI.getToday();
      if (data.checkedIn) {
        setSelectedMood(data.mood.moodLevel);
        setEnergyLevel(data.mood.energyLevel);
        setMoodLogged(true);
      }
    } catch { /* silently fail */ }
  };

  const loadChartData = async () => {
    try {
      const { data } = await insightsAPI.moodTrend(7);
      const formatted = data.moods.map(m => ({
        day:  new Date(m.date).toLocaleDateString('en', { weekday: 'short' }),
        mood: m.moodLevel,
      }));
      setChartData(formatted);
    } catch { /* silently fail */ }
  };

  // Log mood to backend
  const handleMoodSelect = async (level) => {
    setSelectedMood(level);
    try {
      const { data } = await moodAPI.log({ moodLevel: level, energyLevel });
      setMoodLogged(true);
      updateUser({ currentStreak: data.streak, wellnessScore: data.wellnessScore });
      const msgs = [
        "It's okay to feel this way 💙",
        "Hang in there, it gets better 🌤️",
        'Steady as you go! 😌',
        "You're doing well 🌿",
        'Love that energy! ✨',
      ];
      toast.success(msgs[level - 1]);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not save mood');
    }
  };

  // Save journal + get AI reflection
  const handleJournalSubmit = async () => {
    if (!journalText.trim()) { toast.error('Write something first! ✏️'); return; }
    setAiLoading(true);
    try {
      // 1. Save the journal entry
      const { data: saved } = await journalAPI.create({
        content:   journalText,
        moodLevel: selectedMood,
      });
      setJournalEntry(saved.entry);

      // 2. Get AI reflection
      const { data: ai } = await aiAPI.reflect({
        entryId: saved.entry._id,
        content: journalText,
        moodLevel: selectedMood,
      });

      // Crisis check
      if (ai.isCrisis) {
        toast('💙 Please reach out for support', { icon: '💙', duration: 6000 });
      }

      setAiSuggestion(ai.suggestion);
    } catch (err) {
      toast.error('Could not get AI reflection. Check your API key.');
      setAiSuggestion("Thank you for sharing. Whatever you're feeling is completely valid. 🌿");
    } finally {
      setAiLoading(false);
    }
  };

  // Get personalized affirmation from AI
  const handleNewAffirmation = async () => {
    setAffirmLoading(true);
    try {
      const { data } = await aiAPI.affirmation();
      setCustomAffirm(data.affirmation);
    } catch {
      setAffirmIdx(i => (i + 1) % AFFIRMATIONS.length);
    } finally {
      setAffirmLoading(false);
    }
  };

  const wordCount = journalText.trim()
    ? journalText.trim().split(/\s+/).filter(Boolean).length
    : 0;

  return (
    <div style={{ padding: '0 0 8px' }}>

      {/* GREETING */}
      <div style={{ padding: '8px 24px 24px' }}>
        <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--amber)', marginBottom: '6px' }}>
          {greeting}
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', lineHeight: 1.3, marginBottom: '4px' }}>
          How are you feeling<br /><em style={{ color: 'var(--amber)' }}>today?</em>
        </h1>
        <p style={{ fontFamily: 'var(--font-hand)', fontSize: '17px', color: 'var(--text-soft)' }}>
          Every feeling is valid 🌿
        </p>
      </div>

      {/* MOOD CHECK-IN */}
      <div style={{ padding: '0 24px 20px' }}>
        <SectionLabel>Today's Check-in</SectionLabel>
        <Card>
          {moodLogged && (
            <div style={{
              position: 'absolute', top: '12px', right: '12px',
              background: 'var(--sage-soft)', borderRadius: '8px',
              padding: '3px 8px', fontSize: '10px', color: 'var(--sage)',
              fontWeight: 600, letterSpacing: '0.08em',
            }}>
              ✓ LOGGED
            </div>
          )}
          <p style={{ fontSize: '14px', color: 'var(--text-soft)', marginBottom: '16px' }}>
            Pick the emoji that feels most like you right now
          </p>

          {/* Emoji row */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
            {MOOD_OPTIONS.map(m => (
              <button
                key={m.level}
                onClick={() => handleMoodSelect(m.level)}
                style={{
                  flex:           1,
                  height:         '54px',
                  borderRadius:   'var(--radius-md)',
                  border:         selectedMood === m.level
                    ? `1.5px solid ${m.color}`
                    : '1.5px solid transparent',
                  background:     selectedMood === m.level
                    ? `${m.color}22`
                    : 'var(--card2)',
                  cursor:         'pointer',
                  display:        'flex',
                  flexDirection:  'column',
                  alignItems:     'center',
                  justifyContent: 'center',
                  gap:            '2px',
                  transition:     'all 0.2s',
                  transform:      selectedMood === m.level ? 'translateY(-2px)' : 'none',
                }}
              >
                <span style={{ fontSize: '20px' }}>{m.emoji}</span>
                <span style={{
                  fontSize:  '8px',
                  color:     selectedMood === m.level ? m.color : 'var(--text-faint)',
                  letterSpacing: '0.05em',
                  fontWeight: 500,
                }}>{m.label}</span>
              </button>
            ))}
          </div>

          {/* Energy slider */}
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-faint)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Energy level
            </div>
            <input
              type="range" min="1" max="10"
              value={energyLevel}
              onChange={e => setEnergyLevel(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--amber)', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-faint)' }}>Drained</span>
              <span style={{ fontSize: '13px', color: 'var(--amber)', fontFamily: 'var(--font-hand)' }}>
                {energyLevel} / 10
              </span>
              <span style={{ fontSize: '10px', color: 'var(--text-faint)' }}>Energized</span>
            </div>
          </div>
        </Card>
      </div>

      {/* JOURNAL */}
      <div style={{ padding: '0 24px 20px' }}>
        <SectionLabel>Journal Entry</SectionLabel>
        <Card>
          {/* Top bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 500 }}>
              <div style={{ width: '24px', height: '24px', background: 'var(--sage-soft)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>📝</div>
              Write freely...
            </div>
            <span style={{ fontFamily: 'var(--font-hand)', fontSize: '14px', color: 'var(--text-faint)' }}>
              {wordCount} words
            </span>
          </div>

          <textarea
            value={journalText}
            onChange={e => setJournalText(e.target.value)}
            placeholder="What's on your mind today? No judgment here. This is your safe space..."
            rows={5}
            style={{
              width:        '100%',
              background:   'var(--card2)',
              border:       '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding:      '14px 16px',
              fontFamily:   'var(--font-hand)',
              fontSize:     '17px',
              color:        'var(--text)',
              resize:       'none',
              outline:      'none',
              lineHeight:   1.7,
              transition:   'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = 'rgba(127,181,160,0.4)'}
            onBlur={e  => e.target.style.borderColor = 'var(--border)'}
          />

          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <BtnPrimary onClick={handleJournalSubmit} loading={aiLoading} style={{ flex: 1 }}>
              ✨ Get AI Reflection
            </BtnPrimary>
            <BtnIcon onClick={() => toast('🎙️ Voice journaling coming soon!')} title="Voice note">🎙️</BtnIcon>
          </div>
        </Card>
      </div>

      {/* AI SUGGESTION */}
      {aiSuggestion && (
        <div style={{ padding: '0 24px 20px' }} className="fade-up">
          <div style={{
            background: 'linear-gradient(135deg, rgba(155,142,196,0.12), rgba(107,174,214,0.08))',
            borderRadius: 'var(--radius-lg)',
            padding: '18px 20px',
            border: '1px solid rgba(155,142,196,0.2)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <div style={{
                width: '24px', height: '24px', borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--lavender), var(--sky))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', animation: 'breathe 3s ease-in-out infinite',
              }}>✦</div>
              <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--lavender)' }}>
                MindBloom Reflection
              </span>
            </div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '14px', lineHeight: 1.7, color: 'var(--text-soft)', fontStyle: 'italic' }}>
              {aiSuggestion}
            </p>
          </div>
        </div>
      )}

      {/* STREAK + WELLNESS */}
      <div style={{ padding: '0 24px 20px' }}>
        <SectionLabel>Your Progress</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <Card style={{ padding: '16px' }}>
            <div style={{ fontSize: '22px', marginBottom: '8px' }}>🔥</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '28px', lineHeight: 1 }}>
              {user?.currentStreak || 0} <span style={{ fontSize: '14px', color: 'var(--text-faint)' }}>days</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-faint)', marginTop: '4px' }}>Journal streak</div>
          </Card>

          <Card style={{ padding: '16px' }}>
            <div style={{ fontSize: '22px', marginBottom: '8px' }}>💚</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '28px', lineHeight: 1 }}>
              {user?.wellnessScore || 50} <span style={{ fontSize: '14px', color: 'var(--text-faint)' }}>/ 100</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-faint)', marginTop: '4px' }}>Wellness score</div>
            <div style={{ marginTop: '10px', height: '4px', background: 'var(--card2)', borderRadius: '2px' }}>
              <div style={{
                height: '100%',
                width:  `${user?.wellnessScore || 50}%`,
                background: 'linear-gradient(90deg, var(--sage), var(--amber))',
                borderRadius: '2px',
                transition: 'width 1s ease',
              }} />
            </div>
          </Card>
        </div>
      </div>

      {/* MOOD CHART */}
      {chartData.length > 0 && (
        <div style={{ padding: '0 24px 20px' }}>
          <SectionLabel>Mood This Week</SectionLabel>
          <Card>
            <ResponsiveContainer width="100%" height={120}>
              <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -30 }}>
                <defs>
                  <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#f4a947" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f4a947" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fill: 'var(--text-faint)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis domain={[1, 5]} hide />
                <Tooltip
                  contentStyle={{ background: 'var(--card2)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }}
                  labelStyle={{ color: 'var(--text-soft)' }}
                  itemStyle={{ color: 'var(--amber)' }}
                />
                <Area type="monotone" dataKey="mood" stroke="#f4a947" strokeWidth={2} fill="url(#moodGrad)" dot={{ fill: '#f4a947', r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {/* AFFIRMATION */}
      <div style={{ padding: '0 24px 20px' }}>
        <div style={{
          background:   'linear-gradient(135deg, rgba(244,169,71,0.08), rgba(224,123,138,0.06))',
          borderRadius: 'var(--radius-lg)',
          padding:      '20px',
          border:       '1px solid rgba(244,169,71,0.15)',
          textAlign:    'center',
        }}>
          <div style={{ fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--amber)', marginBottom: '10px', opacity: 0.8 }}>
            Today's Affirmation
          </div>
          <p style={{
            fontFamily:   'var(--font-display)',
            fontSize:     '16px',
            lineHeight:   1.6,
            fontStyle:    'italic',
            marginBottom: '14px',
            minHeight:    '50px',
          }}>
            {customAffirm || AFFIRMATIONS[affirmIdx]}
          </p>
          <button
            onClick={handleNewAffirmation}
            disabled={affirmLoading}
            style={{
              padding:      '8px 20px',
              borderRadius: '20px',
              border:       '1px solid rgba(244,169,71,0.3)',
              background:   'transparent',
              color:        'var(--amber)',
              fontSize:     '11px',
              fontWeight:   500,
              cursor:       'pointer',
              letterSpacing:'0.05em',
              fontFamily:   'var(--font-body)',
              transition:   'all 0.2s',
            }}
          >
            {affirmLoading ? '...' : '✦ New affirmation'}
          </button>
        </div>
      </div>

      {/* CRISIS SUPPORT */}
      <div style={{ padding: '0 24px 20px' }}>
        <div
          onClick={() => toast('💙 iCall: 9152987821 | Vandrevala: 1860-2662-345', { duration: 6000 })}
          style={{
            background:   'rgba(224,123,138,0.1)',
            border:       '1px solid rgba(224,123,138,0.2)',
            borderRadius: 'var(--radius-md)',
            padding:      '12px 16px',
            display:      'flex',
            alignItems:   'center',
            gap:          '10px',
            cursor:       'pointer',
            transition:   'all 0.2s',
          }}
        >
          <span style={{ fontSize: '18px' }}>💙</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--rose)', marginBottom: '2px' }}>
              Need to talk to someone?
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-faint)' }}>
              Free, confidential support 24/7
            </div>
          </div>
          <span style={{ color: 'var(--rose)', fontSize: '14px' }}>→</span>
        </div>
      </div>

      <style>{`
        @keyframes breathe {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.08); }
        }
      `}</style>
    </div>
  );
}
