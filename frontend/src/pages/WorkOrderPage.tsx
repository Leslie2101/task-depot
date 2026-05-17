import { useState, useEffect, useCallback } from 'react';
import type { Task, Priority } from '../types';
import { getTasks, getAllTags, createTask, deleteTask } from '../api';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { PaperPanel } from '../components/PaperPanel';
import { StoreHeader } from '../components/StoreHeader';
import { CartBar } from '../components/CartBar';
import { TagBadge, TagInput } from '../components/TagBadge';

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: 'hi',  label: '!! High' },
  { value: 'med', label: '!  Med'  },
  { value: 'lo',  label: '—  Low'  },
];

const PRIO_STYLE: Record<Priority, { color: string; label: string }> = {
  hi:  { color: '#c0392b', label: '!!' },
  med: { color: 'var(--ink-mid)', label: '!' },
  lo:  { color: 'var(--ink-faint)', label: '—' },
};

export function WorkOrderPage() {
  const [tasks, setTasks]           = useState<Task[]>([]);
  const [allTags, setAllTags]       = useState<string[]>([]);
  const [activeTag, setActiveTag]   = useState<string | null>(null);
  const [loading, setLoading]       = useState(true);

  // form state
  const [name, setName]             = useState('');
  const [hours, setHours]           = useState('');
  const [priority, setPriority]     = useState<Priority>('med');
  const [newTags, setNewTags]       = useState<string[]>([]);
  const [adding, setAdding]         = useState(false);

  const { cartIds, toggle, pruneToValid } = useCart();
  const toast                       = useToast();

  const fetchTasks = useCallback(async (tag?: string | null) => {
    setLoading(true);
    try {
      const [t, tags] = await Promise.all([getTasks(tag ?? undefined), getAllTags()]);
      setTasks(t);
      setAllTags(tags);
      pruneToValid(t.map(task => task.id));
    } catch (e: any) {
      toast(e.message, true);
    } finally {
      setLoading(false);
    }
  }, [toast, pruneToValid]);

  useEffect(() => { fetchTasks(activeTag); }, [activeTag, fetchTasks]);

  const handleAdd = async () => {
    if (!name.trim()) return;
    const h = parseFloat(hours);
    if (!h || h <= 0) return;
    setAdding(true);
    try {
      const task = await createTask({ name: name.trim(), hours: h, priority, tags: newTags });
      setTasks(prev => [task, ...prev]);
      // merge new tags into allTags
      setAllTags(prev => Array.from(new Set([...prev, ...task.tags])).sort());
      setName(''); setHours(''); setNewTags([]);
      toast('Task added ✓');
    } catch (e: any) {
      toast(e.message, true);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteTask(id);
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (e: any) {
      toast(e.message, true);
    }
  };

  const visibleTasks = activeTag
    ? tasks.filter(t => t.tags.includes(activeTag))
    : tasks;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 1rem 6rem' }}>
      <StoreHeader subtitle="Your Personal Work Order System" />

      {/* ── ADD FORM ── */}
      <PaperPanel style={{ marginBottom: '1.5rem' }}>
        <p className="panel-title">— New Work Item —</p>

        {/* Task name */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
          <span style={labelStyle}>Task</span>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && document.getElementById('hours-input')?.focus()}
            placeholder="describe the work..."
            maxLength={60}
            style={inputStyle}
          />
        </div>

        {/* Hours */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 10 }}>
          <span style={labelStyle}>Hrs</span>
          <input
            id="hours-input"
            type="number" min={0.25} max={99} step={0.25}
            value={hours}
            onChange={e => setHours(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="0.0"
            style={{ ...inputStyle, flex: 'none', width: 72, textAlign: 'right' }}
          />
          <span style={{ fontSize: '0.72rem', color: 'var(--ink-light)', letterSpacing: 1 }}>HRS = PRICE</span>
        </div>

        {/* Priority */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 10 }}>
          <span style={labelStyle}>Priority</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {PRIORITY_OPTIONS.map(o => (
              <button
                key={o.value}
                onClick={() => setPriority(o.value)}
                style={{
                  fontFamily: "'Courier Prime', monospace",
                  fontSize: '0.7rem', letterSpacing: 1,
                  border: `1px solid ${priority === o.value ? 'var(--ink)' : 'var(--ink-faint)'}`,
                  background: priority === o.value ? 'var(--ink)' : 'transparent',
                  color: priority === o.value ? 'var(--paper)' : 'var(--ink-mid)',
                  padding: '2px 7px', cursor: 'pointer', textTransform: 'uppercase',
                  transition: 'all 0.15s',
                }}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginTop: 10 }}>
          <span style={{ ...labelStyle, paddingTop: 4 }}>Tags</span>
          <div style={{ flex: 1 }}>
            <TagInput tags={newTags} onChange={setNewTags} suggestions={allTags} />
          </div>
        </div>

        <button
          onClick={handleAdd}
          disabled={adding}
          style={{
            width: '100%', background: 'var(--ink)', color: 'var(--paper)',
            border: 'none', fontFamily: "'Special Elite', serif",
            fontSize: '0.85rem', letterSpacing: 3, textTransform: 'uppercase',
            padding: 9, cursor: adding ? 'not-allowed' : 'pointer',
            marginTop: 14, opacity: adding ? 0.5 : 1, transition: 'opacity 0.15s',
          }}
        >
          {adding ? <><span className="spinner" />Adding...</> : '+ Add to Work Order'}
        </button>
      </PaperPanel>

      {/* ── TASK LIST ── */}
      <PaperPanel>
        {/* Tag filter bar */}
        {allTags.length > 0 && (
          <>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', padding: '8px 0 4px' }}>
              <button
                onClick={() => setActiveTag(null)}
                style={{
                  fontFamily: "'Courier Prime', monospace",
                  fontSize: '0.62rem', letterSpacing: 1,
                  textTransform: 'uppercase', border: '1px solid var(--ink-faint)',
                  background: activeTag === null ? 'var(--ink)' : 'transparent',
                  color: activeTag === null ? 'var(--paper)' : 'var(--ink-light)',
                  padding: '2px 8px', cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                All
              </button>
              {allTags.map(tag => (
                <TagBadge
                  key={tag}
                  tag={tag}
                  active={activeTag === tag}
                  onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                />
              ))}
            </div>
            <hr className="divider-solid" />
          </>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', letterSpacing: 2, textTransform: 'uppercase', color: 'var(--ink-light)', padding: '4px 0' }}>
          <span>☐ Select completed items</span>
          <span style={{ display: 'flex', gap: 24 }}><span>Priority</span><span>Hrs</span></span>
        </div>
        <hr className="divider-solid" />

        {loading ? (
          <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--ink-faint)', fontSize: '0.75rem', letterSpacing: 2 }}>
            <span className="spinner" />Loading...
          </div>
        ) : visibleTasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--ink-faint)', fontSize: '0.75rem', letterSpacing: 2, fontStyle: 'italic', textTransform: 'uppercase' }}>
            {activeTag ? `— no tasks tagged #${activeTag} —` : '— no tasks yet. add one above —'}
          </div>
        ) : (
          <ul style={{ listStyle: 'none' }}>
            {visibleTasks.map(t => {
              const ps = PRIO_STYLE[t.priority as Priority];
              const inCart = cartIds.includes(t.id);
              return (
                <li
                  key={t.id}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 8,
                    padding: '8px 0', borderBottom: '1px dashed var(--ink-faint)',
                  }}
                >
                  {/* Checkbox */}
                  <div
                    onClick={() => toggle(t.id)}
                    style={{
                      width: 14, height: 14, flexShrink: 0, marginTop: 3,
                      border: '1.5px solid var(--ink-mid)',
                      background: inCart ? 'var(--ink)' : 'transparent',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'background 0.15s', color: 'var(--paper)', fontSize: 10,
                    }}
                  >
                    {inCart ? '✓' : ''}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.88rem', textTransform: 'uppercase', lineHeight: 1.3 }}>{t.name}</div>
                    {t.tags.length > 0 && (
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
                        {t.tags.map(tag => (
                          <TagBadge
                            key={tag}
                            tag={tag}
                            small
                            active={activeTag === tag}
                            onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Priority tag */}
                  <span style={{
                    fontSize: '0.6rem', letterSpacing: 1.5, textTransform: 'uppercase',
                    padding: '1px 5px', border: `1px solid ${ps.color}`,
                    color: ps.color, flexShrink: 0, marginTop: 2,
                  }}>
                    {ps.label}
                  </span>

                  {/* Hours */}
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, minWidth: 48, textAlign: 'right', flexShrink: 0, marginTop: 2 }}>
                    {t.hours.toFixed(2)}<span style={{ fontSize: '0.6rem', fontWeight: 400, marginLeft: 2 }}>hrs</span>
                  </span>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(t.id)}
                    style={{ background: 'none', border: 'none', color: 'var(--ink-faint)', cursor: 'pointer', fontSize: '0.9rem', padding: '0 2px', marginTop: 2, transition: 'color 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#c0392b')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink-faint)')}
                  >
                    ✕
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </PaperPanel>

      <CartBar tasks={tasks} />
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  fontSize: '0.65rem', letterSpacing: 2, textTransform: 'uppercase',
  color: 'var(--ink-light)', minWidth: 52,
};
const inputStyle: React.CSSProperties = {
  flex: 1, background: 'transparent', border: 'none',
  borderBottom: '1px dashed var(--ink-mid)',
  fontFamily: "'Courier Prime', monospace", fontSize: '0.85rem',
  color: 'var(--ink)', padding: '3px 0', outline: 'none',
};
