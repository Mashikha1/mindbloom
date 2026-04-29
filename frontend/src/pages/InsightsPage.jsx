// ============================================
//  src/pages/InsightsPage.jsx
//  Real analytics from the backend API
// ============================================

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { insightsAPI } from '../api/client';
import { Card, SectionLabel, EmptyState } from '../components/ui/Card';

const MOOD_LABELS = { 1:'😔 Low', 2:'😕 Meh', 3:'😐 Okay', 4:'🙂 Good', 5:'😊 Great' };
const MOOD_COLORS = { 1:'var(--rose)', 2:'#e8a87c', 3:'var(--amber)', 4:'var(--sage)', 5:'#7fcc9a' };
const PIE_COLORS  = ['#7fcc9a','var(--sage)','var(--amber)','var(--rose)'];

export default function InsightsPage() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [period,  setPeriod]  = useState(7);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const { data: overview } = await insightsAPI.overview();
      setData(overview);
    } catch { /* silently fail */ }
    finally { setLoading(false); }
  };

  if (loading) return (
    <div style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--text-faint)' }}>
      Loading insights...
    </div>
  );

  if (!data || data.totalMoodCheckins === 0) return (
    <div>
      <div style={{ padding: '8px 24px 24px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '26px' }}>
          Know <em style={{ color: 'var(--amber)' }}>yourself</em> better
        </h1>
      </div>
      <EmptyState icon="📊" title="No data yet" subtitle="Log your mood for a few days to see insights" />
    </div>
  );

  // Build bar chart data for mood breakdown
  const moodBarData = data.moodBreakdown.map(m => ({
    name:  MOOD_LABELS[m.level] || `Level ${m.level}`,
    value: m.percentage,
    fill:  MOOD_COLORS[m.level] || 'var(--amber)',
  }));

  return (
    <div>
      <div style={{ padding: '8px 24px 24px' }}>
        <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--amber)', marginBottom: '6px' }}>Analytics</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '26px' }}>
          Know <em style={{ color: 'var(--amber)' }}>yourself</em> better
        </h1>
      </div>

      {/* SUMMARY CARDS */}
      <div style={{ padding: '0 24px 20px' }}>
        <SectionLabel>This Month</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          {[
            { icon: '📓', val: data.totalJournalEntries, label: 'Entries'      },
            { icon: '🔥', val: `${data.streak}d`,         label: 'Streak'       },
            { icon: '🌟', val: data.bestDay?.day || '—',   label: 'Best day'    },
          ].map(s => (
            <Card key={s.label} style={{ textAlign: 'center', padding: '14px 10px' }}>
              <div style={{ fontSize: '20px', marginBottom: '6px' }}>{s.icon}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: '10px', color: 'var(--text-faint)', marginTop: '4px' }}>{s.label}</div>
            </Card>
          ))}
        </div>
      </div>

      {/* MOOD BREAKDOWN BAR */}
      {moodBarData.length > 0 && (
        <div style={{ padding: '0 24px 20px' }}>
          <SectionLabel>Mood Breakdown</SectionLabel>
          <Card>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={moodBarData} margin={{ top: 5, right: 5, bottom: 20, left: -25 }}>
                <XAxis dataKey="name" tick={{ fill: 'var(--text-faint)', fontSize: 9 }} axisLine={false} tickLine={false} interval={0} />
                <YAxis tick={{ fill: 'var(--text-faint)', fontSize: 9 }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip
                  contentStyle={{ background: 'var(--card2)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }}
                  formatter={v => [`${v}%`, 'Frequency']}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {moodBarData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {/* DAY OF WEEK */}
      {data.dayOfWeekData?.length > 0 && (
        <div style={{ padding: '0 24px 20px' }}>
          <SectionLabel>Best Days of Week</SectionLabel>
          <Card>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={data.dayOfWeekData} margin={{ top: 5, right: 5, bottom: 5, left: -30 }}>
                <XAxis dataKey="day" tick={{ fill: 'var(--text-faint)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 5]} hide />
                <Tooltip
                  contentStyle={{ background: 'var(--card2)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }}
                  formatter={v => [v, 'Avg Mood']}
                />
                <Bar dataKey="avgMood" fill="var(--sage)" radius={[4, 4, 0, 0]} fillOpacity={0.8} />
              </BarChart>
            </ResponsiveContainer>
            {data.bestDay?.day && (
              <p style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-faint)', marginTop: '8px' }}>
                {data.bestDay.day} is your happiest day 🌟
              </p>
            )}
          </Card>
        </div>
      )}

      {/* TOP TRIGGERS */}
      {data.topTriggers?.length > 0 && (
        <div style={{ padding: '0 24px 20px' }}>
          <SectionLabel>What Affects Your Mood</SectionLabel>
          <Card>
            <p style={{ fontSize: '12px', color: 'var(--text-faint)', marginBottom: '14px' }}>
              Most common factors on low-mood days
            </p>
            {data.topTriggers.map((t, i) => (
              <div key={t._id} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-faint)', width: '14px' }}>#{i + 1}</span>
                <span style={{ fontSize: '13px', textTransform: 'capitalize', flex: 1 }}>{t._id}</span>
                <span style={{
                  fontSize: '10px', padding: '2px 8px', borderRadius: '6px',
                  background: 'var(--rose-soft)', color: 'var(--rose)',
                }}>
                  {t.count}x
                </span>
              </div>
            ))}
          </Card>
        </div>
      )}

      {/* WELLNESS SCORE */}
      <div style={{ padding: '0 24px 20px' }}>
        <SectionLabel>Wellness Score</SectionLabel>
        <Card style={{ textAlign: 'center', padding: '28px 20px' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '52px', color: 'var(--amber)', lineHeight: 1 }}>
            {data.wellnessScore}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-faint)', margin: '8px 0 16px' }}>out of 100</div>
          <div style={{ height: '8px', background: 'var(--card2)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width:  `${data.wellnessScore}%`,
              background: 'linear-gradient(90deg, var(--sage), var(--amber))',
              borderRadius: '4px',
              transition: 'width 1.5s ease',
            }} />
          </div>
        </Card>
      </div>
    </div>
  );
}
