import React, { useState } from 'react';
import Calendar from './components/Calendar';
import TaskForm from './components/TaskForm';
import { Task } from './types';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);

  const addTask = (task: Task) => {
    setTasks([...tasks, task]);
  };

  const updateTask = (updatedTask: Task) => {
    setTasks(tasks.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    ));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Task Calendar</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Calendar tasks={tasks} onUpdateTask={updateTask} />
          </div>
          <div>
            <TaskForm onAddTask={addTask} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App; 