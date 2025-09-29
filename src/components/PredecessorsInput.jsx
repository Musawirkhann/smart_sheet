import { useState, useRef, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, AlertCircle, Clock, ArrowRight, Plus, X } from 'lucide-react';
import * as deps from '../utils/dependencies';

const { 
  parsePredecessors, 
  formatPredecessors, 
  validatePredecessors, 
  getSuggestedPredecessors 
} = deps;

const PredecessorsInput = ({ 
  value, 
  onChange, 
  onBlur, 
  allTasks, 
  currentTaskId, 
  className = '' 
}) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [showDropdown, setShowDropdown] = useState(false);
  const [validation, setValidation] = useState({ isValid: true, errors: [] });
  const [selectedDependencies, setSelectedDependencies] = useState([]);
  const [activeConstraintType, setActiveConstraintType] = useState('FS');
  const [lagTime, setLagTime] = useState(0);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Dependency constraint types with descriptions
  const constraintTypes = [
    { 
      value: 'FS', 
      label: 'Finish → Start', 
      shortLabel: 'F→S',
      description: 'Task starts when predecessor finishes',
      formula: 'Start_B = End_A + Lag'
    },
    { 
      value: 'SS', 
      label: 'Start → Start', 
      shortLabel: 'S→S',
      description: 'Task starts when predecessor starts',
      formula: 'Start_B = Start_A + Lag'
    },
    { 
      value: 'FF', 
      label: 'Finish → Finish', 
      shortLabel: 'F→F',
      description: 'Task finishes when predecessor finishes',
      formula: 'End_B = End_A + Lag'
    },
    { 
      value: 'SF', 
      label: 'Start → Finish', 
      shortLabel: 'S→F',
      description: 'Task finishes when predecessor starts',
      formula: 'End_B = Start_A + Lag'
    }
  ];

  useEffect(() => {
    setInputValue(value || '');
    // Parse existing dependencies when value changes
    const existingDeps = parsePredecessors(value || '');
    setSelectedDependencies(existingDeps);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if the click is truly outside the dropdown
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        console.log('🔧 Clicking outside dropdown, closing it');
        setShowDropdown(false);
      } else {
        console.log('🔧 Click inside dropdown, keeping open');
      }
    };
    
    // Only add the listener when dropdown is open
    if (showDropdown) {
      // Use capture phase to ensure we get the event first
      document.addEventListener('mousedown', handleClickOutside, true);
      return () => document.removeEventListener('mousedown', handleClickOutside, true);
    }
  }, [showDropdown]);


  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Parse and update selected dependencies
    const deps = parsePredecessors(newValue);
    setSelectedDependencies(deps);
    
    // Validate input
    const validationResult = validatePredecessors(newValue, allTasks, currentTaskId);
    setValidation(validationResult);
  };

  const handleInputBlur = (e) => {
    // Don't trigger blur if we're clicking inside the dropdown
    const relatedTarget = e?.relatedTarget;
    if (relatedTarget && dropdownRef.current?.contains(relatedTarget)) {
      console.log('🔧 handleInputBlur: Focus moved to dropdown element, ignoring blur');
      return;
    }
    
    // Don't trigger blur if dropdown is open and we're interacting with it
    if (showDropdown) {
      console.log('🔧 handleInputBlur: Dropdown is open, delaying blur');
      // Delay the blur to allow dropdown interactions
      setTimeout(() => {
        if (!showDropdown) {
          const currentValue = e?.target?.value ?? inputValue;
          const validationResult = validatePredecessors(currentValue, allTasks, currentTaskId);
          
          console.log('🔧 handleInputBlur (delayed):', { currentValue, isValid: validationResult.isValid });
          
          onChange(currentValue);
          setValidation(validationResult);
          if (onBlur) onBlur();
        }
      }, 100);
      return;
    }
    
    const currentValue = e?.target?.value ?? inputValue;
    const validationResult = validatePredecessors(currentValue, allTasks, currentTaskId);
    
    console.log('🔧 handleInputBlur:', { currentValue, isValid: validationResult.isValid });
    
    // Always save the value, even if invalid
    onChange(currentValue);
    setValidation(validationResult);
    
    setShowDropdown(false);
    if (onBlur) onBlur();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleInputBlur(e);
    } else if (e.key === 'Escape') {
      setInputValue(value || '');
      setSelectedDependencies(parsePredecessors(value || ''));
      setShowDropdown(false);
      if (onBlur) onBlur();
    }
  };

  const toggleTaskDependency = (taskId, isSelected) => {
    console.log('🔧 toggleTaskDependency:', { taskId, isSelected, currentDeps: selectedDependencies });
    
    const taskIdNum = parseInt(taskId);
    let newDependencies = [...selectedDependencies];
    
    if (isSelected) {
      // Check if dependency already exists
      const existingIndex = newDependencies.findIndex(dep => dep.taskId === taskIdNum);
      if (existingIndex === -1) {
        // Add new dependency with current active constraint type and lag
        const newDep = {
          taskId: taskIdNum,
          type: activeConstraintType,
          lag: lagTime
        };
        newDependencies.push(newDep);
        console.log('🔧 Added dependency:', newDep);
      }
    } else {
      // Remove dependency
      newDependencies = newDependencies.filter(dep => dep.taskId !== taskIdNum);
      console.log('🔧 Removed dependency for task:', taskIdNum);
    }
    
    console.log('🔧 New dependencies after toggle:', newDependencies);
    
    // Update state immediately
    setSelectedDependencies(newDependencies);
    const newValue = formatPredecessors(newDependencies);
    console.log('🔧 Formatted value:', newValue);
    
    setInputValue(newValue);
    
    // Immediately call onChange to update parent component
    onChange(newValue);
    
    // Keep dropdown open for multiple selections
    // Don't call onBlur here as it closes the dropdown
  };

  const updateDependencyConstraint = (taskId, newType, newLag = 0) => {
    console.log('🔧 updateDependencyConstraint:', { taskId, newType, newLag });
    
    const newDependencies = selectedDependencies.map(dep => {
      if (dep.taskId === parseInt(taskId)) {
        return { ...dep, type: newType, lag: newLag };
      }
      return dep;
    });
    
    console.log('🔧 Updated dependencies:', newDependencies);
    
    setSelectedDependencies(newDependencies);
    const newValue = formatPredecessors(newDependencies);
    console.log('🔧 New formatted value:', newValue);
    
    setInputValue(newValue);
    onChange(newValue);
    
    // Don't close dropdown, keep it open for further edits
  };

  const removeDependency = (taskId) => {
    const newDependencies = selectedDependencies.filter(dep => dep.taskId !== parseInt(taskId));
    setSelectedDependencies(newDependencies);
    const newValue = formatPredecessors(newDependencies);
    setInputValue(newValue);
    onChange(newValue);
  };

  const getAvailableTasks = () => {
    return Object.entries(allTasks)
      .filter(([taskId]) => parseInt(taskId) !== currentTaskId)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .map(([taskId, task]) => {
        const taskIdNum = parseInt(taskId);
        const isSelected = selectedDependencies.some(dep => dep.taskId === taskIdNum);
        return {
          id: taskIdNum,
          name: task.taskName || `Task ${taskId}`,
          isSelected
        };
      });
  };

  const getSuggestedTasks = () => {
    const suggestions = getSuggestedPredecessors(currentTaskId, allTasks);
    return suggestions.slice(0, 3).map(suggestion => {
      const task = allTasks[suggestion.taskId];
      const isSelected = selectedDependencies.some(dep => dep.taskId === suggestion.taskId);
      return {
        id: suggestion.taskId,
        name: task?.taskName || `Task ${suggestion.taskId}`,
        type: suggestion.type,
        isSelected,
        isSuggested: true
      };
    });
  };

  const getSelectedDependency = (taskId) => {
    return selectedDependencies.find(dep => dep.taskId === parseInt(taskId));
  };

  const availableTasks = getAvailableTasks();
  const suggestedTasks = getSuggestedTasks();
  
  console.log('🔧 Render state:', {
    selectedDependencies,
    availableTasksCount: availableTasks.length,
    suggestedTasksCount: suggestedTasks.length,
    inputValue
  });

  return (
    <div 
      className={`relative ${className}`} 
      ref={dropdownRef}
      onClick={(e) => {
        console.log('🔧 Main container clicked');
        e.stopPropagation();
      }}
      onMouseDown={(e) => {
        console.log('🔧 Main container mousedown');
        e.stopPropagation();
      }}
    >
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onFocus={(e) => {
            e.stopPropagation();
            // Sync selected dependencies when opening dropdown
            const currentDeps = parsePredecessors(inputValue);
            setSelectedDependencies(currentDeps);
            setShowDropdown(true);
          }}
          onClick={(e) => {
            console.log('🔧 Input clicked');
            e.stopPropagation();
          }}
          onMouseDown={(e) => {
            console.log('🔧 Input mousedown');
            e.stopPropagation();
          }}
          onKeyDown={handleKeyDown}
          placeholder="1FS, 2SS+2, etc."
          className={`w-full px-3 py-1 text-sm border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            !validation.isValid ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          }`}
        />
        
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
          {!validation.isValid && (
            <AlertCircle className="w-4 h-4 text-red-500" title={validation.errors.join(', ')} />
          )}
          <button
            type="button"
            onClick={(e) => {
              console.log('🔧 Dropdown button clicked');
              e.stopPropagation();
              e.preventDefault();
              if (!showDropdown) {
                // Sync selected dependencies when opening dropdown
                const currentDeps = parsePredecessors(inputValue);
                setSelectedDependencies(currentDeps);
              }
              setShowDropdown(!showDropdown);
            }}
            onMouseDown={(e) => {
              console.log('🔧 Dropdown button mousedown');
              e.stopPropagation();
              e.preventDefault();
            }}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
          >
            <ChevronDown className={`w-3 h-3 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute z-[9999] w-96 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden"
            style={{ left: 0 }}
            onMouseDown={(e) => {
              console.log('🔧 Dropdown container mousedown - preventing close');
              e.stopPropagation();
            }}
          >
            {/* Header */}
            <div 
              className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800 border-b border-gray-100 dark:border-gray-700"
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Task Dependencies
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Row {currentTaskId} depends on...
              </p>
            </div>

            <div 
              className="max-h-80 overflow-y-auto"
              onMouseDown={(e) => {
                console.log('🔧 Scrollable area mousedown - preventing blur');
                e.preventDefault();
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              {/* Constraint Type Selector */}
              <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                    Constraint Type
                  </label>
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>Lag time</span>
                    <input
                      type="number"
                      value={lagTime}
                      onChange={(e) => {
                        e.stopPropagation();
                        setLagTime(parseInt(e.target.value) || 0);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      onFocus={(e) => e.stopPropagation()}
                      className="w-12 px-1 py-0.5 text-xs border border-gray-300 rounded text-center"
                      placeholder="0"
                    />
                    <span>days</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  {constraintTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveConstraintType(type.value);
                      }}
                      className={`p-3 text-left rounded-lg border transition-all ${
                        activeConstraintType === type.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-sm font-medium ${
                          activeConstraintType === type.value 
                            ? 'text-blue-700 dark:text-blue-300' 
                            : 'text-gray-900 dark:text-white'
                        }`}>
                          {type.label}
                        </span>
                        <span className={`px-2 py-0.5 text-xs font-mono rounded ${
                          activeConstraintType === type.value
                            ? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}>
                          {type.shortLabel}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {type.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Suggested Tasks */}
              {suggestedTasks.length > 0 && (
                <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                      Suggested based on row placement
                    </span>
                  </div>
                  <div className="space-y-2">
                    {suggestedTasks.map((task) => {
                      const dependency = getSelectedDependency(task.id);
                      return (
                        <div
                          key={task.id}
                          className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-800"
                        >
                          <div className="flex items-center space-x-3">
                            <label 
                              className="flex items-center space-x-2 cursor-pointer"
                              onMouseDown={(e) => {
                                console.log('🔧 Suggested task label mousedown');
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={task.isSelected}
                                onChange={(e) => {
                                  console.log('🔧 Checkbox change:', { taskId: task.id, checked: e.target.checked });
                                  e.stopPropagation();
                                  toggleTaskDependency(task.id, e.target.checked);
                                }}
                                onMouseDown={(e) => {
                                  console.log('🔧 Suggested checkbox mousedown');
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded flex items-center justify-center">
                                <span className="text-xs font-bold text-green-600 dark:text-green-400">
                                  {task.id}
                                </span>
                              </div>
                            </label>
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {task.name}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                Row {task.id} • Suggested based on row placement
                              </div>
                            </div>
                          </div>
                          
                          {task.isSelected && dependency && (
                            <div className="flex items-center space-x-2">
                              <select
                                value={dependency.type}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  updateDependencyConstraint(task.id, e.target.value, dependency.lag);
                                }}
                                onMouseDown={(e) => {
                                  console.log('🔧 Suggested select mousedown');
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                                className="text-xs border border-gray-300 rounded px-2 py-1"
                              >
                                {constraintTypes.map(type => (
                                  <option key={type.value} value={type.value}>
                                    {type.shortLabel}
                                  </option>
                                ))}
                              </select>
                              <input
                                type="number"
                                value={dependency.lag || 0}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  updateDependencyConstraint(task.id, dependency.type, parseInt(e.target.value) || 0);
                                }}
                                onMouseDown={(e) => {
                                  console.log('🔧 Suggested input mousedown');
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                                onFocus={(e) => e.stopPropagation()}
                                className="w-12 px-1 py-1 text-xs border border-gray-300 rounded text-center"
                                placeholder="0"
                              />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeDependency(task.id);
                                }}
                                className="p-1 text-red-500 hover:text-red-700"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* All Available Tasks */}
              <div className="p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                    Available Tasks
                  </span>
                </div>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {availableTasks.slice(0, 8).map((task) => {
                    const dependency = getSelectedDependency(task.id);
                    return (
                      <div
                        key={task.id}
                        className={`flex items-center justify-between p-2 rounded-lg transition-all ${
                          task.isSelected 
                            ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        <label 
                          className="flex items-center space-x-2 cursor-pointer flex-1"
                          onMouseDown={(e) => {
                            console.log('🔧 Available task label mousedown');
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={task.isSelected}
                            onChange={(e) => {
                              console.log('🔧 Available task checkbox:', { taskId: task.id, checked: e.target.checked });
                              e.stopPropagation();
                              toggleTaskDependency(task.id, e.target.checked);
                            }}
                            onMouseDown={(e) => {
                              console.log('🔧 Available checkbox mousedown');
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <div className="w-5 h-5 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                              {task.id}
                            </span>
                          </div>
                          <span className="text-sm text-gray-900 dark:text-white truncate">
                            {task.name}
                          </span>
                        </label>
                        
                        {task.isSelected && dependency && (
                          <div className="flex items-center space-x-1 ml-2">
                            <select
                              value={dependency.type}
                              onChange={(e) => {
                                e.stopPropagation();
                                updateDependencyConstraint(task.id, e.target.value, dependency.lag);
                              }}
                              onMouseDown={(e) => {
                                console.log('🔧 Available select mousedown');
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                              className="text-xs border border-gray-300 rounded px-1 py-0.5"
                            >
                              {constraintTypes.map(type => (
                                <option key={type.value} value={type.value}>
                                  {type.shortLabel}
                                </option>
                              ))}
                            </select>
                            <input
                              type="number"
                              value={dependency.lag || 0}
                              onChange={(e) => {
                                e.stopPropagation();
                                updateDependencyConstraint(task.id, dependency.type, parseInt(e.target.value) || 0);
                              }}
                              onMouseDown={(e) => {
                                console.log('🔧 Available input mousedown');
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                              onFocus={(e) => e.stopPropagation()}
                              className="w-10 px-1 py-0.5 text-xs border border-gray-300 rounded text-center"
                              placeholder="0"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer with explanation and Done button */}
            <div 
              className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700"
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              {activeConstraintType && (
                <div className="mb-3">
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {constraintTypes.find(t => t.value === activeConstraintType)?.label}:
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {constraintTypes.find(t => t.value === activeConstraintType)?.description}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 font-mono mt-1">
                    {constraintTypes.find(t => t.value === activeConstraintType)?.formula}
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Select tasks and constraint types • Use lag for delays (+) or overlaps (-)
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('🔧 Done button clicked, final value:', inputValue);
                    setShowDropdown(false);
                    // Trigger final save and date recalculation
                    if (onBlur) onBlur();
                  }}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-md transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Validation Errors */}
      <AnimatePresence>
        {!validation.isValid && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-1"
          >
            {validation.errors.map((error, index) => (
              <div key={index} className="text-xs text-red-600 dark:text-red-400">
                {error}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PredecessorsInput;