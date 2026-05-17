const PATTERN = [2,1,3,1,2,2,1,3,2,1,2,1,3,2,1,2,3,1,2,1,1,3,2,2,1,3,1,2,1,3,2,1,2,2,3,1];

export function Barcode({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '12px 0 6px' }}>
      <div style={{ display: 'flex', height: 36 }}>
        {PATTERN.map((w, i) =>
          i % 2 === 0
            ? <div key={i} style={{ width: w + 1, height: '100%', background: 'var(--ink)' }} />
            : <div key={i} style={{ width: w, height: '100%' }} />
        )}
      </div>
      <div style={{ fontSize: '0.65rem', letterSpacing: 4, color: 'var(--ink-light)', marginTop: 4 }}>
        {label.split('').join(' ')}
      </div>
    </div>
  );
}
