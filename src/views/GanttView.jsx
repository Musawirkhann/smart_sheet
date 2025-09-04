import { useState } from 'react';
import { motion } from 'framer-motion';
import { ZoomIn, ZoomOut, Calendar, Users, AlertTriangle, Settings, Filter, Download, Share2, Plus, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Dropdown from '../components/Dropdown';

const GanttView = () => {
  const [zoomLevel, setZoomLevel] = useState('week');
  const [viewDate, setViewDate] = useState(new Date('2024-02-01'));
  const [showCriticalPath, setShowCriticalPath] = useState(false);
  const [showDependencies, setShowDependencies] = useState(true);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [tasks, setTasks] = useState([
    { 
      id: 1, 
      name: 'Project Planning', 
      start: '2024-02-01', 
      end: '2024-02-07', 
      progress: 100, 
      color: 'bg-blue-500',
      assignee: 'John Doe',
      priority: 'High',
      dependencies: [],
      isCritical: true,
      parent: null,
      children: [2]
    },
    { 
      id: 2, 
      name: 'Design Review', 
      start: '2024-02-05', 
      end: '2024-02-12', 
      progress: 80, 
      color: 'bg-green-500',
      assignee: 'Jane Smith',
      priority: 'Medium',
      dependencies: [1],
      isCritical: true,
      parent: 1,
      children: [3]
    },
    { 
      id: 3, 
      name: 'Development', 
      start: '2024-02-10', 
      end: '2024-02-25', 
      progress: 45, 
      color: 'bg-purple-500',
      assignee: 'Mike Johnson',
      priority: 'High',
      dependencies: [2],
      isCritical: true,
      parent: 2,
      children: [4]
    },
    { 
      id: 4, 
      name: 'Testing', 
      start: '2024-02-20', 
      end: '2024-02-28', 
      progress: 0, 
      color: 'bg-orange-500',
      assignee: 'Sarah Wilson',
      priority: 'Medium',
      dependencies: [3],
      isCritical: false,
      parent: 3,
      children: []
    },
  ]);

  const generateTimelineHeaders = () => {
    const headers = [];
    const startDate = new Date(viewDate);
    const endDate = new Date(viewDate);
    
    if (zoomLevel === 'day') {
      endDate.setDate(startDate.getDate() + 30);
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        headers.push(new Date(d));
      }
    } else if (zoomLevel === 'week') {
      endDate.setDate(startDate.getDate() + 84); // 12 weeks
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 7)) {
        headers.push(new Date(d));
      }
    } else {
      endDate.setMonth(startDate.getMonth() + 12);
      for (let d = new Date(startDate); d <= endDate; d.setMonth(d.getMonth() + 1)) {
        headers.push(new Date(d));
      }
    }
    return headers;
  };

  const getTaskPosition = (task) => {
    const timelineStart = new Date(viewDate);
    const taskStart = new Date(task.start);
    const taskEnd = new Date(task.end);
    
    const totalDays = zoomLevel === 'day' ? 30 : zoomLevel === 'week' ? 84 : 365;
    const startOffset = Math.floor((taskStart - timelineStart) / (1000 * 60 * 60 * 24));
    const duration = Math.floor((taskEnd - taskStart) / (1000 * 60 * 60 * 24)) + 1;
    
    return {
      left: `${Math.max(0, (startOffset / totalDays) * 100)}%`,
      width: `${(duration / totalDays) * 100}%`,
    };
  };

  const navigateTimeline = (direction) => {
    const newDate = new Date(viewDate);
    if (zoomLevel === 'day') {
      newDate.setDate(viewDate.getDate() + (direction * 30));
    } else if (zoomLevel === 'week') {
      newDate.setDate(viewDate.getDate() + (direction * 84));
    } else {
      newDate.setMonth(viewDate.getMonth() + (direction * 12));
    }
    setViewDate(newDate);
  };

  const addNewTask = () => {
    const newTask = {
      id: Date.now(),
      name: 'New Task',
      start: new Date().toISOString().split('T')[0],
      end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      progress: 0,
      color: 'bg-gray-500',
      assignee: '',
      priority: 'Medium',
      dependencies: [],
      isCritical: false,
      parent: null,
      children: []
    };
    setTasks(prev => [...prev, newTask]);
    setShowAddTaskModal(false);
  };

  const updateTaskProgress = (taskId, progress) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, progress } : task
    ));
  };

  const formatTimelineHeader = (date) => {
    if (zoomLevel === 'day') {
      return date.getDate();
    } else if (zoomLevel === 'week') {
      return `W${Math.ceil(date.getDate() / 7)}`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short' });
    }
  };

  const getDependencyLines = () => {
    if (!showDependencies) return [];
    
    const lines = [];
    tasks.forEach(task => {
      task.dependencies.forEach(depId => {
        const depTask = tasks.find(t => t.id === depId);
        if (depTask) {
          lines.push({ from: depTask, to: task });
        }
      });
    });
    return lines;
  };

  const timelineHeaders = generateTimelineHeaders();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Gantt Chart</h2>
            <div className="flex items-center space-x-2">
              <Button variant="primary" size="sm" onClick={() => setShowAddTaskModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button variant="ghost" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="ghost" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Button variant="ghost" size="sm" onClick={() => navigateTimeline(-1)}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setViewDate(new Date())}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Today
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigateTimeline(1)}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  variant={zoomLevel === 'day' ? 'primary' : 'ghost'} 
                  size="sm" 
                  onClick={() => setZoomLevel('day')}
                >
                  Day
                </Button>
                <Button 
                  variant={zoomLevel === 'week' ? 'primary' : 'ghost'} 
                  size="sm" 
                  onClick={() => setZoomLevel('week')}
                >
                  Week
                </Button>
                <Button 
                  variant={zoomLevel === 'month' ? 'primary' : 'ghost'} 
                  size="sm" 
                  onClick={() => setZoomLevel('month')}
                >
                  Month
                </Button>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant={showCriticalPath ? 'primary' : 'ghost'} 
                size="sm" 
                onClick={() => setShowCriticalPath(!showCriticalPath)}
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Critical Path
              </Button>
              <Button 
                variant={showDependencies ? 'primary' : 'ghost'} 
                size="sm" 
                onClick={() => setShowDependencies(!showDependencies)}
              >
                Dependencies
              </Button>
              <Button variant="ghost" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </div>

        <div className="flex">
          {/* Task Names Column */}
          <div className="w-80 bg-gray-50 dark:bg-gray-700 border-r border-gray-200 dark:border-gray-600">
            <div className="h-12 bg-gray-100 dark:bg-gray-600 border-b border-gray-200 dark:border-gray-600 grid grid-cols-4 gap-2 px-4 items-center">
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300 col-span-2">Task Name</span>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Assignee</span>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Progress</span>
            </div>
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`h-12 border-b border-gray-200 dark:border-gray-600 grid grid-cols-4 gap-2 px-4 items-center hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer ${
                  showCriticalPath && task.isCritical ? 'bg-red-50 dark:bg-red-900/20' : ''
                } ${
                  selectedTask === task.id ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                }`}
                onClick={() => setSelectedTask(selectedTask === task.id ? null : task.id)}
              >
                <div className="col-span-2 flex items-center space-x-2">
                  {task.parent && <div className="w-4 h-px bg-gray-300 dark:bg-gray-600" />}
                  <span className={`text-sm ${
                    showCriticalPath && task.isCritical ? 'text-red-700 dark:text-red-300 font-medium' : 'text-gray-900 dark:text-white'
                  }`}>
                    {task.name}
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-xs text-gray-700 dark:text-gray-300">
                      {task.assignee ? task.assignee.charAt(0) : '?'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div 
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400 w-8">{task.progress}%</span>
                </div>
              </div>
            ))}
          </div>

          {/* Timeline */}
          <div className="flex-1 overflow-x-auto relative">
            {/* Timeline Header */}
            <div className="h-12 bg-gray-100 dark:bg-gray-600 border-b border-gray-200 dark:border-gray-600 flex">
              {timelineHeaders.map((date, index) => (
                <div
                  key={index}
                  className="flex-1 min-w-12 border-r border-gray-200 dark:border-gray-600 flex items-center justify-center"
                >
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {formatTimelineHeader(date)}
                  </span>
                </div>
              ))}
            </div>

            {/* Task Bars */}
            <div className="relative">
              {/* Dependency Lines */}
              {showDependencies && getDependencyLines().map((line, index) => {
                const fromPos = getTaskPosition(line.from);
                const toPos = getTaskPosition(line.to);
                const fromIndex = tasks.findIndex(t => t.id === line.from.id);
                const toIndex = tasks.findIndex(t => t.id === line.to.id);
                
                return (
                  <svg
                    key={index}
                    className="absolute inset-0 pointer-events-none"
                    style={{ zIndex: 1 }}
                  >
                    <line
                      x1={`calc(${fromPos.left} + ${fromPos.width})`}
                      y1={fromIndex * 48 + 24}
                      x2={toPos.left}
                      y2={toIndex * 48 + 24}
                      stroke="#6366f1"
                      strokeWidth="2"
                      markerEnd="url(#arrowhead)"
                    />
                    <defs>
                      <marker
                        id="arrowhead"
                        markerWidth="10"
                        markerHeight="7"
                        refX="9"
                        refY="3.5"
                        orient="auto"
                      >
                        <polygon points="0 0, 10 3.5, 0 7" fill="#6366f1" />
                      </marker>
                    </defs>
                  </svg>
                );
              })}
              
              {tasks.map((task, index) => (
                <div
                  key={task.id}
                  className="h-12 border-b border-gray-200 dark:border-gray-600 relative"
                >
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className={`absolute top-2 h-8 ${task.color} rounded-md shadow-sm cursor-pointer hover:shadow-md transition-all duration-200 ${
                      showCriticalPath && task.isCritical ? 'ring-2 ring-red-500' : ''
                    } ${
                      selectedTask === task.id ? 'ring-2 ring-primary-500' : ''
                    }`}
                    style={{ ...getTaskPosition(task), zIndex: 2 }}
                    onClick={() => setSelectedTask(selectedTask === task.id ? null : task.id)}
                  >
                    <div className="flex items-center justify-between h-full px-2">
                      <span className="text-xs text-white font-medium truncate">
                        {task.name}
                      </span>
                      <span className="text-xs text-white opacity-75">
                        {task.progress}%
                      </span>
                    </div>
                    <div
                      className="absolute top-0 left-0 h-full bg-white bg-opacity-30 rounded-md transition-all duration-300"
                      style={{ width: `${task.progress}%` }}
                    />
                    {/* Progress handle */}
                    <div
                      className="absolute top-0 right-0 w-2 h-full bg-white bg-opacity-50 rounded-r-md cursor-ew-resize hover:bg-opacity-75"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        // Handle progress drag
                      }}
                    />
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Task Details Panel */}
        {selectedTask && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
          >
            {(() => {
              const task = tasks.find(t => t.id === selectedTask);
              return task ? (
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Task Name</label>
                    <p className="text-sm text-gray-900 dark:text-white">{task.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Assignee</label>
                    <p className="text-sm text-gray-900 dark:text-white">{task.assignee || 'Unassigned'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Priority</label>
                    <p className="text-sm text-gray-900 dark:text-white">{task.priority}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={task.progress}
                        onChange={(e) => updateTaskProgress(task.id, parseInt(e.target.value))}
                        className="flex-1"
                      />
                      <span className="text-sm text-gray-900 dark:text-white w-12">{task.progress}%</span>
                    </div>
                  </div>
                </div>
              ) : null;
            })()}
          </motion.div>
        )}
      </div>

      <Modal isOpen={showAddTaskModal} onClose={() => setShowAddTaskModal(false)} title="Add New Task">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Task Name</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter task name"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assignee</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter assignee name"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="ghost" onClick={() => setShowAddTaskModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={addNewTask}>Add Task</Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

export default GanttView;