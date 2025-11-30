
import React, { useState } from 'react';
import { CheckCircle2, Circle, Plus, Trash2, FileText, ListTodo, X } from 'lucide-react';

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

const TaskManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'notes'>('tasks');
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', text: 'Create awesome VFX', completed: true },
    { id: '2', text: 'Explore the galaxy mode', completed: false }
  ]);
  const [newTask, setNewTask] = useState('');
  const [note, setNote] = useState('My creative ideas:\n- combine neon with fire\n- try the motion control feature');

  const addTask = () => {
    if (!newTask.trim()) return;
    setTasks(prev => [...prev, { id: Date.now().toString(), text: newTask, completed: false }]);
    setNewTask('');
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="flex flex-col h-full bg-black/20 text-white">
      
      {/* Tabs */}
      <div className="flex border-b border-white/10">
        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${
            activeTab === 'tasks' ? 'text-cyan-400 bg-white/5 border-b-2 border-cyan-400' : 'text-white/40 hover:text-white'
          }`}
        >
          <ListTodo size={14} /> Tasks
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${
            activeTab === 'notes' ? 'text-purple-400 bg-white/5 border-b-2 border-purple-400' : 'text-white/40 hover:text-white'
          }`}
        >
          <FileText size={14} /> Notes
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        
        {activeTab === 'tasks' ? (
          <div className="space-y-4">
            
            {/* Add Task Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTask()}
                placeholder="Add a new task..."
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500/50 transition-colors"
              />
              <button 
                onClick={addTask}
                disabled={!newTask.trim()}
                className="bg-cyan-500/80 hover:bg-cyan-400 text-white p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={18} />
              </button>
            </div>

            {/* Task List */}
            <div className="space-y-2">
              {tasks.length === 0 && (
                <div className="text-center text-white/20 text-xs py-4 italic">No tasks yet. Stay productive!</div>
              )}
              {tasks.map(task => (
                <div key={task.id} className="group flex items-center gap-3 bg-white/5 p-3 rounded-lg border border-white/5 hover:border-white/10 transition-all">
                  <button 
                    onClick={() => toggleTask(task.id)}
                    className={`transition-colors ${task.completed ? 'text-cyan-400' : 'text-white/20 hover:text-white/50'}`}
                  >
                    {task.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                  </button>
                  <span className={`flex-1 text-sm ${task.completed ? 'text-white/30 line-through' : 'text-gray-100'}`}>
                    {task.text}
                  </span>
                  <button 
                    onClick={() => deleteTask(task.id)}
                    className="text-white/10 group-hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Write your thoughts, ideas, or copy prompt results here..."
              className="flex-1 w-full bg-white/5 border border-white/10 rounded-lg p-4 text-sm leading-relaxed text-gray-200 focus:outline-none focus:border-purple-500/50 resize-none transition-colors"
            />
            <div className="text-[10px] text-white/30 text-right mt-2">
              Auto-saved locally
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default TaskManager;
