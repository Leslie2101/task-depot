export type Priority = 'hi' | 'med' | 'lo';

export interface Task {
  id: number;
  name: string;
  hours: number;
  priority: Priority;
  tags: string[];
  created_at: string;
}

export interface TaskCreate {
  name: string;
  hours: number;
  priority: Priority;
  tags: string[];
}

export interface ReceiptItem {
  id: number;
  name: string;
  hours: number;
  priority: Priority;
  tags: string[];
}

export interface Receipt {
  id: number;
  order_number: string;
  worker_name: string | null;
  note: string | null;
  items: ReceiptItem[];
  total_hours: number;
  created_at: string;
}

export interface ReceiptCreate {
  task_ids: number[];
  worker_name?: string;
  note?: string;
}
