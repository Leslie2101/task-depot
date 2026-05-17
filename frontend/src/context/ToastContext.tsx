import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';

interface Toast { msg: string; error: boolean; id: number }
interface ToastCtx { show: (msg: string, error?: boolean) => void }

const Ctx = createContext<ToastCtx | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);

  const show = useCallback((msg: string, error = false) => {
    setToast({ msg, error, id: Date.now() });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(t);
  }, [toast]);

  return (
    <Ctx.Provider value={{ show }}>
      {children}
      {toast && (
        <div style={{
          position: 'fixed', top: '1.2rem', left: '50%',
          transform: 'translateX(-50%)',
          background: toast.error ? '#c0392b' : 'var(--ink)',
          color: 'var(--paper)',
          fontFamily: "'Courier Prime', monospace",
          fontSize: '0.78rem', letterSpacing: '1px',
          padding: '8px 18px', zIndex: 999,
          whiteSpace: 'nowrap',
          animation: 'fadeInDown 0.25s ease',
        }}>
          {toast.msg}
        </div>
      )}
    </Ctx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useToast outside ToastProvider');
  return ctx.show;
}
