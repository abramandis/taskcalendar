import React, { useState, useEffect } from 'react';

const Notes: React.FC = () => {
  const [notes, setNotes] = useState(() => {
    const savedNotes = localStorage.getItem('notes');
    return savedNotes || '';
  });

  useEffect(() => {
    localStorage.setItem('notes', notes);
  }, [notes]);

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg transition-colors duration-200">
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="w-full h-[300px] p-4 rounded-xl border-0 bg-transparent text-neutral-900 dark:text-neutral-50 focus:outline-none focus:ring-0 resize-none
          [&::-webkit-scrollbar]:w-2
          [&::-webkit-scrollbar-track]:bg-transparent
          [&::-webkit-scrollbar-thumb]:rounded-full
          [&::-webkit-scrollbar-thumb]:bg-neutral-300
          dark:[&::-webkit-scrollbar-thumb]:bg-neutral-600
          hover:[&::-webkit-scrollbar-thumb]:bg-neutral-400
          dark:hover:[&::-webkit-scrollbar-thumb]:bg-neutral-500"
        placeholder="Notes..."
      />
    </div>
  );
};

export default Notes;