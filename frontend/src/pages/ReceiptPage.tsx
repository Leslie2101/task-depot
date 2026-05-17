import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import type { Receipt } from '../types';
import { getReceipt } from '../api';
import { PaperPanel } from '../components/PaperPanel';
import { StoreHeader } from '../components/StoreHeader';
import { Barcode } from '../components/Barcode';
import { TagBadge } from '../components/TagBadge';

const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

function fmt(iso: string) {
  const d = new Date(iso);
  return {
    date: `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`,
    time: [d.getHours(), d.getMinutes(), d.getSeconds()].map(n => String(n).padStart(2, '0')).join(':'),
  };
}

export function ReceiptPage() {
  const { id }     = useParams<{ id: string }>();
  const location   = useLocation();
  const nav        = useNavigate();
  const [receipt, setReceipt] = useState<Receipt | null>(location.state?.receipt ?? null);
  const [loading, setLoading] = useState(!receipt);

  useEffect(() => {
    if (receipt) return;
    getReceipt(Number(id))
      .then(setReceipt)
      .catch(() => nav('/'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', color: 'var(--paper)', fontFamily: 'Courier Prime, monospace', letterSpacing: 2 }}>
      <span className="spinner" /> Loading receipt...
    </div>
  );

  if (!receipt) return null;

  const { date, time } = fmt(receipt.created_at);
  const hiCt  = receipt.items.filter(i => i.priority === 'hi').length;
  const medCt = receipt.items.filter(i => i.priority === 'med').length;
  const loCt  = receipt.items.filter(i => i.priority === 'lo').length;
  const name  = receipt.worker_name?.toUpperCase() ?? 'ANONYMOUS';

  // collect all unique tags on this receipt
  const allReceiptTags = Array.from(new Set(receipt.items.flatMap(i => i.tags))).sort();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 1rem 4rem' }}>
      <div className="no-print">
        <StoreHeader subtitle="Work Completion Receipt" />
      </div>

      <PaperPanel>
        {/* Header */}
        <div style={{ textAlign: 'center', padding: '4px 0 8px' }}>
          <div style={{ fontFamily: "'Special Elite', serif", fontSize: '1.6rem', letterSpacing: 5 }}>TASK DEPOT</div>
          <div style={{ fontSize: '0.62rem', letterSpacing: 3, textTransform: 'uppercase', color: 'var(--ink-light)' }}>Work Completion Receipt</div>
        </div>

        <hr className="divider-double" />

        <MetaRow left={`ORDER #${receipt.order_number}`} right={date} />
        <MetaRow left={`WORKER: ${name}`} right={time} style={{ marginBottom: 8 }} />

        <hr className="divider-dash" />
        <p className="panel-title">— completed tasks —</p>

        {receipt.items.map(item => (
          <div key={item.id}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, padding: '5px 0' }}>
              <span style={{ flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', textTransform: 'uppercase', fontSize: '0.82rem' }}>{item.name}</span>
              <span style={{ flex: 1, borderBottom: '1px dotted var(--ink-faint)', minWidth: 20, margin: '0 4px', alignSelf: 'flex-end', marginBottom: 4 }} />
              <span style={{ fontWeight: 700, fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{item.hours.toFixed(2)}</span>
            </div>
            {item.tags.length > 0 && (
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', paddingBottom: 4 }}>
                {item.tags.map(tag => <TagBadge key={tag} tag={tag} small />)}
              </div>
            )}
          </div>
        ))}

        <hr className="divider-dash" />
        <MetaRow left="ITEM COUNT"  right={`${receipt.items.length} tasks`} />
        <MetaRow left="SUBTOTAL"    right={`${receipt.total_hours.toFixed(2)} hrs`} />
        <hr className="divider-solid" />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 700, fontFamily: "'Special Elite', serif", letterSpacing: 1, padding: '6px 0' }}>
          <span>TOTAL HOURS</span><span>{receipt.total_hours.toFixed(2)} hrs</span>
        </div>

        {/* Summary cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, margin: '10px 0' }}>
          <SummaryCard val={receipt.items.length} label="Tasks Done" />
          <SummaryCard val={receipt.total_hours % 1 === 0 ? receipt.total_hours : receipt.total_hours.toFixed(2)} label="Hours Spent" />
          <SummaryCard val={hiCt} label="High Priority" color="#c0392b" />
          <SummaryCard val={medCt + loCt} label="Other Priority" />
        </div>

        {/* Tags summary */}
        {allReceiptTags.length > 0 && (
          <>
            <hr className="divider-dash" />
            <p className="panel-title">— tags —</p>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', paddingBottom: 6 }}>
              {allReceiptTags.map(tag => <TagBadge key={tag} tag={tag} />)}
            </div>
          </>
        )}

        {receipt.note && (
          <div style={{ fontSize: '0.75rem', color: 'var(--ink-light)', borderTop: '1px dashed var(--ink-faint)', paddingTop: 8, marginTop: 4, fontStyle: 'italic' }}>
            NOTE: {receipt.note}
          </div>
        )}

        {/* Stamp */}
        <div style={{ textAlign: 'center', margin: '10px 0' }}>
          <div className="stamp">Completed</div>
        </div>

        <hr className="divider-dash" />
        <Barcode label={receipt.order_number} />

        <div style={{ textAlign: 'center', fontSize: '0.7rem', letterSpacing: 3, color: 'var(--ink-light)', marginTop: 8 }}>* * * THANK YOU * * *</div>
        <div style={{ textAlign: 'center', fontSize: '0.68rem', letterSpacing: 2, color: 'var(--ink-faint)', marginTop: 4, fontStyle: 'italic' }}>Great work — keep it up!</div>
        <div style={{ textAlign: 'center', fontSize: '0.7rem', letterSpacing: 3, color: 'var(--ink-light)', marginTop: 4 }}>* * * * * * * * * *</div>
      </PaperPanel>

      <button onClick={() => window.print()} style={{ ...outlineBtn, marginTop: '1rem' }} className="no-print">⎙ Print Receipt</button>
      <button onClick={() => nav('/')} style={outlineBtn} className="no-print">+ New Work Order</button>
    </div>
  );
}

function MetaRow({ left, right, style }: { left: string; right: string; style?: React.CSSProperties }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--ink-mid)', padding: '2px 0', ...style }}>
      <span>{left}</span><span>{right}</span>
    </div>
  );
}

function SummaryCard({ val, label, color }: { val: string | number; label: string; color?: string }) {
  return (
    <div style={{ textAlign: 'center', border: '1px dashed var(--ink-faint)', padding: '8px 6px' }}>
      <span style={{ fontFamily: "'Special Elite', serif", fontSize: '1.4rem', color: color ?? 'var(--ink)', display: 'block', lineHeight: 1 }}>{val}</span>
      <span style={{ fontSize: '0.6rem', letterSpacing: 2, textTransform: 'uppercase', color: 'var(--ink-light)', display: 'block', marginTop: 3 }}>{label}</span>
    </div>
  );
}

const outlineBtn: React.CSSProperties = {
  fontFamily: "'Special Elite', serif", fontSize: '0.8rem', letterSpacing: 3,
  textTransform: 'uppercase', background: 'transparent', color: 'var(--paper)',
  border: '1px solid rgba(244,239,227,0.4)', padding: '9px 20px', cursor: 'pointer',
  marginTop: '0.5rem', display: 'block', width: '100%', maxWidth: 640, textAlign: 'center',
};
