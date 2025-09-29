// Dependencies utility functions for project management

/**
 * Parses predecessor string and returns array of dependencies
 * Supports formats: "1", "1,2", "1FS", "1SS", "2FF+2", "3SF-1"
 */
export const parsePredecessors = (predecessorString) => {
  if (!predecessorString || predecessorString.trim() === '' || predecessorString.toLowerCase() === 'none') {
    return [];
  }

  const dependencies = [];
  const parts = predecessorString.split(',').map(part => part.trim());

  for (const part of parts) {
    if (!part) continue;

    // Match pattern: taskId + optional dependency type + optional lag
    const match = part.match(/^(\d+)([FSFS]{2})?([+-]\d+)?$/);
    
    if (match) {
      const [, taskId, depType = 'FS', lag = '0'] = match;
      dependencies.push({
        taskId: parseInt(taskId),
        type: depType,
        lag: parseInt(lag.replace(/[+-]/, lag.startsWith('+') ? '' : '-'))
      });
    } else {
      // Try to parse just the task ID for backwards compatibility
      const taskIdMatch = part.match(/^\d+$/);
      if (taskIdMatch) {
        dependencies.push({
          taskId: parseInt(taskIdMatch[0]),
          type: 'FS',
          lag: 0
        });
      }
    }
  }

  return dependencies;
};

/**
 * Formats dependencies array back to string
 */
export const formatPredecessors = (dependencies) => {
  if (!dependencies || dependencies.length === 0) {
    return '';
  }

  return dependencies.map(dep => {
    let result = dep.taskId.toString();
    if (dep.type && dep.type !== 'FS') {
      result += dep.type;
    }
    if (dep.lag && dep.lag !== 0) {
      result += dep.lag > 0 ? `+${dep.lag}` : dep.lag.toString();
    }
    return result;
  }).join(',');
};

/**
 * Calculates working days between two dates
 */
export const calculateWorkingDays = (startDate, endDate, workingDays = ['M', 'T', 'W', 'R', 'F']) => {
  if (!startDate || !endDate) return 0;

  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (start > end) return 0;

  const dayMap = {
    'Su': 0, // Sunday
    'M': 1, // Monday
    'T': 2, // Tuesday
    'W': 3, // Wednesday
    'R': 4, // Thursday
    'F': 5, // Friday
    'Sa': 6  // Saturday
  };

  // Convert working days to numbers
  const workingDayNumbers = workingDays.map(day => dayMap[day]).filter(num => num !== undefined);

  let count = 0;
  const current = new Date(start);

  while (current <= end) {
    if (workingDayNumbers.includes(current.getDay())) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }

  return count - 1; // Exclude the end date
};

/**
 * Adds working days to a date
 */
export const addWorkingDays = (startDate, days, workingDays = ['M', 'T', 'W', 'R', 'F']) => {
  if (!startDate || days <= 0) return startDate;

  const dayMap = {
    'Su': 0, // Sunday
    'M': 1, // Monday
    'T': 2, // Tuesday
    'W': 3, // Wednesday
    'R': 4, // Thursday
    'F': 5, // Friday
    'Sa': 6  // Saturday
  };

  const workingDayNumbers = workingDays.map(day => dayMap[day]).filter(num => num !== undefined);

  const result = new Date(startDate);
  let addedDays = 0;

  while (addedDays < days) {
    result.setDate(result.getDate() + 1);
    if (workingDayNumbers.includes(result.getDay())) {
      addedDays++;
    }
  }

  return result;
};

/**
 * Subtracts working days from a date
 */
export const subtractWorkingDays = (startDate, days, workingDays = ['M', 'T', 'W', 'R', 'F']) => {
  if (!startDate || days <= 0) return startDate;

  const dayMap = {
    'Su': 0, // Sunday
    'M': 1, // Monday
    'T': 2, // Tuesday
    'W': 3, // Wednesday
    'R': 4, // Thursday
    'F': 5, // Friday
    'Sa': 6  // Saturday
  };

  const workingDayNumbers = workingDays.map(day => dayMap[day]).filter(num => num !== undefined);

  const result = new Date(startDate);
  let daysSubtracted = 0;

  while (daysSubtracted < days) {
    result.setDate(result.getDate() - 1);
    if (workingDayNumbers.includes(result.getDay())) {
      daysSubtracted++;
    }
  }

  return result;
};

/**
 * Detects circular dependencies in the task graph
 */
export const detectCircularDependencies = (tasks, columnConfig) => {
  const { predecessorsColumn } = columnConfig;
  const visited = new Set();
  const recursionStack = new Set();
  const cycles = [];

  const dfs = (taskId, path = []) => {
    if (recursionStack.has(taskId)) {
      // Found a cycle
      const cycleStart = path.indexOf(taskId);
      if (cycleStart !== -1) {
        cycles.push(path.slice(cycleStart).concat(taskId));
      }
      return true;
    }

    if (visited.has(taskId)) {
      return false;
    }

    visited.add(taskId);
    recursionStack.add(taskId);
    path.push(taskId);

    const task = tasks[taskId];
    if (task && task[predecessorsColumn]) {
      const dependencies = parsePredecessors(task[predecessorsColumn]);
      for (const dep of dependencies) {
        if (tasks[dep.taskId] && dfs(dep.taskId, [...path])) {
          return true;
        }
      }
    }

    recursionStack.delete(taskId);
    return false;
  };

  // Check all tasks for cycles
  for (const taskId of Object.keys(tasks)) {
    if (!visited.has(parseInt(taskId))) {
      dfs(parseInt(taskId));
    }
  }

  return cycles;
};

/**
 * Helper function to check if a date is a working day
 */
const isWorkingDay = (date, workingDays) => {
  const dayMap = { 0: 'S', 1: 'M', 2: 'T', 3: 'W', 4: 'R', 5: 'F', 6: 'S' };
  const dayOfWeek = dayMap[date.getDay()];
  
  // Handle the case where Sunday and Saturday are both 'S'
  if (dayOfWeek === 'S') {
    if (date.getDay() === 0) { // Sunday
      return workingDays.includes('S') && workingDays.indexOf('S') === 0;
    } else { // Saturday
      return workingDays.includes('S') && workingDays.lastIndexOf('S') !== 0;
    }
  }
  
  return workingDays.includes(dayOfWeek);
};

/**
 * Adds working days to a date
 */
export const addWorkingDays2 = (startDate, days, workingDays) => {
  if (!startDate || days <= 0) return startDate;

  const result = new Date(startDate);
  let addedDays = 0;

  while (addedDays < days) {
    result.setDate(result.getDate() + 1);
    if (isWorkingDay(result, workingDays)) {
      addedDays++;
    }
  }

  return result;
};

/**
 * Simple task dependency calculation following exact Smartsheet rules
 * Rules:
 * 1. FS (Finish-to-Start): Start_B = End_A + Lag + 1 day
 * 2. SS (Start-to-Start): Start_B = Start_A + Lag (exact same start date if lag=0)
 * 3. FF (Finish-to-Finish): End_B = End_A + Lag, then Start_B = End_B - Duration + 1
 * 4. SF (Start-to-Finish): End_B = Start_A + Lag, then Start_B = End_B - Duration + 1
 */
export const calculateTaskDates = (task, allTasks, workingDays, columnConfig) => {
  const { 
    predecessorsColumn, 
    startDateColumn, 
    endDateColumn, 
    durationColumn 
  } = columnConfig;

  const dependencies = parsePredecessors(task[predecessorsColumn] || '');
  
  // No dependencies = no changes
  if (dependencies.length === 0) {
    return task;
  }

  console.log('🔧 calculateTaskDates for task:', task, 'dependencies:', dependencies);

  const duration = parseInt(task[durationColumn]) || 1;
  let calculatedStartDate = null;
  let calculatedEndDate = null;

  // Collect all constraints from dependencies
  const startConstraints = [];
  const endConstraints = [];

  // Process each dependency to collect constraints
  for (const dep of dependencies) {
    const taskA = allTasks[dep.taskId]; // Predecessor task
    if (!taskA) continue;

    const startA = new Date(taskA[startDateColumn]);
    const endA = new Date(taskA[endDateColumn]);
    const lag = dep.lag || 0;

    console.log('🔧 Processing dependency:', {
      type: dep.type,
      taskA: dep.taskId,
      startA: startA.toISOString().split('T')[0],
      endA: endA.toISOString().split('T')[0],
      lag
    });

    let constraintDate = null;

    switch (dep.type) {
      case 'FS': // Finish-to-Start: Start_B = End_A + Lag + 1 day
        constraintDate = new Date(endA);
        constraintDate.setDate(constraintDate.getDate() + 1 + lag);
        startConstraints.push({
          date: constraintDate,
          type: 'FS',
          from: dep.taskId
        });
        console.log('🔧 FS constraint - start must be >=', constraintDate.toISOString().split('T')[0]);
        break;

      case 'SS': // Start-to-Start: Start_B = Start_A + Lag
        constraintDate = new Date(startA);
        if (lag !== 0) {
          constraintDate.setDate(constraintDate.getDate() + lag);
        }
        startConstraints.push({
          date: constraintDate,
          type: 'SS',
          from: dep.taskId
        });
        console.log('🔧 SS constraint - start must be >=', constraintDate.toISOString().split('T')[0]);
        break;

      case 'FF': // Finish-to-Finish: End_B = End_A + Lag
        constraintDate = new Date(endA);
        if (lag !== 0) {
          constraintDate.setDate(constraintDate.getDate() + lag);
        }
        endConstraints.push({
          date: constraintDate,
          type: 'FF',
          from: dep.taskId
        });
        console.log('🔧 FF constraint - end must be >=', constraintDate.toISOString().split('T')[0]);
        break;

      case 'SF': // Start-to-Finish: End_B = Start_A + Lag
        constraintDate = new Date(startA);
        if (lag !== 0) {
          constraintDate.setDate(constraintDate.getDate() + lag);
        }
        endConstraints.push({
          date: constraintDate,
          type: 'SF',
          from: dep.taskId
        });
        console.log('🔧 SF constraint - end must be >=', constraintDate.toISOString().split('T')[0]);
        break;

      default: // Default to FS
        constraintDate = new Date(endA);
        constraintDate.setDate(constraintDate.getDate() + 1);
        startConstraints.push({
          date: constraintDate,
          type: 'FS',
          from: dep.taskId
        });
        break;
    }
  }

  // Find the most restrictive start constraint (latest date)
  if (startConstraints.length > 0) {
    calculatedStartDate = startConstraints.reduce((latest, constraint) => {
      return constraint.date > latest ? constraint.date : latest;
    }, startConstraints[0].date);
    console.log('🔧 Most restrictive start constraint:', calculatedStartDate.toISOString().split('T')[0]);
  }

  // Find the most restrictive end constraint (latest date)
  if (endConstraints.length > 0) {
    calculatedEndDate = endConstraints.reduce((latest, constraint) => {
      return constraint.date > latest ? constraint.date : latest;
    }, endConstraints[0].date);
    console.log('🔧 Most restrictive end constraint:', calculatedEndDate.toISOString().split('T')[0]);
  }

  // Apply calculated dates with proper logic
  if (calculatedStartDate) {
    task[startDateColumn] = calculatedStartDate.toISOString().split('T')[0];
    // Calculate end date: End_B = Start_B + Duration - 1
    const endDate = new Date(calculatedStartDate);
    endDate.setDate(endDate.getDate() + duration - 1);
    task[endDateColumn] = endDate.toISOString().split('T')[0];
    console.log('🔧 Applied start-based dates:', {
      start: task[startDateColumn],
      end: task[endDateColumn]
    });
  }

  if (calculatedEndDate) {
    task[endDateColumn] = calculatedEndDate.toISOString().split('T')[0];
    // Calculate start date: Start_B = End_B - Duration + 1
    const startDate = new Date(calculatedEndDate);
    startDate.setDate(startDate.getDate() - duration + 1);
    
    // If we have both start and end constraints, resolve conflict
    if (calculatedStartDate && startDate < calculatedStartDate) {
      // Keep calculated start date, recalculate end date
      const newEndDate = new Date(calculatedStartDate);
      newEndDate.setDate(newEndDate.getDate() + duration - 1);
      task[endDateColumn] = newEndDate.toISOString().split('T')[0];
      console.log('🔧 Resolved conflict - kept start date, recalc end:', task[endDateColumn]);
    } else if (!calculatedStartDate) {
      // Only end date constraint, calculate start
      task[startDateColumn] = startDate.toISOString().split('T')[0];
      console.log('🔧 Applied end-based dates:', {
        start: task[startDateColumn],
        end: task[endDateColumn]
      });
    }
  }

  console.log('🔧 Final calculated task dates:', {
    taskId: task.taskId || 'unknown',
    start: task[startDateColumn],
    end: task[endDateColumn],
    duration
  });

  return task;
};

/**
 * Recalculates end date based on start date and duration
 */
export const calculateEndDateFromDuration = (task, columnConfig) => {
  const { startDateColumn, endDateColumn, durationColumn } = columnConfig;
  
  const startDate = task[startDateColumn];
  const duration = parseInt(task[durationColumn]) || 1;
  
  if (!startDate) return task;
  
  const start = new Date(startDate);
  const end = new Date(start);
  end.setDate(end.getDate() + duration - 1);
  
  return {
    ...task,
    [endDateColumn]: end.toISOString().split('T')[0]
  };
};

/**
 * Recalculates start date based on end date and duration
 */
export const calculateStartDateFromDuration = (task, columnConfig) => {
  const { startDateColumn, endDateColumn, durationColumn } = columnConfig;
  
  const endDate = task[endDateColumn];
  const duration = parseInt(task[durationColumn]) || 1;
  
  if (!endDate) return task;
  
  const end = new Date(endDate);
  const start = new Date(end);
  start.setDate(start.getDate() - duration + 1);
  
  return {
    ...task,
    [startDateColumn]: start.toISOString().split('T')[0]
  };
};

/**
 * Recalculates all project dates based on dependencies
 */
export const recalculateProjectDates = (tasks, workingDays, columnConfig) => {
  // First, detect circular dependencies
  const cycles = detectCircularDependencies(tasks, columnConfig);
  if (cycles.length > 0) {
    return { tasks, cycles };
  }

  // Create a copy of tasks to modify
  const updatedTasks = { ...tasks };
  
  // Build dependency graph
  const dependencyGraph = {};
  const inDegree = {};
  
  // Initialize
  for (const taskId of Object.keys(updatedTasks)) {
    dependencyGraph[taskId] = [];
    inDegree[taskId] = 0;
  }

  // Build the graph
  for (const [taskId, task] of Object.entries(updatedTasks)) {
    const dependencies = parsePredecessors(task[columnConfig.predecessorsColumn]);
    for (const dep of dependencies) {
      if (updatedTasks[dep.taskId]) {
        dependencyGraph[dep.taskId].push(taskId);
        inDegree[taskId]++;
      }
    }
  }

  // Topological sort to process tasks in dependency order
  const queue = [];
  for (const [taskId, degree] of Object.entries(inDegree)) {
    if (degree === 0) {
      queue.push(taskId);
    }
  }

  const processedOrder = [];
  while (queue.length > 0) {
    const currentTaskId = queue.shift();
    processedOrder.push(currentTaskId);

    for (const dependentTaskId of dependencyGraph[currentTaskId]) {
      inDegree[dependentTaskId]--;
      if (inDegree[dependentTaskId] === 0) {
        queue.push(dependentTaskId);
      }
    }
  }

  // Process tasks in dependency order
  for (const taskId of processedOrder) {
    updatedTasks[taskId] = calculateTaskDates(
      updatedTasks[taskId], 
      updatedTasks, 
      workingDays, 
      columnConfig
    );
  }

  return { tasks: updatedTasks, cycles: [] };
};

/**
 * Validates a predecessor string
 */
export const validatePredecessors = (predecessorString, allTasks, currentTaskId) => {
  const errors = [];
  
  if (!predecessorString || predecessorString.trim() === '' || predecessorString.toLowerCase() === 'none') {
    return { isValid: true, errors: [] };
  }

  const dependencies = parsePredecessors(predecessorString);
  
  for (const dep of dependencies) {
    // Check if task exists
    if (!allTasks[dep.taskId]) {
      errors.push(`Task ${dep.taskId} does not exist`);
      continue;
    }

    // Check for self-reference
    if (dep.taskId === currentTaskId) {
      errors.push(`Task cannot depend on itself`);
      continue;
    }

    // Validate dependency type
    if (!['FS', 'SS', 'FF', 'SF'].includes(dep.type)) {
      errors.push(`Invalid dependency type: ${dep.type}`);
    }

    // Validate lag (should be reasonable)
    if (Math.abs(dep.lag) > 365) {
      errors.push(`Lag value too large: ${dep.lag} days`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Gets suggested predecessors based on task sequence
 */
export const getSuggestedPredecessors = (currentTaskId, allTasks) => {
  const suggestions = [];
  const currentTaskNum = parseInt(currentTaskId);
  
  // Suggest previous task as FS dependency
  if (currentTaskNum > 1 && allTasks[currentTaskNum - 1]) {
    suggestions.push({
      taskId: currentTaskNum - 1,
      type: 'FS',
      lag: 0,
      description: `${currentTaskNum - 1}FS - Finish to Start`
    });
  }

  // Suggest other recent tasks
  for (let i = Math.max(1, currentTaskNum - 3); i < currentTaskNum; i++) {
    if (allTasks[i] && i !== currentTaskNum - 1) {
      suggestions.push({
        taskId: i,
        type: 'FS',
        lag: 0,
        description: `${i}FS - Finish to Start`
      });
    }
  }

  return suggestions;
};


