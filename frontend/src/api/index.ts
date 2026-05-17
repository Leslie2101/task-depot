import type { Task, TaskCreate, Receipt, ReceiptCreate } from '../types';

const BASE = import.meta.env.VITE_API_URL ?? '';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (res.status === 204) return undefined as T;
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail ?? 'Request failed');
  return data as T;
}

export const getTasks        = (tag?: string) =>
  request<Task[]>(`/tasks${tag ? `?tag=${encodeURIComponent(tag)}` : ''}`);

export const getAllTags       = () => request<string[]>('/tasks/tags');
export const createTask      = (p: TaskCreate) => request<Task>('/tasks', { method: 'POST', body: JSON.stringify(p) });
export const deleteTask      = (id: number) => request<void>(`/tasks/${id}`, { method: 'DELETE' });
export const createReceipt   = (p: ReceiptCreate) => request<Receipt>('/receipts', { method: 'POST', body: JSON.stringify(p) });
export const getReceipts     = () => request<Receipt[]>('/receipts');
export const getReceipt      = (id: number) => request<Receipt>(`/receipts/${id}`);
