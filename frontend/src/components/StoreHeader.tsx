import { useNavigate, useLocation } from 'react-router-dom';

export function StoreHeader({ subtitle }: { subtitle?: string }) {
  const nav = useNavigate();
  const loc = useLocation();

  return (
    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
      <div style={{
        fontFamily: "'Special Elite', serif",
        fontSize: '2.4rem', letterSpacing: 6,
        color: 'var(--paper)',
        textShadow: '2px 2px 0 rgba(0,0,0,0.3)',
        textTransform: 'uppercase', lineHeight: 1,
        cursor: 'pointer',
      }} onClick={() => nav('/')}>
        Task Depot
      </div>
      {subtitle && (
        <div style={{
          fontSize: '0.65rem', letterSpacing: 4,
          color: 'rgba(244,239,227,0.6)',
          textTransform: 'uppercase', marginTop: 4,
        }}>
          {subtitle}
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: '1rem' }}>
        {[
          { label: 'Work Order', path: '/' },
          { label: 'Receipt History', path: '/history' },
        ].map(({ label, path }) => (
          <button
            key={path}
            onClick={() => nav(path)}
            style={{
              fontFamily: "'Courier Prime', monospace",
              fontSize: '0.68rem', letterSpacing: 2,
              textTransform: 'uppercase',
              background: 'transparent',
              color: loc.pathname === path ? 'var(--paper)' : 'rgba(244,239,227,0.45)',
              border: `1px solid ${loc.pathname === path ? 'rgba(244,239,227,0.6)' : 'rgba(244,239,227,0.2)'}`,
              padding: '5px 12px', cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
