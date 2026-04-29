// ============================================
//  src/pages/ProfilePage.jsx
//  User profile, preferences, logout
// ============================================

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../api/client';
import { Card, SectionLabel, BtnPrimary } from '../components/ui/Card';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

function Toggle({ on, onToggle }) {
  return (
    <div
      onClick={onToggle}
      style={{
        width:        '42px',
        height:       '24px',
        borderRadius: '12px',
        background:   on ? 'rgba(127,181,160,0.4)' : 'var(--card2)',
        border:       `1px solid ${on ? 'rgba(127,181,160,0.3)' : 'var(--border)'}`,
        position:     'relative',
        cursor:       'pointer',
        transition:   'all 0.3s',
        flexShrink:   0,
      }}
    >
      <div style={{
        width:      '18px',
        height:     '18px',
        borderRadius:'50%',
        background: on ? 'var(--sage)' : 'var(--text-faint)',
        position:   'absolute',
        top:        '2px',
        left:       on ? '20px' : '2px',
        transition: 'all 0.3s',
      }} />
    </div>
  );
}

export default function ProfilePage() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [prefs, setPrefs] = useState({
    reminderEnabled: user?.preferences?.reminderEnabled ?? true,
    aiSuggestions:   user?.preferences?.aiSuggestions   ?? true,
    darkMode:        user?.preferences?.darkMode        ?? true,
  });

  const [pwForm, setPwForm]   = useState({ current: '', next: '', confirm: '' });
  const [pwLoading, setPwLoading] = useState(false);

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const handleToggle = async (key) => {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    try {
      await userAPI.updatePreferences({ [key]: updated[key] });
      toast.success('Preference saved');
    } catch { toast.error('Could not save preference'); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.next !== pwForm.confirm) { toast.error('Passwords do not match'); return; }
    setPwLoading(true);
    try {
      await userAPI.changePassword({ currentPassword: pwForm.current, newPassword: pwForm.next });
      toast.success('Password changed!');
      setPwForm({ current: '', next: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not change password');
    } finally { setPwLoading(false); }
  };

  const inputStyle = {
    width: '100%', background: 'var(--card2)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)', padding: '11px 14px', color: 'var(--text)',
    fontSize: '13px', outline: 'none', fontFamily: 'var(--font-body)',
  };

  const rowStyle = {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 0', borderBottom: '1px solid var(--border)',
  };

  return (
    <div>
      <div style={{ padding: '8px 24px 24px' }}>
        <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--amber)', marginBottom: '6px' }}>
          Account
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '26px' }}>
          Your <em style={{ color: 'var(--amber)' }}>space</em>
        </h1>
      </div>

      {/* PROFILE CARD */}
      <div style={{ padding: '0 24px 20px' }}>
        <Card style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '16px',
            background: 'linear-gradient(135deg, var(--lavender), var(--sage))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '22px', fontWeight: 600, flexShrink: 0,
          }}>
            {initials}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '16px', fontWeight: 500 }}>{user?.name}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-faint)', marginTop: '2px' }}>{user?.email}</div>
            <div style={{ fontSize: '11px', color: 'var(--sage)', marginTop: '4px' }}>
              {user?.currentStreak || 0} day streak 🔥 · Score: {user?.wellnessScore || 50}/100
            </div>
          </div>
        </Card>
      </div>

      {/* PREFERENCES */}
      <div style={{ padding: '0 24px 20px' }}>
        <SectionLabel>Preferences</SectionLabel>
        <Card style={{ padding: '0 20px' }}>
          {[
            { key: 'reminderEnabled', icon: '🔔', bg: 'var(--amber-soft)',   title: 'Daily Reminders',  sub: '9:00 PM check-in'             },
            { key: 'aiSuggestions',   icon: '🫀', bg: 'var(--rose-soft)',    title: 'AI Suggestions',   sub: 'Personalized reflections'     },
            { key: 'darkMode',        icon: '🌙', bg: 'var(--lavender-soft)',title: 'Dark Mode',        sub: 'Always on'                    },
          ].map((item, idx, arr) => (
            <div key={item.key} style={{ ...rowStyle, borderBottom: idx < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
                  {item.icon}
                </div>
                <div>
                  <div style={{ fontSize: '14px' }}>{item.title}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-faint)', marginTop: '1px' }}>{item.sub}</div>
                </div>
              </div>
              <Toggle on={prefs[item.key]} onToggle={() => handleToggle(item.key)} />
            </div>
          ))}
        </Card>
      </div>

      {/* CHANGE PASSWORD */}
      <div style={{ padding: '0 24px 20px' }}>
        <SectionLabel>Security</SectionLabel>
        <Card>
          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { key: 'current', label: 'Current Password',  placeholder: 'Enter current password' },
              { key: 'next',    label: 'New Password',       placeholder: 'Min. 6 characters'      },
              { key: 'confirm', label: 'Confirm Password',   placeholder: 'Repeat new password'    },
            ].map(f => (
              <div key={f.key}>
                <label style={{ fontSize: '11px', color: 'var(--text-faint)', display: 'block', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {f.label}
                </label>
                <input
                  type="password"
                  placeholder={f.placeholder}
                  value={pwForm[f.key]}
                  onChange={e => setPwForm(p => ({ ...p, [f.key]: e.target.value }))}
                  style={inputStyle}
                />
              </div>
            ))}
            <div style={{ marginTop: '4px' }}>
              <BtnPrimary type="submit" loading={pwLoading} style={{ padding: '11px' }}>
                🔒 Change Password
              </BtnPrimary>
            </div>
          </form>
        </Card>
      </div>

      {/* DATA */}
      <div style={{ padding: '0 24px 20px' }}>
        <SectionLabel>Data & Privacy</SectionLabel>
        <Card style={{ padding: '0 20px' }}>
          {[
            { icon: '📦', bg: 'var(--amber-soft)',  title: 'Export My Data',  sub: 'Download all journal entries', action: () => toast('📦 Export feature coming soon!')         },
            { icon: '🛡️', bg: 'var(--sage-soft)',   title: 'Privacy Policy',  sub: 'Your data stays yours',        action: () => toast('ℹ️ All data stored encrypted')            },
          ].map((item, idx) => (
            <div key={item.title} onClick={item.action} style={{ ...rowStyle, cursor: 'pointer', borderBottom: idx === 0 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
                  {item.icon}
                </div>
                <div>
                  <div style={{ fontSize: '14px' }}>{item.title}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-faint)', marginTop: '1px' }}>{item.sub}</div>
                </div>
              </div>
              <span style={{ color: 'var(--text-faint)' }}>→</span>
            </div>
          ))}
        </Card>
      </div>

      {/* LOGOUT */}
      <div style={{ padding: '0 24px 20px' }}>
        <button
          onClick={() => { logout(); navigate('/'); }}
          style={{
            width: '100%', padding: '13px', borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(224,123,138,0.2)', background: 'var(--rose-soft)',
            color: 'var(--rose)', fontSize: '14px', fontWeight: 500, cursor: 'pointer',
            fontFamily: 'var(--font-body)', transition: 'all 0.2s',
          }}
        >
          Sign Out
        </button>
      </div>

      {/* Crisis */}
      <div style={{ padding: '0 24px 20px' }}>
        <div style={{ background: 'rgba(224,123,138,0.1)', border: '1px solid rgba(224,123,138,0.2)', borderRadius: 'var(--radius-md)', padding: '12px 16px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--rose)', marginBottom: '4px' }}>💙 Crisis Support Lines (India)</div>
          <div style={{ fontSize: '11px', color: 'var(--text-faint)' }}>iCall: 9152987821 · Vandrevala: 1860-2662-345</div>
        </div>
      </div>
    </div>
  );
}
