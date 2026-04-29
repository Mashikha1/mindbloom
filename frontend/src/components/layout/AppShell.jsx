// ============================================
//  src/components/layout/AppShell.jsx
//  Wraps all authenticated pages.
//  Provides: stars bg, top nav, bottom nav,
//  max-width container.
// ============================================

import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// ── STARS BACKGROUND ──────────────────────
function StarsBg() {
  return (
    <>
      <div style={{
        position:       'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: `
          radial-gradient(1px 1px at 10% 15%, rgba(255,255,255,0.4) 0%, transparent 100%),
          radial-gradient(1px 1px at 25% 40%, rgba(255,255,255,0.3) 0%, transparent 100%),
          radial-gradient(1px 1px at 45% 8%,  rgba(255,255,255,0.5) 0%, transparent 100%),
          radial-gradient(1px 1px at 65% 25%, rgba(255,255,255,0.3) 0%, transparent 100%),
          radial-gradient(1px 1px at 80% 12%, rgba(255,255,255,0.4) 0%, transparent 100%),
          radial-gradient(1px 1px at 90% 35%, rgba(255,255,255,0.3) 0%, transparent 100%),
          radial-gradient(2px 2px at 35% 80%, rgba(244,169,71,0.3)  0%, transparent 100%),
          radial-gradient(1px 1px at 55% 55%, rgba(255,255,255,0.3) 0%, transparent 100%)
        `
      }} />
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: `
          radial-gradient(ellipse 600px 400px at 20% 20%, rgba(155,142,196,0.06) 0%, transparent 70%),
          radial-gradient(ellipse 500px 300px at 80% 70%, rgba(107,174,214,0.05) 0%, transparent 70%),
          radial-gradient(ellipse 400px 500px at 60% 10%, rgba(244,169,71,0.04)  0%, transparent 70%)
        `
      }} />
    </>
  );
}

// ── TOP NAV ───────────────────────────────
function TopNav({ title, subtitle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <div style={{
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'space-between',
      padding:        '20px 24px 16px',
      position:       'sticky',
      top:            0,
      zIndex:         100,
      background:     'linear-gradient(to bottom, var(--midnight) 80%, transparent)',
    }}>
      <div>
        <div style={{
          display:    'flex',
          alignItems: 'center',
          gap:        '8px',
        }}>
          <div style={{
            width:        '32px',
            height:       '32px',
            background:   'var(--amber-soft)',
            borderRadius: '50%',
            display:      'flex',
            alignItems:   'center',
            justifyContent:'center',
            fontSize:     '16px',
            border:       '1px solid rgba(244,169,71,0.25)',
            animation:    'breathe 4s ease-in-out infinite',
          }}>🌸</div>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize:   '18px',
          }}>MindBloom</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div
          onClick={() => navigate('/profile')}
          style={{
            width:        '34px',
            height:       '34px',
            borderRadius: '50%',
            background:   'linear-gradient(135deg, var(--lavender), var(--sage))',
            display:      'flex',
            alignItems:   'center',
            justifyContent:'center',
            fontSize:     '13px',
            fontWeight:   600,
            cursor:       'pointer',
            border:       '2px solid var(--border)',
            userSelect:   'none',
          }}
        >
          {initials}
        </div>
      </div>
    </div>
  );
}

// ── BOTTOM NAV ────────────────────────────
const NAV_ITEMS = [
  { path: '/home',     icon: '🏠', label: 'Home'    },
  { path: '/breathe',  icon: '🌬️', label: 'Breathe' },
  { path: '/journal',  icon: '📓', label: 'Journal' },
  { path: '/insights', icon: '📊', label: 'Insights'},
  { path: '/profile',  icon: '⚙️', label: 'Profile' },
];

function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <div style={{
      position:       'fixed',
      bottom:         0,
      left:           '50%',
      transform:      'translateX(-50%)',
      width:          '100%',
      maxWidth:       '430px',
      padding:        '12px 16px 20px',
      background:     'linear-gradient(to top, var(--midnight) 80%, transparent)',
      display:        'flex',
      justifyContent: 'space-around',
      zIndex:         100,
    }}>
      {NAV_ITEMS.map(item => {
        const active = pathname === item.path;
        return (
          <div
            key={item.path}
            onClick={() => navigate(item.path)}
            style={{
              display:        'flex',
              flexDirection:  'column',
              alignItems:     'center',
              gap:            '4px',
              padding:        '6px 14px',
              borderRadius:   'var(--radius-md)',
              cursor:         'pointer',
              background:     active ? 'var(--amber-soft)' : 'transparent',
              border:         active ? '1px solid rgba(244,169,71,0.2)' : '1px solid transparent',
              transition:     'all 0.2s',
              minWidth:       '52px',
            }}
          >
            <span style={{ fontSize: '20px', lineHeight: 1 }}>{item.icon}</span>
            <span style={{
              fontSize:      '9px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color:         active ? 'var(--amber)' : 'var(--text-faint)',
              fontWeight:    active ? 600 : 400,
            }}>
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── APP SHELL (main export) ───────────────
export default function AppShell({ children }) {
  return (
    <div style={{ background: 'var(--midnight)', minHeight: '100vh' }}>
      <StarsBg />
      <div style={{
        position:  'relative',
        zIndex:    1,
        maxWidth:  '430px',
        margin:    '0 auto',
        minHeight: '100vh',
        paddingBottom: '90px',
      }}>
        <TopNav />
        <main>{children}</main>
        <BottomNav />
      </div>
    </div>
  );
}
