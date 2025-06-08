import React from 'react';
import { Task } from '../types';

interface CalendarProps {
  tasks: Task[];
  onUpdateTask: (task: Task) => void;
}

const Calendar: React.FC<CalendarProps> = ({ tasks, onUpdateTask }) => {
  const timeSlots = Array.from({ length: 24 * 6 }, (_, i) => {
    const hour = Math.floor(i / 6);
    const minute = (i % 6) * 10;
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  });

  const getDays = () => {
    const today = new Date();
    return [
      { date: today, label: 'Today' },
      { date: new Date(today.setDate(today.getDate() + 1)), label: 'Tomorrow' },
      { date: new Date(today.setDate(today.getDate() + 1)), label: new Date(today).toLocaleDateString('en-US', { weekday: 'long' }) }
    ];
  };

  const getTaskPosition = (task: Task) => {
    const startHour = task.startTime.getHours();
    const startMinute = task.startTime.getMinutes();
    const startIndex = startHour * 6 + Math.floor(startMinute / 10);
    const height = (task.duration / 10) * 40; // 40px per 10 minutes
    return {
      top: `${startIndex * 40}px`,
      height: `${height}px`,
    };
  };

  const days = getDays();

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Calendar Header */}
      <div className="grid grid-cols-3 border-b border-gray-200">
        {days.map((day, index) => (
          <div key={index} className="p-4 text-center">
            <div className="text-sm text-gray-500">{day.label}</div>
            <div className="text-lg font-semibold">
              {day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="relative">
        {/* Time Slots */}
        <div className="absolute left-0 w-16 border-r border-gray-200">
          {timeSlots.map((time, index) => (
            <div
              key={time}
              className="h-10 border-b border-gray-100 flex items-center justify-end pr-2"
            >
              <span className="text-xs text-gray-400">{time}</span>
            </div>
          ))}
        </div>

        {/* Calendar Columns */}
        <div className="grid grid-cols-3 ml-16">
          {days.map((day, dayIndex) => (
            <div key={dayIndex} className="relative border-r border-gray-200 last:border-r-0">
              {/* Time Grid Lines */}
              {timeSlots.map((_, index) => (
                <div
                  key={index}
                  className="h-10 border-b border-gray-100"
                />
              ))}

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
                        ? 'bg-green-100 border border-green-200' 
                        : 'bg-blue-100 border border-blue-200 hover:bg-blue-200'
                    }`}
                    style={getTaskPosition(task)}
                    onClick={() => onUpdateTask({ ...task, completed: !task.completed })}
                  >
                    <div className="font-medium text-sm truncate">{task.title}</div>
                    {task.description && (
                      <div className="text-xs text-gray-600 truncate">{task.description}</div>
                    )}
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(task.startTime).toLocaleTimeString('en-US', { 
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