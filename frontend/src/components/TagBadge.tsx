import { useState, type KeyboardEvent } from 'react';

const TAG_COLORS: Record<string, { bg: string; border: string; color: string }> = {};
const PALETTE = [
  { bg: 'rgba(28,24,21,0.08)',   border: 'rgba(28,24,21,0.35)',  color: 'var(--ink-mid)' },
  { bg: 'rgba(192,57,43,0.08)',  border: 'rgba(192,57,43,0.4)',  color: '#a93226' },
  { bg: 'rgba(42,122,59,0.08)',  border: 'rgba(42,122,59,0.4)',  color: '#1e6b35' },
  { bg: 'rgba(41,128,185,0.08)', border: 'rgba(41,128,185,0.4)', color: '#1a5c88' },
  { bg: 'rgba(142,68,173,0.08)', border: 'rgba(142,68,173,0.4)', color: '#7d3c98' },
  { bg: 'rgba(211,84,0,0.08)',   border: 'rgba(211,84,0,0.4)',   color: '#b94600' },
];

function getTagStyle(tag: string) {
  if (!TAG_COLORS[tag]) {
    const idx = [...tag].reduce((a, c) => a + c.charCodeAt(0), 0) % PALETTE.length;
    TAG_COLORS[tag] = PALETTE[idx];
  }
  return TAG_COLORS[tag];
}

interface TagBadgeProps {
  tag: string;
  onRemove?: () => void;
  onClick?: () => void;
  active?: boolean;
  small?: boolean;
}

export function TagBadge({ tag, onRemove, onClick, active, small }: TagBadgeProps) {
  const s = getTagStyle(tag);
  return (
    <span
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 3,
        background: active ? s.border : s.bg,
        border: `1px solid ${s.border}`,
        color: active ? 'var(--paper)' : s.color,
        fontSize: small ? '0.6rem' : '0.65rem',
        letterSpacing: '1px',
        textTransform: 'uppercase',
        padding: small ? '1px 5px' : '2px 7px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.15s',
        userSelect: 'none',
        fontFamily: "'Courier Prime', monospace",
      }}
    >
      #{tag}
      {onRemove && (
        <span
          onClick={e => { e.stopPropagation(); onRemove(); }}
          style={{ cursor: 'pointer', opacity: 0.6, fontSize: '0.75rem', lineHeight: 1 }}
        >
          ×
        </span>
      )}
    </span>
  );
}

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
}

export function TagInput({ tags, onChange, suggestions = [] }: TagInputProps) {
  const [input, setInput] = useState('');
  const [showSug, setShowSug] = useState(false);

  const add = (raw: string) => {
    const tag = raw.trim().toLowerCase().replace(/\s+/g, '-');
    if (!tag || tags.includes(tag) || tags.length >= 10) return;
    onChange([...tags, tag]);
    setInput('');
    setShowSug(false);
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(input); }
    if (e.key === 'Backspace' && !input && tags.length) {
      onChange(tags.slice(0, -1));
    }
  };

  const filtered = suggestions.filter(
    s => !tags.includes(s) && s.includes(input.toLowerCase())
  );

  return (
    <div style={{ position: 'relative' }}>
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 4,
        borderBottom: '1px dashed var(--ink-mid)',
        paddingBottom: 4, minHeight: 28, alignItems: 'center',
      }}>
        {tags.map(t => (
          <TagBadge key={t} tag={t} onRemove={() => onChange(tags.filter(x => x !== t))} />
        ))}
        <input
          value={input}
          onChange={e => { setInput(e.target.value); setShowSug(true); }}
          onKeyDown={onKey}
          onFocus={() => setShowSug(true)}
          onBlur={() => setTimeout(() => setShowSug(false), 150)}
          placeholder={tags.length === 0 ? 'add tags… (enter or comma)' : ''}
          style={{
            background: 'transparent', border: 'none', outline: 'none',
            fontFamily: "'Courier Prime', monospace",
            fontSize: '0.82rem', color: 'var(--ink)',
            minWidth: 100, flex: 1,
          }}
        />
      </div>

      {/* Suggestions dropdown */}
      {showSug && filtered.length > 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0,
          background: 'var(--paper-dark)',
          border: '1px solid var(--ink-faint)',
          zIndex: 50, maxHeight: 140, overflowY: 'auto',
        }}>
          {filtered.slice(0, 8).map(s => (
            <div
              key={s}
              onMouseDown={() => add(s)}
              style={{
                padding: '5px 10px', cursor: 'pointer', display: 'flex',
                alignItems: 'center', gap: 6,
                fontFamily: "'Courier Prime', monospace", fontSize: '0.78rem',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--ink-faint)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <TagBadge tag={s} small />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
