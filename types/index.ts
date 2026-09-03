export type TaskStatus = 'انجام نشده' | 'در حال انجام' | 'منتظر' | 'انجام شده' | 'کنسل شده';
export type TaskPriority = 'فوری' | 'عادی' | 'غیرمهم';

export interface Project {
  id: string;
  name: string;
  sort_order: number;
  is_archived: boolean;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  do_date: string | null;
  deadline: string | null;
  created_at: string;
  updated_at: string;
}
