/**
 * Project Calculator - High-level orchestrator for project calculations
 * 
 * This module coordinates between different calculation engines while maintaining
 * loose coupling through dependency injection and configuration.
 */

import { TaskDependencyResolver } from './dependencyEngine.js';
import { calculateEndDate, calculateStartDate, calculateDuration, DateFormatter } from './taskCalculations.js';

/**
 * Project Calculator - Main orchestrator class
 */
export class ProjectCalculator {
  constructor(config = {}) {
    this.config = {
      workingDays: ['M', 'T', 'W', 'R', 'F'],
      dateFormat: 'YYYY-MM-DD',
      ...config
    };
  }

  /**
   * Recalculate all project dates based on dependencies
   * @param {Object} tasks - Tasks object with task data
   * @param {Object} columnMapping - Column name mappings
   * @returns {Object} Updated tasks and any issues found
   */
  recalculateProject(tasks, columnMapping) {
    const {
      predecessorsColumn = 'predecessors',
      startDateColumn = 'startDate',
      endDateColumn = 'endDate',
      durationColumn = 'duration'
    } = columnMapping;

    // Create normalized task objects for the dependency resolver
    const normalizedTasks = this.normalizeTasks(tasks, columnMapping);
    
    // Initialize dependency resolver
    const resolver = new TaskDependencyResolver(normalizedTasks, {
      workingDays: this.config.workingDays
    });

    // Check for circular dependencies first
    const circularDependencies = this.detectAllCircularDependencies(tasks, resolver, predecessorsColumn);
    
    if (circularDependencies.length > 0) {
      return {
        tasks,
        issues: {
          circularDependencies,
          warnings: [`Circular dependencies detected: ${circularDependencies.flat().join(', ')}`]
        }
      };
    }

    // Build dependency graph and process in topological order
    const processingOrder = this.getTopologicalOrder(tasks, predecessorsColumn);
    const updatedTasks = { ...tasks };

    // Process each task in dependency order
    for (const taskId of processingOrder) {
      const task = updatedTasks[taskId];
      if (!task) continue;

      const predecessorString = task[predecessorsColumn] || '';
      
      if (predecessorString) {
        // Update normalized tasks with latest data
        const currentNormalized = this.normalizeTasks(updatedTasks, columnMapping);
        resolver.tasks = currentNormalized;
        
        // Calculate new dates
        const normalizedTask = this.normalizeTask(task, taskId, columnMapping);
        const calculatedTask = resolver.calculateTaskDates(normalizedTask, predecessorString);
        
        // Apply calculated dates back to original task
        if (calculatedTask.startDate) {
          updatedTasks[taskId][startDateColumn] = calculatedTask.startDate;
        }
        if (calculatedTask.endDate) {
          updatedTasks[taskId][endDateColumn] = calculatedTask.endDate;
        }
      }
    }

    return {
      tasks: updatedTasks,
      issues: {
        circularDependencies: [],
        warnings: []
      }
    };
  }

  /**
   * Handle date/duration changes with automatic recalculation
   * @param {Object} task - Task that was modified
   * @param {string} changedField - Field that was changed
   * @param {*} newValue - New value
   * @param {Object} columnMapping - Column mappings
   * @returns {Object} Updated task
   */
  handleFieldChange(task, changedField, newValue, columnMapping) {
    const {
      startDateColumn = 'startDate',
      endDateColumn = 'endDate', 
      durationColumn = 'duration'
    } = columnMapping;

    const updatedTask = { ...task, [changedField]: newValue };

    // Handle duration changes
    if (changedField === durationColumn) {
      const duration = parseInt(newValue) || 1;
      const startDate = DateFormatter.parse(updatedTask[startDateColumn]);
      
      if (startDate) {
        const newEndDate = calculateEndDate(startDate, duration);
        if (newEndDate) {
          updatedTask[endDateColumn] = DateFormatter.toISO(newEndDate);
        }
      }
    }
    
    // Handle start date changes
    else if (changedField === startDateColumn) {
      const startDate = DateFormatter.parse(newValue);
      const duration = parseInt(updatedTask[durationColumn]) || 1;
      
      if (startDate) {
        const newEndDate = calculateEndDate(startDate, duration);
        if (newEndDate) {
          updatedTask[endDateColumn] = DateFormatter.toISO(newEndDate);
        }
      }
    }
    
    // Handle end date changes - recalculate duration
    else if (changedField === endDateColumn) {
      const startDate = DateFormatter.parse(updatedTask[startDateColumn]);
      const endDate = DateFormatter.parse(newValue);
      
      if (startDate && endDate) {
        const newDuration = calculateDuration(startDate, endDate);
        updatedTask[durationColumn] = newDuration;
      }
    }

    return updatedTask;
  }

  /**
   * Get suggested predecessors based on task sequence
   * @param {string} currentTaskId - Current task ID
   * @param {Object} allTasks - All tasks
   * @returns {Array} Suggested predecessor objects
   */
  getSuggestedPredecessors(currentTaskId, allTasks) {
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
  }

  /**
   * Normalize tasks for internal processing
   * @private
   */
  normalizeTasks(tasks, columnMapping) {
    const normalized = {};
    
    for (const [taskId, task] of Object.entries(tasks)) {
      normalized[taskId] = this.normalizeTask(task, taskId, columnMapping);
    }
    
    return normalized;
  }

  /**
   * Normalize single task
   * @private
   */
  normalizeTask(task, taskId, columnMapping) {
    const {
      startDateColumn = 'startDate',
      endDateColumn = 'endDate',
      durationColumn = 'duration',
      predecessorsColumn = 'predecessors'
    } = columnMapping;

    return {
      id: taskId,
      startDate: task[startDateColumn],
      endDate: task[endDateColumn],
      duration: task[durationColumn],
      predecessors: task[predecessorsColumn]
    };
  }

  /**
   * Detect circular dependencies across all tasks
   * @private
   */
  detectAllCircularDependencies(tasks, resolver, predecessorsColumn) {
    const cycles = [];
    
    for (const [taskId, task] of Object.entries(tasks)) {
      const predecessorString = task[predecessorsColumn] || '';
      if (predecessorString) {
        const taskCycles = resolver.detectCircularDependencies(predecessorString, taskId);
        cycles.push(...taskCycles);
      }
    }
    
    return cycles;
  }

  /**
   * Get topological processing order for tasks
   * @private
   */
  getTopologicalOrder(tasks, predecessorsColumn) {
    const graph = {};
    const inDegree = {};
    
    // Initialize
    for (const taskId of Object.keys(tasks)) {
      graph[taskId] = [];
      inDegree[taskId] = 0;
    }

    // Build dependency graph
    for (const [taskId, task] of Object.entries(tasks)) {
      const predecessorString = task[predecessorsColumn] || '';
      if (predecessorString) {
        const deps = this.parseDependencyString(predecessorString);
        for (const dep of deps) {
          if (tasks[dep.taskId]) {
            graph[dep.taskId].push(taskId);
            inDegree[taskId]++;
          }
        }
      }
    }

    // Topological sort
    const queue = [];
    for (const [taskId, degree] of Object.entries(inDegree)) {
      if (degree === 0) {
        queue.push(taskId);
      }
    }

    const result = [];
    while (queue.length > 0) {
      const currentTaskId = queue.shift();
      result.push(currentTaskId);

      for (const dependentTaskId of graph[currentTaskId]) {
        inDegree[dependentTaskId]--;
        if (inDegree[dependentTaskId] === 0) {
          queue.push(dependentTaskId);
        }
      }
    }

    return result;
  }

  /**
   * Parse dependency string - simple wrapper
   * @private
   */
  parseDependencyString(predecessorString) {
    // Import here to avoid circular dependency
    const { parseDependencies } = require('./dependencyEngine.js');
    return parseDependencies(predecessorString);
  }
}

/**
 * Factory function to create project calculator with configuration
 * @param {Object} config - Configuration options
 * @returns {ProjectCalculator} Configured calculator instance
 */
export const createProjectCalculator = (config = {}) => {
  return new ProjectCalculator(config);
};
