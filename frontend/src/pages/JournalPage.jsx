// ============================================
//  src/pages/JournalPage.jsx
//  Lists all journal entries from the DB.
//  Filter by mood. Delete entries.
// ============================================

import { useState, useEffect } from 'react';
import { journalAPI } from '../api/client';
import { Card, SectionLabel, EmptyState } from '../components/ui/Card';
import toast from 'react-hot-toast';

const MOOD_CONFIG = {
  1: { emoji: '😔', label: 'Low',   color: 'var(--rose)',  bg: 'var(--rose-soft)'    },
  2: { emoji: '😕', label: 'Meh',   color: '#e8a87c',      bg: 'rgba(232,168,124,0.15)' },
  3: { emoji: '😐', label: 'Okay',  color: 'var(--amber)', bg: 'var(--amber-soft)'   },
  4: { emoji: '🙂', label: 'Good',  color: 'var(--sage)',  bg: 'var(--sage-soft)'    },
  5: { emoji: '😊', label: 'Great', color: '#7fcc9a',      bg: 'rgba(127,204,154,0.15)' },
};

const SENTIMENT_COLOR = {
  positive: 'var(--sage)',
  negative: 'var(--rose)',
  neutral:  'var(--text-faint)',
  mixed:    'var(--amber)',
};

export default function JournalPage() {
  const [entries,     setEntries]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [filter,      setFilter]      = useState(null);   // null = all moods
  const [expandedId,  setExpandedId]  = useState(null);
  const [page,        setPage]        = useState(1);
  const [hasMore,     setHasMore]     = useState(false);

  useEffect(() => {
    loadEntries(1, filter);
  }, [filter]);

  const loadEntries = async (pageNum = 1, moodFilter = null) => {
    setLoading(true);
    try {
      const params = { page: pageNum, limit: 10 };
      if (moodFilter) params.mood = moodFilter;

      const { data } = await journalAPI.getAll(params);
      setEntries(pageNum === 1 ? data.entries : prev => [...prev, ...data.entries]);
      setHasMore(data.pagination.hasMore);
      setPage(pageNum);
    } catch {
      toast.error('Could not load entries');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this entry?')) return;
    try {
      await journalAPI.remove(id);
      setEntries(prev => prev.filter(e => e._id !== id));
      toast.success('Entry deleted');
    } catch {
      toast.error('Could not delete');
    }
  };

  const handleFavorite = async (entry, e) => {
    e.stopPropagation();
    try {
      await journalAPI.update(entry._id, { isFavorite: !entry.isFavorite });
      setEntries(prev => prev.map(e =>
        e._id === entry._id ? { ...e, isFavorite: !e.isFavorite } : e
      ));
    } catch { toast.error('Could not update'); }
  };

  const formatDate = (d) => {
    const date = new Date(d);
    const today = new Date();
    const diff  = Math.floor((today - date) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    return date.toLocaleDateString('en', { month: 'short', day: 'numeric' });
  };

  return (
    <div>
      <div style={{ padding: '8px 24px 24px' }}>
        <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--amber)', marginBottom: '6px' }}>
          Reflections
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '26px' }}>
          Your <em style={{ color: 'var(--amber)' }}>story</em> matters
        </h1>
      </div>

      {/* FILTER CHIPS */}
      <div style={{ padding: '0 24px 16px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {[
          { value: null, label: 'All' },
          { value: 5, label: '😊 Great' },
          { value: 4, label: '🙂 Good'  },
          { value: 3, label: '😐 Okay'  },
          { value: 2, label: '😕 Meh'   },
          { value: 1, label: '😔 Low'   },
        ].map(f => (
          <button
            key={String(f.value)}
            onClick={() => setFilter(f.value)}
            style={{
              padding:      '6px 14px',
              borderRadius: '20px',
              border:       '1px solid var(--border)',
              background:   filter === f.value ? 'var(--amber-soft)' : 'var(--card)',
              color:        filter === f.value ? 'var(--amber)'      : 'var(--text-soft)',
              fontSize:     '12px',
              fontWeight:   filter === f.value ? 600 : 400,
              cursor:       'pointer',
              transition:   'all 0.2s',
              fontFamily:   'var(--font-body)',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ENTRIES */}
      <div style={{ padding: '0 24px' }}>
        {loading && entries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-faint)' }}>
            Loading entries...
          </div>
        ) : entries.length === 0 ? (
          <EmptyState icon="📓" title="No entries yet" subtitle="Start journaling from the Home tab" />
        ) : (
          entries.map((entry, i) => {
            const mood    = MOOD_CONFIG[entry.moodLevel] || {};
            const expanded = expandedId === entry._id;
            return (
              <div
                key={entry._id}
                onClick={() => setExpandedId(expanded ? null : entry._id)}
                className="fade-up"
                style={{
                  background:   'var(--card)',
                  borderRadius: 'var(--radius-lg)',
                  padding:      '16px',
                  border:       `1px solid ${expanded ? 'var(--border-hover)' : 'var(--border)'}`,
                  marginBottom: '8px',
                  cursor:       'pointer',
                  transition:   'all 0.2s',
                  animationDelay: `${i * 0.05}s`,
                }}
              >
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  {/* Mood dot */}
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '12px',
                    background: mood.bg || 'var(--card2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '18px', flexShrink: 0,
                  }}>
                    {mood.emoji || '📝'}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Meta row */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-faint)' }}>
                        {formatDate(entry.createdAt)}
                        {entry.wordCount ? ` · ${entry.wordCount} words` : ''}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {mood.label && (
                          <span style={{
                            fontSize: '10px', padding: '2px 8px', borderRadius: '6px',
                            background: mood.bg, color: mood.color, fontWeight: 500,
                          }}>
                            {mood.label}
                          </span>
                        )}
                        {entry.isFavorite && <span>⭐</span>}
                      </div>
                    </div>

                    {/* Preview / expanded */}
                    <p style={{
                      fontSize:    '14px',
                      color:       'var(--text-soft)',
                      lineHeight:  1.6,
                      fontFamily:  'var(--font-hand)',
                      fontSize:    '15px',
                      overflow:    expanded ? 'visible' : 'hidden',
                      whiteSpace:  expanded ? 'pre-wrap' : 'nowrap',
                      textOverflow:expanded ? 'clip' : 'ellipsis',
                    }}>
                      {entry.content}
                    </p>

                    {/* AI suggestion (when expanded) */}
                    {expanded && entry.aiSuggestion && (
                      <div style={{
                        marginTop:  '12px',
                        padding:    '12px',
                        background: 'rgba(155,142,196,0.1)',
                        borderRadius:'var(--radius-md)',
                        borderLeft: '2px solid var(--lavender)',
                      }}>
                        <div style={{ fontSize: '10px', color: 'var(--lavender)', marginBottom: '6px', letterSpacing: '0.1em' }}>
                          ✦ AI REFLECTION
                        </div>
                        <p style={{ fontSize: '13px', color: 'var(--text-soft)', fontStyle: 'italic', fontFamily: 'var(--font-display)', lineHeight: 1.6 }}>
                          {entry.aiSuggestion}
                        </p>
                      </div>
                    )}

                    {/* Actions (when expanded) */}
                    {expanded && (
                      <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                        <button
                          onClick={e => handleFavorite(entry, e)}
                          style={{
                            padding: '6px 12px', borderRadius: '8px',
                            border: '1px solid var(--border)', background: 'var(--card2)',
                            color: entry.isFavorite ? 'var(--amber)' : 'var(--text-faint)',
                            fontSize: '12px', cursor: 'pointer', fontFamily: 'var(--font-body)',
                          }}
                        >
                          {entry.isFavorite ? '⭐ Favorited' : '☆ Favorite'}
                        </button>
                        <button
                          onClick={e => handleDelete(entry._id, e)}
                          style={{
                            padding: '6px 12px', borderRadius: '8px',
                            border: '1px solid rgba(224,123,138,0.2)', background: 'var(--rose-soft)',
                            color: 'var(--rose)', fontSize: '12px', cursor: 'pointer',
                            fontFamily: 'var(--font-body)',
                          }}
                        >
                          🗑 Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Load more */}
        {hasMore && (
          <button
            onClick={() => loadEntries(page + 1, filter)}
            style={{
              width: '100%', padding: '12px', borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)', background: 'var(--card)',
              color: 'var(--text-soft)', fontSize: '13px', cursor: 'pointer',
              marginBottom: '8px', fontFamily: 'var(--font-body)',
            }}
          >
            Load more entries
          </button>
        )}
      </div>
    </div>
  );
}
