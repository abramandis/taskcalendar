import React, { useMemo, useState } from 'react';
import { Task } from '../types';

interface CalendarProps {
  tasks: Task[];
  onUpdateTask: (task: Task) => void;
  onAddTask: (task: Task) => void;
}

const Calendar: React.FC<CalendarProps> = ({ tasks, onUpdateTask, onAddTask }) => {
  const [quickAddTask, setQuickAddTask] = useState<{ day: Date; time: string } | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

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
    const startHour = new Date(task.startTime).getHours();
    const startMinute = new Date(task.startTime).getMinutes();
    // Convert to 30-minute block position
    const startIndex = startHour * 2 + Math.floor(startMinute / 30);
    // Convert duration to 30-minute blocks (rounding up)
    const height = Math.ceil(task.duration / 30) * 40; // 40px per 30 minutes (h-10)
    return {
      top: `${startIndex * 40}px`,
      height: `${height}px`,
    };
  };

  const isDaytime = (hour: number) => {
    return hour >= sunriseHour && hour < sunsetHour;
  };

  const days = getDays();

  const getTasksForTimeSlot = (date: Date, timeSlot: Date) => {
    return tasks.filter(task => {
      const taskDate = new Date(task.startTime);
      return (
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear() &&
        taskDate.getHours() === timeSlot.getHours() &&
        taskDate.getMinutes() === timeSlot.getMinutes()
      );
    });
  };

  const formatTime = (date: Date, isMilitaryTime: boolean) => {
    return date.toLocaleTimeString('en-US', {
      hour: isMilitaryTime ? 'numeric' : '2-digit',
      minute: '2-digit',
      hour12: !isMilitaryTime
    });
  };

  const handleDoubleClick = (day: Date, time: string) => {
    setQuickAddTask({ day, time });
  };

  const handleQuickAddSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const title = (form.elements.namedItem('title') as HTMLInputElement).value;
    const [hours, minutes] = quickAddTask!.time.split(':').map(Number);
    
    const startTime = new Date(quickAddTask!.day);
    startTime.setHours(hours);
    startTime.setMinutes(minutes);

    const newTask: Task = {
      id: Date.now().toString(),
      title,
      description: '',
      startTime,
      duration: 30, // Default to 30 minutes
      completed: false,
    };

    onAddTask(newTask);
    setQuickAddTask(null);
  };

  const handleTaskDoubleClick = (task: Task) => {
    setEditingTask(task);
  };

  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const title = (form.elements.namedItem('title') as HTMLInputElement).value;

    if (editingTask) {
      onUpdateTask({
        ...editingTask,
        title
      });
      setEditingTask(null);
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg overflow-hidden transition-colors duration-200">
      {/* Calendar Header */}
      <div className="grid grid-cols-3 border-b border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800">
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
      <div className="relative h-[600px] overflow-y-auto">
        <div className="flex">
          {/* Time Slots */}
          <div className="sticky left-0 w-16 border-r border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800">
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
          <div className="flex-1 grid grid-cols-3">
            {days.map((day, dayIndex) => (
              <div key={dayIndex} className="relative border-r border-neutral-200 dark:border-neutral-700 last:border-r-0">
                {/* Time Grid Lines */}
                {timeSlots.map((time, index) => {
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
                      onDoubleClick={() => handleDoubleClick(day.date, time)}
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
                      onDoubleClick={() => handleTaskDoubleClick(task)}
                    >
                      {editingTask?.id === task.id ? (
                        <form onSubmit={handleEditSubmit} className="space-y-2 bg-white dark:bg-neutral-800 rounded-lg shadow-lg p-2 border border-neutral-200 dark:border-neutral-700 z-50 relative">
                          <input
                            type="text"
                            name="title"
                            defaultValue={task.title}
                            className="w-full px-2 py-1 text-sm bg-transparent border border-neutral-200 dark:border-neutral-700 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-neutral-50"
                            autoFocus
                          />
                          <div className="flex justify-end space-x-2">
                            <button
                              type="button"
                              onClick={() => setEditingTask(null)}
                              className="px-2 py-1 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-50"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-2 py-1 text-xs bg-primary-500 text-white rounded hover:bg-primary-600"
                            >
                              Save
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="font-medium text-sm truncate text-neutral-900 dark:text-neutral-50">{task.title}</div>
                      )}
                    </div>
                  ))}

                {/* Quick Add Form */}
                {quickAddTask && 
                 quickAddTask.day.toDateString() === day.date.toDateString() && 
                 timeSlots.some(t => t === quickAddTask.time) && (
                  <form
                    onSubmit={handleQuickAddSubmit}
                    className="absolute left-2 right-2 bg-white dark:bg-neutral-800 rounded-lg shadow-lg p-2 border border-neutral-200 dark:border-neutral-700"
                    style={{
                      top: `${timeSlots.findIndex(t => t === quickAddTask.time) * 40}px`,
                    }}
                  >
                    <input
                      type="text"
                      name="title"
                      placeholder="Task title"
                      className="w-full px-2 py-1 text-sm bg-transparent border border-neutral-200 dark:border-neutral-700 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-neutral-50"
                      autoFocus
                    />
                    <div className="flex justify-end mt-2 space-x-2">
                      <button
                        type="button"
                        onClick={() => setQuickAddTask(null)}
                        className="px-2 py-1 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-2 py-1 text-xs bg-primary-500 text-white rounded hover:bg-primary-600"
                      >
                        Add
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar; 