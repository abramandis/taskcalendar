export interface Task {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  duration: number; // in minutes
  completed: boolean;
} 