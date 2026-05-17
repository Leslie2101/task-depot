import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { Task } from '../types';

const STORAGE_KEY = 'task-depot:cart';

function loadCart(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x): x is number => typeof x === 'number') : [];
  } catch {
    return [];
  }
}

function saveCart(ids: number[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(ids)); } catch { /* quota exceeded – ignore */ }
}

interface CartContextValue {
  cartIds: number[];
  toggle: (id: number) => void;
  remove: (id: number) => void;
  clear: () => void;
  pruneToValid: (validIds: number[]) => void;   // call after tasks load to drop deleted-task ids
  cartTasks: (tasks: Task[]) => Task[];
  totalHours: (tasks: Task[]) => number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartIds, setCartIds] = useState<number[]>(loadCart);

  // Keep localStorage in sync whenever cartIds changes
  useEffect(() => { saveCart(cartIds); }, [cartIds]);

  const toggle = useCallback((id: number) => {
    setCartIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }, []);

  const remove = useCallback((id: number) => {
    setCartIds(prev => prev.filter(x => x !== id));
  }, []);

  const clear = useCallback(() => setCartIds([]), []);

  // Drop any saved IDs that no longer exist in the task list
  const pruneToValid = useCallback((validIds: number[]) => {
    setCartIds(prev => {
      const next = prev.filter(id => validIds.includes(id));
      return next.length === prev.length ? prev : next;   // avoid re-render if nothing changed
    });
  }, []);

  const cartTasks = useCallback(
    (tasks: Task[]) => tasks.filter(t => cartIds.includes(t.id)),
    [cartIds]
  );

  const totalHours = useCallback(
    (tasks: Task[]) => cartTasks(tasks).reduce((s, t) => s + t.hours, 0),
    [cartTasks]
  );

  return (
    <CartContext.Provider value={{ cartIds, toggle, remove, clear, pruneToValid, cartTasks, totalHours }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
