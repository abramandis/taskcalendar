import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Task } from '../types';
import { TaskEditForm } from './TaskEditForm';

interface CalendarProps {
  tasks: Task[];
  onUpdateTask: (task: Task) => void;
  onAddTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

interface HoverState {
  taskId: string;
  timeout: NodeJS.Timeout;
}

const Calendar: React.FC<CalendarProps> = ({ tasks, onUpdateTask, onAddTask, onDeleteTask }) => {
  const [quickAddTask, setQuickAddTask] = useState<{ day: Date; time: string } | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dropTarget, setDropTarget] = useState<{ day: Date; time: string } | null>(null);
  const [hoveredTask, setHoveredTask] = useState<HoverState | null>(null);
  const [clickPosition, setClickPosition] = useState<{ x: number; y: number } | null>(null);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Calculate the position of the current time line
  const getCurrentTimePosition = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    // Convert to 30-minute block position (2 blocks per hour)
    const position = (hours * 2) + (minutes / 30);
    return `${position * 40}px`; // 40px per 30-minute block
  };

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

  const handleTaskDoubleClick = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    setClickPosition({ x: e.clientX, y: e.clientY });
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

  // Function to check if a time slot is occupied
  const isTimeSlotOccupied = (day: Date, time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return tasks.some(task => {
      const taskDate = new Date(task.startTime);
      return (
        taskDate.toDateString() === day.toDateString() &&
        taskDate.getHours() === hours &&
        taskDate.getMinutes() === minutes
      );
    });
  };

  // Function to handle drag start
  const handleDragStart = (e: React.DragEvent, task: Task) => {
    e.dataTransfer.setData('text/plain', task.id);
    setDraggedTask(task);
    // Add a semi-transparent effect to the dragged task
    if (e.target instanceof HTMLElement) {
      e.target.style.opacity = '0.5';
    }
  };

  // Function to handle drag end
  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedTask(null);
    setDropTarget(null);
    // Reset opacity
    if (e.target instanceof HTMLElement) {
      e.target.style.opacity = '1';
    }
  };

  // Function to handle drag over
  const handleDragOver = (e: React.DragEvent, day: Date, time: string) => {
    e.preventDefault();
    if (!isTimeSlotOccupied(day, time)) {
      setDropTarget({ day, time });
    }
  };

  // Function to handle drop
  const handleDrop = (e: React.DragEvent, day: Date, time: string) => {
    e.preventDefault();
    if (!draggedTask || isTimeSlotOccupied(day, time)) return;

    const [hours, minutes] = time.split(':').map(Number);
    const newStartTime = new Date(day);
    newStartTime.setHours(hours);
    newStartTime.setMinutes(minutes);

    onUpdateTask({
      ...draggedTask,
      startTime: newStartTime
    });

    setDraggedTask(null);
    setDropTarget(null);
  };

  // Function to handle drag leave
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDropTarget(null);
  };

  // Add hover handlers
  const handleTaskHover = (taskId: string) => {
    if (hoveredTask) {
      clearTimeout(hoveredTask.timeout);
    }
    const timeout = setTimeout(() => {
      setHoveredTask({ taskId, timeout });
    }, 1000); // 1 second delay
  };

  const handleTaskLeave = () => {
    if (hoveredTask) {
      clearTimeout(hoveredTask.timeout);
      setHoveredTask(null);
    }
  };

  // Add cleanup effect
  useEffect(() => {
    return () => {
      if (hoveredTask) {
        clearTimeout(hoveredTask.timeout);
      }
    };
  }, [hoveredTask]);

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
                {/* Current Time Indicator - only show for today */}
                {day.date.toDateString() === new Date().toDateString() && (
                  <div 
                    className="absolute left-0 right-0 h-0.5 bg-blue-500 dark:bg-blue-400 z-10"
                    style={{ top: getCurrentTimePosition() }}
                  >
                    <div className="absolute -left-2 w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400 -translate-y-1/2" />
                  </div>
                )}

                {/* Time Grid Lines */}
                {timeSlots.map((time, index) => {
                  const hour = Math.floor(index / 2);
                  const isHalfHour = index % 2 === 1;
                  const isOccupied = isTimeSlotOccupied(day.date, time);
                  const isDropTarget = dropTarget?.day.toDateString() === day.date.toDateString() && 
                                    dropTarget?.time === time;

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
                      } ${
                        isDropTarget && !isOccupied
                          ? 'bg-primary-100 dark:bg-primary-800/30'
                          : ''
                      }`}
                      onDoubleClick={(e) => handleDoubleClick(day.date, time)}
                      onDragOver={(e) => handleDragOver(e, day.date, time)}
                      onDrop={(e) => handleDrop(e, day.date, time)}
                      onDragLeave={handleDragLeave}
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
                      draggable={editingTask?.id !== task.id}
                      onDragStart={(e) => handleDragStart(e, task)}
                      onDragEnd={handleDragEnd}
                      onMouseEnter={() => handleTaskHover(task.id)}
                      onMouseLeave={handleTaskLeave}
                      className={`absolute left-2 right-2 rounded-lg p-2 ${
                        editingTask?.id !== task.id ? 'cursor-move' : 'cursor-default'
                      } transition-all duration-200 ${
                        task.completed 
                          ? 'bg-accent-100 dark:bg-accent-900/50 border border-accent-200 dark:border-accent-800' 
                          : 'bg-secondary-100 dark:bg-secondary-900/50 border border-secondary-200 dark:border-secondary-800 hover:bg-secondary-200 dark:hover:bg-secondary-800/70'
                      }`}
                      style={getTaskPosition(task)}
                      onDoubleClick={(e) => handleTaskDoubleClick(task, e)}
                    >
                      {editingTask?.id === task.id && clickPosition ? (
                        <TaskEditForm
                          task={task}
                          clickPosition={clickPosition}
                          onDeleteTask={onDeleteTask}
                          onEditSubmit={handleEditSubmit}
                          onCancel={() => {
                            setEditingTask(null);
                            setClickPosition(null);
                          }}
                        />
                      ) : (
                        <div className="flex items-center justify-between gap-2">
                          <div className="font-medium text-sm truncate text-neutral-900 dark:text-neutral-50">{task.title}</div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onUpdateTask({ ...task, completed: !task.completed });
                            }}
                            className={`flex-shrink-0 w-5 h-5 rounded-full transition-all duration-300 transform hover:scale-110 ${
                              task.completed
                                ? 'bg-accent-500 dark:bg-accent-400 shadow-lg shadow-accent-500/30'
                                : 'bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600'
                            }`}
                            title={task.completed ? "Task completed! 🎉" : "Complete task"}
                          >
                            {task.completed && (
                              <span className="flex items-center justify-center w-full h-full text-xs text-white animate-[bounce_0.8s_ease-in-out_1]">✓</span>
                            )}
                          </button>
                        </div>
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
                    <textarea
                      name="title"
                      placeholder="Task title"
                      className="w-full px-2 py-1 text-sm bg-transparent border border-neutral-200 dark:border-neutral-700 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-neutral-50 resize-none"
                      autoFocus
                      rows={2}
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