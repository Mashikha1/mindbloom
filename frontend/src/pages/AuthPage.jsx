// ============================================
//  src/pages/AuthPage.jsx
//  Login + Register — toggled by a tab
// ============================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BtnPrimary } from '../components/ui/Card';
import toast from 'react-hot-toast';

// Shared text input style
const inputStyle = {
  width:        '100%',
  background:   'var(--card2)',
  border:       '1px solid var(--border)',
  borderRadius: 'var(--radius-md)',
  padding:      '13px 16px',
  color:        'var(--text)',
  fontSize:     '14px',
  outline:      'none',
  transition:   'border-color 0.2s',
  fontFamily:   'var(--font-body)',
};

export default function AuthPage() {
  const [tab,      setTab]      = useState('login');   // 'login' | 'register'
  const [loading,  setLoading]  = useState(false);

  // Form state
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (tab === 'login') {
        await login(email, password);
      } else {
        if (!name.trim()) { toast.error('Please enter your name'); setLoading(false); return; }
        await register(name, email, password);
      }
      navigate('/home');
    } catch (err) {
      // Show the error message from backend
      const msg = err.response?.data?.error || 'Something went wrong';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight:      '100vh',
      background:     'var(--midnight)',
      display:        'flex',
      flexDirection:  'column',
      alignItems:     'center',
      justifyContent: 'center',
      padding:        '24px',
      position:       'relative',
      overflow:       'hidden',
    }}>
      {/* Background nebula */}
      <div style={{
        position:   'fixed', inset: 0, pointerEvents: 'none',
        background: `
          radial-gradient(ellipse 600px 400px at 20% 20%, rgba(155,142,196,0.07) 0%, transparent 70%),
          radial-gradient(ellipse 500px 300px at 80% 70%, rgba(107,174,214,0.06) 0%, transparent 70%)
        `
      }} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '360px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            width:         '60px', height: '60px',
            background:    'var(--amber-soft)',
            borderRadius:  '50%',
            display:       'flex', alignItems: 'center', justifyContent: 'center',
            fontSize:      '28px',
            margin:        '0 auto 16px',
            border:        '1px solid rgba(244,169,71,0.25)',
            animation:     'breathe 4s ease-in-out infinite',
          }}>🌸</div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize:   '28px',
            marginBottom:'6px',
          }}>MindBloom</h1>
          <p style={{ color: 'var(--text-faint)', fontSize: '13px', fontFamily: 'var(--font-hand)', fontSize: '16px' }}>
            Your mental wellness companion 🌿
          </p>
        </div>

        {/* Tab switcher */}
        <div style={{
          display:      'flex',
          background:   'var(--card)',
          borderRadius: 'var(--radius-lg)',
          padding:      '4px',
          marginBottom: '24px',
          border:       '1px solid var(--border)',
        }}>
          {['login', 'register'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex:         1,
                padding:      '10px',
                borderRadius: 'var(--radius-md)',
                background:   tab === t ? 'var(--amber-soft)' : 'transparent',
                border:       tab === t ? '1px solid rgba(244,169,71,0.2)' : '1px solid transparent',
                color:        tab === t ? 'var(--amber)' : 'var(--text-faint)',
                fontSize:     '13px',
                fontWeight:   tab === t ? 600 : 400,
                transition:   'all 0.2s',
                fontFamily:   'var(--font-body)',
                cursor:       'pointer',
                textTransform:'capitalize',
              }}
            >
              {t === 'login' ? '🔑 Sign In' : '✨ Create Account'}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {tab === 'register' && (
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-faint)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                Your Name
              </label>
              <input
                type="text"
                placeholder="e.g. Arjun Kumar"
                value={name}
                onChange={e => setName(e.target.value)}
                style={inputStyle}
                onFocus={e  => e.target.style.borderColor = 'rgba(244,169,71,0.4)'}
                onBlur={e   => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
          )}

          <div>
            <label style={{ fontSize: '11px', color: 'var(--text-faint)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'rgba(244,169,71,0.4)'}
              onBlur={e  => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', color: 'var(--text-faint)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Min. 6 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                style={{ ...inputStyle, paddingRight: '45px' }}
                onFocus={e => e.target.style.borderColor = 'rgba(244,169,71,0.4)'}
                onBlur={e  => e.target.style.borderColor = 'var(--border)'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position:   'absolute',
                  right:      '12px',
                  top:        '50%',
                  transform:  'translateY(-50%)',
                  background: 'transparent',
                  border:     'none',
                  color:      'var(--text-faint)',
                  fontSize:   '12px',
                  cursor:     'pointer',
                  padding:    '4px',
                  fontFamily: 'var(--font-body)',
                  opacity:    0.7,
                }}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div style={{ marginTop: '8px' }}>
            <BtnPrimary type="submit" loading={loading}>
              {tab === 'login' ? '🌸 Sign In' : '✨ Create My Account'}
            </BtnPrimary>
          </div>
        </form>

        {/* Crisis note */}
        <div style={{
          marginTop:  '32px',
          padding:    '12px 16px',
          background: 'rgba(224,123,138,0.08)',
          border:     '1px solid rgba(224,123,138,0.15)',
          borderRadius:'var(--radius-md)',
          textAlign:  'center',
        }}>
          <p style={{ fontSize: '11px', color: 'var(--text-faint)', lineHeight: 1.6 }}>
            💙 If you're in crisis, please reach out immediately<br />
            <span style={{ color: 'var(--rose)', fontWeight: 500 }}>iCall: 9152987821</span>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes breathe {
          0%, 100% { transform: scale(1);     box-shadow: 0 0 12px rgba(244,169,71,0.15); }
          50%       { transform: scale(1.08);  box-shadow: 0 0 28px rgba(244,169,71,0.3);  }
        }
      `}</style>
    </div>
  );
}
