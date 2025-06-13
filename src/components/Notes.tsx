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
    <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6 transition-colors duration-200">
      <h2 className="text-xl font-semibold mb-4 text-neutral-900 dark:text-neutral-50">Notes</h2>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="w-full h-[200px] p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 resize-none"
        placeholder="Add your notes here..."
      />
    </div>
  );
};

export default Notes;