import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Receipt } from '../types';
import { getReceipts } from '../api';
import { PaperPanel } from '../components/PaperPanel';
import { StoreHeader } from '../components/StoreHeader';
import { TagBadge } from '../components/TagBadge';

const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

function fmtDate(iso: string) {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function HistoryPage() {
  const [receipts, setReceipts]   = useState<Receipt[]>([]);
  const [loading, setLoading]     = useState(true);
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const nav = useNavigate();

  useEffect(() => {
    getReceipts().then(setReceipts).finally(() => setLoading(false));
  }, []);

  // all unique tags across all receipts
  const allTags = Array.from(new Set(receipts.flatMap(r => r.items.flatMap(i => i.tags)))).sort();

  const visible = filterTag
    ? receipts.filter(r => r.items.some(i => i.tags.includes(filterTag)))
    : receipts;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 1rem 4rem' }}>
      <StoreHeader subtitle="Receipt History" />

      <PaperPanel>
        {/* Tag filter */}
        {allTags.length > 0 && (
          <>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', padding: '8px 0 4px' }}>
              <button
                onClick={() => setFilterTag(null)}
                style={{
                  fontFamily: "'Courier Prime', monospace", fontSize: '0.62rem',
                  letterSpacing: 1, textTransform: 'uppercase',
                  border: '1px solid var(--ink-faint)',
                  background: filterTag === null ? 'var(--ink)' : 'transparent',
                  color: filterTag === null ? 'var(--paper)' : 'var(--ink-light)',
                  padding: '2px 8px', cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                All
              </button>
              {allTags.map(tag => (
                <TagBadge
                  key={tag}
                  tag={tag}
                  active={filterTag === tag}
                  onClick={() => setFilterTag(filterTag === tag ? null : tag)}
                />
              ))}
            </div>
            <hr className="divider-solid" />
          </>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--ink-faint)', fontSize: '0.75rem', letterSpacing: 2 }}>
            <span className="spinner" />Loading...
          </div>
        ) : visible.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--ink-faint)', fontSize: '0.75rem', letterSpacing: 2, fontStyle: 'italic', textTransform: 'uppercase' }}>
            {filterTag ? `— no receipts tagged #${filterTag} —` : '— no receipts yet —'}
          </div>
        ) : (
          visible.map(r => {
            const receiptTags = Array.from(new Set(r.items.flatMap(i => i.tags)));
            return (
              <div
                key={r.id}
                onClick={() => nav(`/receipt/${r.id}`, { state: { receipt: r } })}
                style={{
                  padding: '12px 0', borderBottom: '1px dashed var(--ink-faint)',
                  cursor: 'pointer', transition: 'opacity 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontFamily: "'Special Elite', serif", fontSize: '0.9rem', letterSpacing: 2 }}>
                    #{r.order_number}
                  </span>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{r.total_hours.toFixed(2)} hrs</span>
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--ink-light)', marginTop: 3, letterSpacing: 0.5 }}>
                  {fmtDate(r.created_at)} · {r.items.length} tasks · {r.worker_name?.toUpperCase() ?? 'ANONYMOUS'}
                </div>
                {receiptTags.length > 0 && (
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 5 }}>
                    {receiptTags.map(tag => (
                      <TagBadge
                        key={tag}
                        tag={tag}
                        small
                        active={filterTag === tag}
                        onClick={() => {
                          
                          setFilterTag(filterTag === tag ? null : tag);
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </PaperPanel>

      <button onClick={() => nav('/')} style={outlineBtn}>← Back to Work Order</button>
    </div>
  );
}

const outlineBtn: React.CSSProperties = {
  fontFamily: "'Special Elite', serif", fontSize: '0.8rem', letterSpacing: 3,
  textTransform: 'uppercase', background: 'transparent', color: 'var(--paper)',
  border: '1px solid rgba(244,239,227,0.4)', padding: '9px 20px', cursor: 'pointer',
  marginTop: '1rem', display: 'block', width: '100%', maxWidth: 640, textAlign: 'center',
};
