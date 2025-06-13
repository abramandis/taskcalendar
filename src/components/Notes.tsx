import React, { useState, useEffect, useRef } from 'react';

interface NoteEntry {
  id: string;
  date: string;
  content: string;
}

const Notes: React.FC = () => {
  const [notes, setNotes] = useState<NoteEntry[]>(() => {
    const savedNotes = localStorage.getItem('notes');
    return savedNotes ? JSON.parse(savedNotes) : [];
  });

  // Function to resize textarea
  const resizeTextarea = (element: HTMLTextAreaElement) => {
    element.style.height = 'auto';
    element.style.height = element.scrollHeight + 'px';
  };

  // Resize all textareas on mount and when notes change
  useEffect(() => {
    const textareas = document.querySelectorAll('textarea');
    textareas.forEach(textarea => resizeTextarea(textarea));
  }, [notes]);

  const getOrCreateNoteForToday = () => {
    const today = new Date().toISOString().split('T')[0];
    const existingNote = notes.find(note => note.date === today);
    
    if (existingNote) {
      return existingNote;
    }

    const newNote: NoteEntry = {
      id: Date.now().toString(),
      date: today,
      content: ''
    };
    setNotes(prev => [newNote, ...prev]);
    return newNote;
  };

  const updateNote = (id: string, content: string) => {
    setNotes(prev => prev.map(note => 
      note.id === id ? { ...note, content } : note
    ));
  };

  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  // Group notes by date
  const notesByDate = notes.reduce((acc, note) => {
    if (!acc[note.date]) {
      acc[note.date] = [];
    }
    acc[note.date].push(note);
    return acc;
  }, {} as Record<string, NoteEntry[]>);

  // Sort dates in descending order (newest first)
  const sortedDates = Object.keys(notesByDate).sort((a, b) => b.localeCompare(a));

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg transition-colors duration-200 h-full">
      <div className="h-full overflow-y-auto
        [&::-webkit-scrollbar]:w-2
        [&::-webkit-scrollbar-track]:bg-transparent
        [&::-webkit-scrollbar-thumb]:rounded-full
        [&::-webkit-scrollbar-thumb]:bg-neutral-300
        dark:[&::-webkit-scrollbar-thumb]:bg-neutral-600
        hover:[&::-webkit-scrollbar-thumb]:bg-neutral-400
        dark:hover:[&::-webkit-scrollbar-thumb]:bg-neutral-500">
        {!notes.find(note => note.date === new Date().toISOString().split('T')[0]) && (
          <div className="p-4">
            <button
              onClick={() => getOrCreateNoteForToday()}
              className="w-full p-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-50 transition-colors"
            >
              + Add note for today
            </button>
          </div>
        )}
        {sortedDates.map(date => (
          <div key={date} className="relative">
            <div className="rounded-t-2xl sticky top-0 z-10 bg-white dark:bg-neutral-800 px-4 py-2 border-b border-neutral-200 dark:border-neutral-700">
              <h3 className={`text-sm font-medium ${
                date === new Date().toISOString().split('T')[0]
                  ? 'text-neutral-900 dark:text-neutral-50'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}>
                {(() => {
                  const [year, month, day] = date.split('-').map(Number);
                  return new Date(year, month - 1, day).toLocaleDateString('en-US', { 
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric'
                  });
                })()}
              </h3>
            </div>
            {notesByDate[date].map(note => (
              <div key={note.id} className="p-4">
                <textarea
                  value={note.content}
                  onChange={(e) => {
                    updateNote(note.id, e.target.value);
                    resizeTextarea(e.target);
                  }}
                  onInput={(e) => {
                    resizeTextarea(e.target as HTMLTextAreaElement);
                  }}
                  className="w-full p-2 rounded-lg border-0 bg-transparent text-neutral-900 dark:text-neutral-50 focus:outline-none focus:ring-0 resize-none overflow-hidden"
                  placeholder="Add your notes for the day..."
                  rows={1}
                />
              </div>
            ))}
          </div>
        ))}
        
      </div>
    </div>
  );
};

export default Notes;