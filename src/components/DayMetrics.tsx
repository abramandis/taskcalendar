import React from 'react';
import { Task } from '../types';

interface DayMetricsProps {
  tasks: Task[];
  date: Date;
  sunriseHour: number;
  sunsetHour: number;
}

const DayMetrics: React.FC<DayMetricsProps> = ({ tasks, date, sunriseHour, sunsetHour }) => {
  // Filter tasks for the specific date
  const dayTasks = tasks.filter(task => {
    const taskDate = new Date(task.startTime);
    return taskDate.toDateString() === date.toDateString();
  });

  // Calculate metrics
  const totalTasks = dayTasks.length;
  const completedTasks = dayTasks.filter(task => task.completed).length;
  const remainingTasks = totalTasks - completedTasks;
  const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Calculate total scheduled hours
  const totalScheduledHours = dayTasks.reduce((total, task) => {
    return total + (task.duration / 60); // Convert minutes to hours
  }, 0);

  // Calculate available daylight hours
  const daylightHours = sunsetHour - sunriseHour;
  const planningPercentage = (totalScheduledHours / daylightHours) * 100;

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6 transition-colors duration-200">
      <h2 className="text-xl font-semibold mb-6 text-neutral-900 dark:text-neutral-50">
        {date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
      </h2>
      
      <div className="space-y-6">
        {/* Planning Progress */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-neutral-600 dark:text-neutral-400">Day Planning</span>
            <span className="text-sm font-medium text-neutral-900 dark:text-neutral-50">
              {planningPercentage.toFixed(1)}%
            </span>
          </div>
          <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary-500 dark:bg-primary-400 transition-all duration-300"
              style={{ width: `${Math.min(planningPercentage, 100)}%` }}
            />
          </div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            {totalScheduledHours.toFixed(1)}h of {daylightHours}h daylight
          </div>
        </div>

        {/* Task Completion */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-neutral-600 dark:text-neutral-400">Task Completion</span>
            <span className="text-sm font-medium text-neutral-900 dark:text-neutral-50">
              {completionPercentage.toFixed(1)}%
            </span>
          </div>
          <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-accent-500 dark:bg-accent-400 transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Task Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">
              {totalTasks}
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">
              Total Tasks
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-semibold text-accent-500 dark:text-accent-400">
              {completedTasks}
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">
              Completed
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-semibold text-primary-500 dark:text-primary-400">
              {remainingTasks}
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">
              Remaining
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DayMetrics; 