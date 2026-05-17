import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import type { Task } from '../types';

export function CartBar({ tasks }: { tasks: Task[] }) {
  const { cartTasks, totalHours } = useCart();
  const nav = useNavigate();
  const ct = cartTasks(tasks);
  const hrs = totalHours(tasks);

  if (ct.length === 0) return null;

  return (
    <div className="no-print" style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: 'var(--ink)', color: 'var(--paper)',
      padding: '0.9rem 1.5rem',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      transform: ct.length ? 'translateY(0)' : 'translateY(100%)',
      transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)',
      zIndex: 100,
    }}>
      <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: '0.78rem', letterSpacing: 1 }}>
        <div>
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            background: '#d44a2a', color: 'white',
            width: 20, height: 20, fontSize: '0.7rem', fontWeight: 700,
            marginRight: 6,
          }}>
            {ct.length}
          </span>
          items in cart
        </div>
        <div style={{ fontSize: '0.65rem', color: 'rgba(244,239,227,0.6)', marginTop: 2 }}>
          {hrs.toFixed(2)} hrs selected
        </div>
      </div>
      <button
        onClick={() => nav('/checkout')}
        style={{
          fontFamily: "'Special Elite', serif",
          fontSize: '0.85rem', letterSpacing: 3,
          textTransform: 'uppercase',
          background: 'var(--paper)', color: 'var(--ink)',
          border: 'none', padding: '9px 20px', cursor: 'pointer',
        }}
      >
        Checkout →
      </button>
    </div>
  );
}
