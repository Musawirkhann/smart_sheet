/**
 * Dependency Engine - Loosely Coupled Dependency Management
 * 
 * This module handles task dependencies without being tightly coupled to 
 * specific data structures or UI components.
 */

import { calculateEndDate, calculateStartDate, DateFormatter } from './taskCalculations.js';

/**
 * Dependency types and their calculation rules
 */
export const DependencyTypes = {
  FS: 'FS', // Finish-to-Start
  SS: 'SS', // Start-to-Start  
  FF: 'FF', // Finish-to-Finish
  SF: 'SF'  // Start-to-Finish
};

/**
 * Parse predecessor string into dependency objects
 * @param {string} predecessorString - e.g., "1FS,2SS+2,3FF-1"
 * @returns {Array} Array of dependency objects
 */
export const parseDependencies = (predecessorString) => {
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
 * Format dependencies array back to string
 * @param {Array} dependencies - Array of dependency objects
 * @returns {string} Formatted predecessor string
 */
export const formatDependencies = (dependencies) => {
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
 * Constraint calculator - pure functions for each dependency type
 */
export const ConstraintCalculator = {
  /**
   * Calculate constraint date for Finish-to-Start dependency
   * @param {Object} predecessorTask - Task that this depends on
   * @param {number} lag - Lag in days
   * @returns {Object} Constraint object
   */
  calculateFS: (predecessorTask, lag = 0) => {
    const endDate = DateFormatter.parse(predecessorTask.endDate);
    if (!endDate) return null;
    
    const constraintDate = new Date(endDate);
    constraintDate.setDate(constraintDate.getDate() + 1 + lag);
    
    return {
      type: 'start',
      date: constraintDate,
      rule: 'FS',
      description: `Must start after ${predecessorTask.id} finishes`
    };
  },

  /**
   * Calculate constraint date for Start-to-Start dependency
   * @param {Object} predecessorTask - Task that this depends on
   * @param {number} lag - Lag in days
   * @returns {Object} Constraint object
   */
  calculateSS: (predecessorTask, lag = 0) => {
    const startDate = DateFormatter.parse(predecessorTask.startDate);
    if (!startDate) return null;
    
    const constraintDate = new Date(startDate);
    if (lag !== 0) {
      constraintDate.setDate(constraintDate.getDate() + lag);
    }
    
    return {
      type: 'start',
      date: constraintDate,
      rule: 'SS',
      description: `Must start when ${predecessorTask.id} starts`
    };
  },

  /**
   * Calculate constraint date for Finish-to-Finish dependency
   * @param {Object} predecessorTask - Task that this depends on
   * @param {number} lag - Lag in days
   * @returns {Object} Constraint object
   */
  calculateFF: (predecessorTask, lag = 0) => {
    const endDate = DateFormatter.parse(predecessorTask.endDate);
    if (!endDate) return null;
    
    const constraintDate = new Date(endDate);
    if (lag !== 0) {
      constraintDate.setDate(constraintDate.getDate() + lag);
    }
    
    return {
      type: 'end',
      date: constraintDate,
      rule: 'FF',
      description: `Must finish when ${predecessorTask.id} finishes`
    };
  },

  /**
   * Calculate constraint date for Start-to-Finish dependency
   * @param {Object} predecessorTask - Task that this depends on
   * @param {number} lag - Lag in days
   * @returns {Object} Constraint object
   */
  calculateSF: (predecessorTask, lag = 0) => {
    const startDate = DateFormatter.parse(predecessorTask.startDate);
    if (!startDate) return null;
    
    const constraintDate = new Date(startDate);
    if (lag !== 0) {
      constraintDate.setDate(constraintDate.getDate() + lag);
    }
    
    return {
      type: 'end',
      date: constraintDate,
      rule: 'SF',
      description: `Must finish when ${predecessorTask.id} starts`
    };
  }
};

/**
 * Task dependency resolver - calculates dates based on dependencies
 */
export class TaskDependencyResolver {
  constructor(tasks = {}, options = {}) {
    this.tasks = tasks;
    this.options = {
      workingDays: ['M', 'T', 'W', 'R', 'F'],
      ...options
    };
  }

  /**
   * Calculate dates for a single task based on its dependencies
   * @param {Object} task - Task object with dependencies
   * @param {string} dependenciesString - Predecessor string
   * @returns {Object} Updated task with calculated dates
   */
  calculateTaskDates(task, dependenciesString) {
    const dependencies = parseDependencies(dependenciesString);
    
    if (dependencies.length === 0) {
      return task;
    }

    const constraints = this.collectConstraints(dependencies);
    const calculatedDates = this.resolveConstraints(constraints, task);
    
    return {
      ...task,
      ...calculatedDates
    };
  }

  /**
   * Collect all constraints from dependencies
   * @param {Array} dependencies - Array of dependency objects
   * @returns {Object} Constraints grouped by type
   */
  collectConstraints(dependencies) {
    const startConstraints = [];
    const endConstraints = [];

    for (const dep of dependencies) {
      const predecessorTask = this.tasks[dep.taskId];
      if (!predecessorTask) continue;

      let constraint = null;

      switch (dep.type) {
        case 'FS':
          constraint = ConstraintCalculator.calculateFS(predecessorTask, dep.lag);
          break;
        case 'SS':
          constraint = ConstraintCalculator.calculateSS(predecessorTask, dep.lag);
          break;
        case 'FF':
          constraint = ConstraintCalculator.calculateFF(predecessorTask, dep.lag);
          break;
        case 'SF':
          constraint = ConstraintCalculator.calculateSF(predecessorTask, dep.lag);
          break;
      }

      if (constraint) {
        if (constraint.type === 'start') {
          startConstraints.push(constraint);
        } else {
          endConstraints.push(constraint);
        }
      }
    }

    return { startConstraints, endConstraints };
  }

  /**
   * Resolve constraints to calculate final dates
   * @param {Object} constraints - Start and end constraints
   * @param {Object} task - Original task object
   * @returns {Object} Calculated dates
   */
  resolveConstraints(constraints, task) {
    const { startConstraints, endConstraints } = constraints;
    const duration = parseInt(task.duration) || 1;
    
    let calculatedStartDate = null;
    let calculatedEndDate = null;

    // Find most restrictive start constraint (latest date)
    if (startConstraints.length > 0) {
      calculatedStartDate = startConstraints.reduce((latest, constraint) => {
        return constraint.date > latest ? constraint.date : latest;
      }, startConstraints[0].date);
    }

    // Find most restrictive end constraint (latest date)
    if (endConstraints.length > 0) {
      calculatedEndDate = endConstraints.reduce((latest, constraint) => {
        return constraint.date > latest ? constraint.date : latest;
      }, endConstraints[0].date);
    }

    // Apply constraints and calculate missing dates
    const result = {};

    if (calculatedStartDate) {
      result.startDate = DateFormatter.toISO(calculatedStartDate);
      result.endDate = DateFormatter.toISO(calculateEndDate(calculatedStartDate, duration));
    }

    if (calculatedEndDate) {
      result.endDate = DateFormatter.toISO(calculatedEndDate);
      
      // If we also have start constraint, check for conflicts
      if (calculatedStartDate) {
        const endFromStart = calculateEndDate(calculatedStartDate, duration);
        if (endFromStart > calculatedEndDate) {
          // Start constraint takes precedence, recalculate end
          result.endDate = DateFormatter.toISO(endFromStart);
        }
      } else {
        // Calculate start from end
        result.startDate = DateFormatter.toISO(calculateStartDate(calculatedEndDate, duration));
      }
    }

    return result;
  }

  /**
   * Detect circular dependencies
   * @param {string} predecessorsString - Predecessor string to check
   * @param {string} taskId - Current task ID
   * @returns {Array} Array of circular dependency paths
   */
  detectCircularDependencies(predecessorsString, taskId) {
    const dependencies = parseDependencies(predecessorsString);
    const visited = new Set();
    const recursionStack = new Set();
    const cycles = [];

    const dfs = (currentTaskId, path = []) => {
      if (recursionStack.has(currentTaskId)) {
        const cycleStart = path.indexOf(currentTaskId);
        if (cycleStart !== -1) {
          cycles.push(path.slice(cycleStart).concat(currentTaskId));
        }
        return true;
      }

      if (visited.has(currentTaskId)) {
        return false;
      }

      visited.add(currentTaskId);
      recursionStack.add(currentTaskId);
      path.push(currentTaskId);

      const task = this.tasks[currentTaskId];
      if (task && task.predecessors) {
        const taskDeps = parseDependencies(task.predecessors);
        for (const dep of taskDeps) {
          if (this.tasks[dep.taskId] && dfs(dep.taskId.toString(), [...path])) {
            return true;
          }
        }
      }

      recursionStack.delete(currentTaskId);
      return false;
    };

    // Check if adding these dependencies would create a cycle
    for (const dep of dependencies) {
      if (this.tasks[dep.taskId]) {
        dfs(dep.taskId.toString(), [taskId.toString()]);
      }
    }

    return cycles;
  }
}
