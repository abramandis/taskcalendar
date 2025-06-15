interface Task {
  id: string;
  title: string;
  description?: string;
  startTime: Date ;
  duration: number;
  completed: boolean;
}