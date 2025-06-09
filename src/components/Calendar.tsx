import React, { useMemo } from 'react';
import { Task } from '../types';

interface CalendarProps {
  tasks: Task[];
  onUpdateTask: (task: Task) => void;
}

const Calendar: React.FC<CalendarProps> = ({ tasks, onUpdateTask }) => {
  // Generate time slots for every 30 minutes
  const timeSlots = Array.from({ length: 24 * 2 }, (_, i) => {
    const hour = Math.floor(i / 2);
    const minute = (i % 2) * 30;
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  });

  // Calculate sunrise and sunset times (simplified for demo)
  const { sunriseHour, sunsetHour } = useMemo(() => {
    const now = new Date();
    const month = now.getMonth();
    // Approximate sunrise/sunset times based on month (northern hemisphere)
    // These are rough estimates - in a real app, you'd want to use a proper sunrise/sunset API
    const sunriseHour = month >= 2 && month <= 8 ? 6 : 7; // Summer: 6am, Winter: 7am
    const sunsetHour = month >= 2 && month <= 8 ? 20 : 17; // Summer: 8pm, Winter: 5pm
    return { sunriseHour, sunsetHour };
  }, []);

  const getDays = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const nextDay = new Date(today);
    nextDay.setDate(today.getDate() + 2);
    return [
      { date: today, label: 'Today' },
      { date: tomorrow, label: 'Tomorrow' },
      { date: nextDay, label: nextDay.toLocaleDateString('en-US', { weekday: 'long' }) }
    ];
  };

  const getTaskPosition = (task: Task) => {
    const startHour = task.startTime.getHours();
    const startMinute = task.startTime.getMinutes();
    // Convert to 30-minute block position
    const startIndex = startHour * 2 + Math.floor(startMinute / 30);
    // Convert duration to 30-minute blocks (rounding up)
    const height = Math.ceil(task.duration / 30) * 80; // 80px per 30 minutes
    return {
      top: `${startIndex * 80}px`,
      height: `${height}px`,
    };
  };

  const isDaytime = (hour: number) => {
    return hour >= sunriseHour && hour < sunsetHour;
  };

  const days = getDays();

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg overflow-hidden transition-colors duration-200">
      {/* Calendar Header */}
      <div className="grid grid-cols-3 border-b border-neutral-200 dark:border-neutral-700">
        {days.map((day, index) => (
          <div key={index} className="p-4 text-center">
            <div className="text-sm text-neutral-500 dark:text-neutral-400">
              {day.date.toLocaleDateString('en-US', { weekday: 'long' })}
            </div>
            <div className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
              {day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="relative">
        {/* Time Slots */}
        <div className="absolute left-0 w-16 border-r border-neutral-200 dark:border-neutral-700">
          {timeSlots.map((time, index) => {
            const hour = Math.floor(index / 2);
            const isHalfHour = index % 2 === 1;
            return (
              <div
                key={time}
                className={`h-10 border-b ${
                  isHalfHour 
                    ? 'border-dashed border-neutral-200 dark:border-neutral-700' 
                    : 'border-neutral-100 dark:border-neutral-700'
                } flex items-center justify-end pr-2 ${
                  isDaytime(hour) 
                    ? 'bg-primary-50 dark:bg-primary-900/20' 
                    : 'bg-neutral-50 dark:bg-neutral-900/50'
                }`}
              >
                {!isHalfHour && (
                  <span className="text-xs text-neutral-400 dark:text-neutral-500">{time}</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Calendar Columns */}
        <div className="grid grid-cols-3 ml-16">
          {days.map((day, dayIndex) => (
            <div key={dayIndex} className="relative border-r border-neutral-200 dark:border-neutral-700 last:border-r-0">
              {/* Time Grid Lines */}
              {timeSlots.map((_, index) => {
                const hour = Math.floor(index / 2);
                const isHalfHour = index % 2 === 1;
                return (
                  <div
                    key={index}
                    className={`h-10 border-b ${
                      isHalfHour 
                        ? 'border-dashed border-neutral-200 dark:border-neutral-700' 
                        : 'border-neutral-100 dark:border-neutral-700'
                    } ${
                      isDaytime(hour) 
                        ? 'bg-primary-50 dark:bg-primary-900/20' 
                        : 'bg-neutral-50 dark:bg-neutral-900/50'
                    }`}
                  />
                );
              })}

              {/* Tasks */}
              {tasks
                .filter(task => {
                  const taskDate = new Date(task.startTime);
                  return taskDate.toDateString() === day.date.toDateString();
                })
                .map((task) => (
                  <div
                    key={task.id}
                    className={`absolute left-2 right-2 rounded-lg p-2 cursor-move transition-all duration-200 ${
                      task.completed 
                        ? 'bg-accent-100 dark:bg-accent-900/50 border border-accent-200 dark:border-accent-800' 
                        : 'bg-secondary-100 dark:bg-secondary-900/50 border border-secondary-200 dark:border-secondary-800 hover:bg-secondary-200 dark:hover:bg-secondary-800/70'
                    }`}
                    style={getTaskPosition(task)}
                    onClick={() => onUpdateTask({ ...task, completed: !task.completed })}
                  >
                    <div className="font-medium text-sm truncate text-neutral-900 dark:text-neutral-50">{task.title}</div>
                    {task.description && (
                      <div className="text-xs text-neutral-600 dark:text-neutral-300 truncate">{task.description}</div>
                    )}
                    <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                      {new Date(task.startTime).toLocaleTimeString('en-US', { 
                        hour: 'numeric', 
                        minute: '2-digit',
                        hour12: true 
                      })}
                      {' - '}
                      {new Date(new Date(task.startTime).getTime() + task.duration * 60000)
                        .toLocaleTimeString('en-US', { 
                          hour: 'numeric', 
                          minute: '2-digit',
                          hour12: true 
                        })}
                    </div>
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Calendar; 