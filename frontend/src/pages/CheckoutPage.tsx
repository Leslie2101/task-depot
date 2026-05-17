import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Task } from '../types';
import { getTasks, createReceipt } from '../api';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { PaperPanel } from '../components/PaperPanel';
import { StoreHeader } from '../components/StoreHeader';
import { TagBadge } from '../components/TagBadge';

const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

export function CheckoutPage() {
  const [tasks, setTasks]       = useState<Task[]>([]);
  const [workerName, setName]   = useState('');
  const [note, setNote]         = useState('');
  const [submitting, setSub]    = useState(false);
  const { cartIds, cartTasks, totalHours, remove, clear } = useCart();
  const toast = useToast();
  const nav   = useNavigate();

  const now = new Date();
  const dateDefault = `${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`;

  useEffect(() => {
    getTasks().then(setTasks).catch(() => {});
  }, []);

  const cart = cartTasks(tasks);
  const hrs  = totalHours(tasks);

  if (cart.length === 0) {
    nav('/');
    return null;
  }

  const handleConfirm = async () => {
    setSub(true);
    try {
      const receipt = await createReceipt({
        task_ids:    cartIds,
        worker_name: workerName.trim() || undefined,
        note:        note.trim() || undefined,
      });
      clear();
      nav(`/receipt/${receipt.id}`, { state: { receipt } });
    } catch (e: any) {
      toast(e.message, true);
    } finally {
      setSub(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 1rem 4rem' }}>
      <StoreHeader subtitle="Checkout — Review Your Completed Work" />

      <PaperPanel>
        <p className="panel-title">— Order Details —</p>

        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <input
            value={workerName}
            onChange={e => setName(e.target.value)}
            placeholder="your name (optional)..."
            maxLength={40}
            style={inpStyle}
          />
          <input
            defaultValue={dateDefault}
            placeholder="date..."
            maxLength={20}
            style={{ ...inpStyle, width: 140, flex: 'none' }}
          />
        </div>
        <input
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="order note (optional)..."
          maxLength={120}
          style={{ ...inpStyle, width: '100%', marginBottom: 2 }}
        />

        <hr className="divider-dash" />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', letterSpacing: 2, textTransform: 'uppercase', color: 'var(--ink-light)', padding: '4px 0' }}>
          <span>Completed Tasks</span><span>Hrs</span>
        </div>
        <hr className="divider-solid" />

        {cart.map(t => (
          <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: '1px dashed var(--ink-faint)' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.85rem', textTransform: 'uppercase' }}>{t.name}</div>
              {t.tags.length > 0 && (
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 3 }}>
                  {t.tags.map(tag => <TagBadge key={tag} tag={tag} small />)}
                </div>
              )}
              <div style={{ fontSize: '0.7rem', color: 'var(--ink-light)' }}>
                {t.priority === 'hi' ? '!! HIGH' : t.priority === 'med' ? '! MED' : '— LOW'} PRIORITY
              </div>
            </div>
            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{t.hours.toFixed(2)} hrs</span>
            <button
              onClick={() => remove(t.id)}
              style={{ background: 'none', border: 'none', color: 'var(--ink-faint)', cursor: 'pointer', fontSize: '1rem' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#c0392b')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink-faint)')}
            >✕</button>
          </div>
        ))}

        <hr className="divider-double" />
        <Row label="SUBTOTAL" value={`${hrs.toFixed(2)} hrs`} />
        <Row label="ITEMS"    value={String(cart.length)} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 700, fontFamily: "'Special Elite', serif", letterSpacing: 1, padding: '6px 0' }}>
          <span>TOTAL HOURS</span><span>{hrs.toFixed(2)} hrs</span>
        </div>

        <hr className="divider-dash" />
        <button
          onClick={handleConfirm}
          disabled={submitting}
          style={{
            width: '100%', background: 'var(--ink)', color: 'var(--paper)',
            border: 'none', fontFamily: "'Special Elite', serif",
            fontSize: '0.85rem', letterSpacing: 3, textTransform: 'uppercase',
            padding: 11, cursor: submitting ? 'not-allowed' : 'pointer',
            marginTop: 6, opacity: submitting ? 0.5 : 1,
          }}
        >
          {submitting ? <><span className="spinner" />Processing...</> : '✓ Confirm & Print Receipt'}
        </button>
      </PaperPanel>

      <button onClick={() => nav('/')} style={outlineBtn}>← Back to Work Order</button>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--ink-mid)', padding: '3px 0' }}>
      <span>{label}</span><span>{value}</span>
    </div>
  );
}

const inpStyle: React.CSSProperties = {
  flex: 1, background: 'transparent', border: 'none',
  borderBottom: '1px dashed var(--ink-mid)',
  fontFamily: "'Courier Prime', monospace", fontSize: '0.82rem',
  color: 'var(--ink)', padding: '3px 0', outline: 'none',
};

const outlineBtn: React.CSSProperties = {
  fontFamily: "'Special Elite', serif", fontSize: '0.8rem', letterSpacing: 3,
  textTransform: 'uppercase', background: 'transparent', color: 'var(--paper)',
  border: '1px solid rgba(244,239,227,0.4)', padding: '9px 20px', cursor: 'pointer',
  marginTop: '1rem', display: 'block', width: '100%', maxWidth: 640, textAlign: 'center',
};
