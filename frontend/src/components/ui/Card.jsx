// ============================================
//  src/components/ui/Card.jsx
//  Reusable card components used everywhere
// ============================================

export function Card({ children, className = '', style = {}, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background:   'var(--card)',
        borderRadius: 'var(--radius-lg)',
        border:       '1px solid var(--border)',
        padding:      '20px',
        position:     'relative',
        overflow:     'hidden',
        cursor:       onClick ? 'pointer' : 'default',
        transition:   onClick ? 'border-color 0.2s, transform 0.2s' : 'none',
        ...style,
      }}
      className={className}
    >
      {children}
    </div>
  );
}

// Section label like "TODAY'S CHECK-IN"
export function SectionLabel({ children, style = {} }) {
  return (
    <div style={{
      fontSize:      '10px',
      fontWeight:    600,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      color:         'var(--text-faint)',
      marginBottom:  '12px',
      ...style,
    }}>
      {children}
    </div>
  );
}

// Primary amber button
export function BtnPrimary({ children, onClick, loading = false, style = {}, type = 'button' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading}
      style={{
        width:        '100%',
        padding:      '13px',
        borderRadius: 'var(--radius-md)',
        background:   loading
          ? 'rgba(244,169,71,0.4)'
          : 'linear-gradient(135deg, rgba(244,169,71,0.95), rgba(244,169,71,0.75))',
        color:        'var(--midnight)',
        fontSize:     '14px',
        fontWeight:   600,
        letterSpacing:'0.03em',
        transition:   'all 0.2s',
        border:       'none',
        cursor:       loading ? 'not-allowed' : 'pointer',
        ...style,
      }}
    >
      {loading ? 'Please wait...' : children}
    </button>
  );
}

// Ghost / outline button
export function BtnGhost({ children, onClick, style = {} }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding:      '10px 20px',
        borderRadius: '20px',
        border:       '1px solid var(--border)',
        background:   'transparent',
        color:        'var(--text-soft)',
        fontSize:     '12px',
        fontWeight:   500,
        transition:   'all 0.2s',
        ...style,
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-hover)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
    >
      {children}
    </button>
  );
}

// Icon button (square)
export function BtnIcon({ children, onClick, title = '' }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width:        '44px',
        height:       '44px',
        borderRadius: 'var(--radius-md)',
        border:       '1px solid var(--border)',
        background:   'var(--card2)',
        display:      'flex',
        alignItems:   'center',
        justifyContent:'center',
        fontSize:     '18px',
        flexShrink:   0,
        transition:   'all 0.2s',
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
      onMouseLeave={e => e.currentTarget.style.background = 'var(--card2)'}
    >
      {children}
    </button>
  );
}

// Loading spinner
export function Spinner({ size = 24 }) {
  return (
    <div style={{
      width:        size,
      height:       size,
      border:       `2px solid var(--border)`,
      borderTop:    `2px solid var(--amber)`,
      borderRadius: '50%',
      animation:    'spin 0.8s linear infinite',
    }} />
  );
}

// Full page loading
export function PageLoader() {
  return (
    <div style={{
      minHeight:      '100vh',
      display:        'flex',
      flexDirection:  'column',
      alignItems:     'center',
      justifyContent: 'center',
      gap:            '16px',
    }}>
      <div style={{
        width:        '48px',
        height:       '48px',
        background:   'var(--amber-soft)',
        borderRadius: '50%',
        display:      'flex',
        alignItems:   'center',
        justifyContent:'center',
        fontSize:     '24px',
        animation:    'breathe 2s ease-in-out infinite',
      }}>🌸</div>
      <p style={{ color: 'var(--text-faint)', fontSize: '13px' }}>Loading MindBloom...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// Empty state
export function EmptyState({ icon = '📭', title, subtitle }) {
  return (
    <div style={{
      textAlign: 'center',
      padding:   '40px 20px',
      color:     'var(--text-faint)',
    }}>
      <div style={{ fontSize: '40px', marginBottom: '12px' }}>{icon}</div>
      <div style={{ fontSize: '15px', color: 'var(--text-soft)', marginBottom: '6px' }}>{title}</div>
      {subtitle && <div style={{ fontSize: '12px' }}>{subtitle}</div>}
    </div>
  );
}
