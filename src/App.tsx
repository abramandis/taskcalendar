import React, { useState, useEffect } from 'react';
import Calendar from './components/Calendar';
import TaskForm from './components/TaskForm';
import DayMetrics from './components/DayMetrics';
import { Task } from './types';

function App() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedTasks = localStorage.getItem('tasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    // Set dark mode by default
    document.documentElement.classList.add('dark');
  }, []);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const addTask = (task: Task) => {
    setTasks([...tasks, task]);
  };

  const updateTask = (updatedTask: Task) => {
    setTasks(tasks.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    ));
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 transition-colors duration-200">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">Task Calendar</h1>
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-100 hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors"
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Calendar 
              tasks={tasks} 
              onUpdateTask={updateTask} 
              onAddTask={addTask}
            />
          </div>
          <div className="space-y-8">
            <DayMetrics 
              tasks={tasks}
              date={new Date()}
              sunriseHour={6}
              sunsetHour={20}
            />
            <TaskForm onAddTask={addTask} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App; 