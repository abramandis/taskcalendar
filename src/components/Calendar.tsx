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

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="relative">
        {timeSlots.map((time, index) => (
          <div
            key={time}
            className="h-10 border-b border-gray-200 flex items-center"
          >
            <span className="text-sm text-gray-500 w-16">{time}</span>
          </div>
        ))}
        
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`absolute left-20 right-4 rounded p-2 cursor-move ${
              task.completed ? 'bg-green-100' : 'bg-blue-100'
            }`}
            style={getTaskPosition(task)}
            onClick={() => onUpdateTask({ ...task, completed: !task.completed })}
          >
            <div className="font-medium">{task.title}</div>
            {task.description && (
              <div className="text-sm text-gray-600">{task.description}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Calendar; 