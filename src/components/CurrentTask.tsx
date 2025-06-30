import React, { useState, useEffect } from 'react';
import { Task } from '../types';

interface CurrentTaskProps {
  tasks: Task[];
}

const CurrentTask: React.FC<CurrentTaskProps> = ({ tasks }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const currentTask = tasks.find(task => {
    const taskStart = new Date(task.startTime);
    const taskEnd = new Date(taskStart.getTime() + task.duration * 60000);
    
    return currentTime >= taskStart && currentTime <= taskEnd;
  });

  if (!currentTask) {
    return (
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-2 transition-colors duration-200">
        <h2 className="text-base font-semibold mb-1 text-neutral-900 dark:text-neutral-50">Current Task</h2>
        <p className="text-xs text-neutral-600 dark:text-neutral-400">No task scheduled for this time</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-2 transition-colors duration-200">
      <div className="space-y-1 px-2">
        <div className="flex items-center justify-between">
          <span className="text-base font-medium text-neutral-900 dark:text-neutral-50">{currentTask.title}</span>
          <span className={`px-3 py-0.5 rounded-full text-xs ${
            currentTask.completed 
              ? 'bg-accent-100 dark:bg-accent-900 text-accent-700 dark:text-accent-300'
              : 'bg-secondary-100 dark:bg-secondary-900 text-secondary-700 dark:text-secondary-300'
          }`}>
            {currentTask.completed ? 'Completed' : 'In Progress'}
          </span>
        </div>
        <div className="text-xs text-neutral-600 dark:text-neutral-400">
          {new Date(currentTask.startTime).toLocaleTimeString('en-US', { 
            hour: 'numeric',
            minute: '2-digit',
            hour12: true 
          })} - {
            new Date(new Date(currentTask.startTime).getTime() + currentTask.duration * 60000)
              .toLocaleTimeString('en-US', { 
                hour: 'numeric',
                minute: '2-digit',
                hour12: true 
              })
          }
        </div>
      </div>
    </div>
  );
};

export default CurrentTask; 