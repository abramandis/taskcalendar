import React, { useState, useEffect, useRef } from 'react';

interface NoteEntry {
  id: string;
  date: string;
  content: string;
}

interface NotesProps {
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  currentTaskComponent?: React.ReactNode;
}

const Notes: React.FC<NotesProps> = ({ isExpanded = false, onToggleExpand, currentTaskComponent }) => {
  const [notes, setNotes] = useState<NoteEntry[]>(() => {
    const savedNotes = localStorage.getItem('notes');
    return savedNotes ? JSON.parse(savedNotes) : [];
  });

  // Function to resize textarea
  const resizeTextarea = (element: HTMLTextAreaElement | HTMLDivElement) => {
    element.style.height = 'auto';
    element.style.height = element.scrollHeight + 'px';
  };

  // Resize all contentEditable divs on mount and when notes change
  useEffect(() => {
    const contentEditableDivs = document.querySelectorAll('[contenteditable="true"]');
    contentEditableDivs.forEach(div => resizeTextarea(div as HTMLDivElement));
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
    <div className={`bg-white dark:bg-neutral-800 rounded-xl shadow-lg transition-colors duration-200 ${isExpanded ? 'h-[625px] flex flex-col' : 'flex flex-col'}`}>
      <div className="relative">
        <button
          onClick={onToggleExpand}
          className="absolute top-2 right-2 p-1 rounded-lg text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-50 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors z-20"
          title={isExpanded ? "Collapse notes" : "Expand notes"}
        >
          {isExpanded ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          )}
        </button>
      </div>
      
      {isExpanded && currentTaskComponent && (
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
          {currentTaskComponent}
        </div>
      )}
      
      <div className={`overflow-y-auto
        [&::-webkit-scrollbar]:w-2
        [&::-webkit-scrollbar-track]:bg-transparent
        [&::-webkit-scrollbar-thumb]:rounded-full
        [&::-webkit-scrollbar-thumb]:bg-neutral-300
        dark:[&::-webkit-scrollbar-thumb]:bg-neutral-600
        hover:[&::-webkit-scrollbar-thumb]:bg-neutral-400
        dark:hover:[&::-webkit-scrollbar-thumb]:bg-neutral-500
        ${isExpanded ? 'flex-1' : 'max-h-[310px] min-h-[310px]'}
      `}>
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
                <div
                  contentEditable
                  suppressContentEditableWarning
                  onInput={(e) => {
                    const content = e.currentTarget.innerHTML;
                    updateNote(note.id, content);
                    resizeTextarea(e.currentTarget);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Tab') {
                      e.preventDefault();
                      document.execCommand('insertText', false, '        ');
                    } else if (e.key === 'Backspace') {
                      // Let the backspace happen naturally, then clean up any unwanted formatting
                      setTimeout(() => {
                        const selection = window.getSelection();
                        if (selection && selection.rangeCount > 0) {
                          const range = selection.getRangeAt(0);
                          // Remove any empty formatting tags
                          const container = range.commonAncestorContainer;
                          if (container.nodeType === Node.TEXT_NODE && container.textContent === '') {
                            const parent = container.parentNode;
                            if (parent && parent.nodeType === Node.ELEMENT_NODE) {
                              const element = parent as HTMLElement;
                              if (['B', 'I', 'U', 'STRONG', 'EM'].includes(element.tagName)) {
                                element.remove();
                              }
                            }
                          }
                        }
                      }, 0);
                    }
                  }}
                  onPaste={(e) => {
                    e.preventDefault();
                    const text = e.clipboardData.getData('text/plain');
                    document.execCommand('insertText', false, text);
                  }}
                  className="w-full p-2 rounded-lg border-0 bg-transparent text-neutral-900 dark:text-neutral-50 focus:outline-none focus:ring-0 min-h-[1.5rem]"
                  style={{ whiteSpace: 'pre-wrap' }}
                  ref={(el) => {
                    if (el && el.innerHTML !== note.content) {
                      el.innerHTML = note.content;
                    }
                  }}
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