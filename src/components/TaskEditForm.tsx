import { createPortal } from 'react-dom';

interface TaskEditFormProps {
  task: Task;
  clickPosition: { x: number; y: number };
  onDeleteTask: (id: string) => void;
  onEditSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  onSave: (task: Task) => void;
}

export function TaskEditForm({ task, clickPosition, onDeleteTask, onEditSubmit, onCancel, onSave }: TaskEditFormProps) {
  return createPortal(
    <div className="fixed inset-0 z-[9999]">
      <form 
        onSubmit={onEditSubmit}
        className="fixed w-64 bg-white dark:bg-neutral-800 rounded-lg shadow-lg p-3 border border-neutral-200 dark:border-neutral-700"
        style={{
          top: clickPosition.y - 100, // Center vertically
          left: clickPosition.x - 128, // Center horizontally (half of width)
        }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDeleteTask(task.id);
          }}
          className="absolute -right-3 -top-3 w-5 h-5 rounded-full transition-all duration-300 transform hover:scale-110 bg-red-100/90 dark:bg-red-900/60 hover:bg-red-200 dark:hover:bg-red-800 text-red-500 dark:text-red-400 shadow-lg border border-red-200/90 dark:border-red-800/90"
          title="Delete task"
        >
          <span className="flex items-center justify-center w-full h-full text-xs">×</span>
        </button>
        
        <textarea
          name="title"
          defaultValue={task.title}
          className="w-full p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 focus:outline-none focus:ring-2 focus:ring-accent-500 dark:focus:ring-accent-400 resize-none min-h-[80px]"
          rows={3}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = target.scrollHeight + 'px';
          }}
          autoFocus
        />
        
        <div className="flex justify-end gap-2 mt-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-3 py-1 text-sm bg-accent-500 dark:bg-accent-400 text-white rounded-lg hover:bg-accent-600 dark:hover:bg-accent-500 transition-colors"
          >
            Save
          </button>
        </div>
      </form>
    </div>,
    document.body
  );
}