/**
 * Grid View Adapter - Loose coupling adapter for GridView integration
 * 
 * This adapter provides a clean interface between the GridView component
 * and the loosely coupled calculation engines.
 */

import { createProjectCalculator } from './projectCalculator.js';
import { parseDependencies, formatDependencies, TaskDependencyResolver } from './dependencyEngine.js';
import { calculateDuration, DateFormatter } from './taskCalculations.js';

/**
 * Grid View Adapter Class
 */
export class GridViewAdapter {
  constructor(projectSettings = {}) {
    this.projectSettings = projectSettings;
    this.calculator = createProjectCalculator({
      workingDays: projectSettings.workingDays?.workingDays || ['M', 'T', 'W', 'R', 'F']
    });
  }

  /**
   * Update project settings
   * @param {Object} newSettings - New project settings
   */
  updateSettings(newSettings) {
    this.projectSettings = newSettings;
    this.calculator = createProjectCalculator({
      workingDays: newSettings.workingDays?.workingDays || ['M', 'T', 'W', 'R', 'F']
    });
  }

  /**
   * Get column mapping from project settings
   * @returns {Object} Column mapping configuration
   */
  getColumnMapping() {
    return {
      predecessorsColumn: this.projectSettings.dependencies?.predecessorsColumn || 'predecessors',
      startDateColumn: this.projectSettings.dateRange?.startDateColumn || 'startDate',
      endDateColumn: this.projectSettings.dateRange?.endDateColumn || 'endDate',
      durationColumn: this.projectSettings.dependencies?.durationColumn || 'duration'
    };
  }

  /**
   * Handle cell edit with automatic recalculation
   * @param {Object} rowData - All row data
   * @param {string} rowNumber - Row number that was edited
   * @param {string} column - Column that was edited
   * @param {*} value - New value
   * @returns {Object} Updated row data
   */
  handleCellEdit(rowData, rowNumber, column, value) {
    const columnMapping = this.getColumnMapping();
    const task = rowData[rowNumber];
    
    if (!task) return rowData;

    // Handle the field change
    const updatedTask = this.calculator.handleFieldChange(task, column, value, columnMapping);
    
    // Update row data
    const updatedRowData = {
      ...rowData,
      [rowNumber]: updatedTask
    };

    // Check if this change affects dependencies and requires project recalculation
    const affectsProject = this.doesChangeAffectProject(column, columnMapping);
    
    if (affectsProject && this.projectSettings.dependencies?.enabled) {
      const result = this.recalculateProject(updatedRowData);
      return result.tasks; // Return only the tasks, not the full result object
    }

    return updatedRowData;
  }

  /**
   * Handle predecessor change
   * @param {Object} rowData - All row data
   * @param {string} rowNumber - Row number
   * @param {string} predecessorValue - New predecessor value
   * @returns {Object} Updated row data and validation results
   */
  handlePredecessorChange(rowData, rowNumber, predecessorValue) {
    const columnMapping = this.getColumnMapping();
    
    // Validate predecessors
    const validation = this.validatePredecessors(predecessorValue, rowData, rowNumber);
    
    if (!validation.isValid) {
      return {
        rowData,
        validation,
        success: false
      };
    }

    // Update the task
    const updatedRowData = {
      ...rowData,
      [rowNumber]: {
        ...rowData[rowNumber],
        [columnMapping.predecessorsColumn]: predecessorValue
      }
    };

    // Recalculate project if dependencies are enabled
    if (this.projectSettings.dependencies?.enabled) {
      const recalculatedData = this.recalculateProject(updatedRowData);
      return {
        rowData: recalculatedData.tasks,
        validation: { isValid: true, errors: [] },
        issues: recalculatedData.issues,
        success: true
      };
    }

    return {
      rowData: updatedRowData,
      validation: { isValid: true, errors: [] },
      success: true
    };
  }

  /**
   * Recalculate entire project
   * @param {Object} rowData - All row data
   * @returns {Object} Recalculation results
   */
  recalculateProject(rowData) {
    const columnMapping = this.getColumnMapping();
    return this.calculator.recalculateProject(rowData, columnMapping);
  }

  /**
   * Get suggested predecessors for a task
   * @param {string} currentTaskId - Current task ID
   * @param {Object} allTasks - All tasks
   * @returns {Array} Suggested predecessors
   */
  getSuggestedPredecessors(currentTaskId, allTasks) {
    return this.calculator.getSuggestedPredecessors(currentTaskId, allTasks);
  }

  /**
   * Validate predecessor string
   * @param {string} predecessorString - Predecessor string to validate
   * @param {Object} allTasks - All tasks
   * @param {string} currentTaskId - Current task ID
   * @returns {Object} Validation result
   */
  validatePredecessors(predecessorString, allTasks, currentTaskId) {
    const errors = [];
    
    if (!predecessorString || predecessorString.trim() === '' || predecessorString.toLowerCase() === 'none') {
      return { isValid: true, errors: [] };
    }

    const dependencies = parseDependencies(predecessorString);
    
    for (const dep of dependencies) {
      // Check if task exists
      if (!allTasks[dep.taskId]) {
        errors.push(`Task ${dep.taskId} does not exist`);
        continue;
      }

      // Check for self-reference
      if (dep.taskId === parseInt(currentTaskId)) {
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

    // Check for circular dependencies
    const columnMapping = this.getColumnMapping();
    const normalizedTasks = this.normalizeTasksForCircularCheck(allTasks, columnMapping);
    const resolver = this.calculator.resolver || new TaskDependencyResolver(normalizedTasks);
    
    const cycles = resolver.detectCircularDependencies(predecessorString, currentTaskId);
    if (cycles.length > 0) {
      errors.push(`Would create circular dependency: ${cycles.flat().join(' → ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Parse predecessor string
   * @param {string} predecessorString - String to parse
   * @returns {Array} Parsed dependencies
   */
  parsePredecessors(predecessorString) {
    return parseDependencies(predecessorString);
  }

  /**
   * Format dependencies to string
   * @param {Array} dependencies - Dependencies array
   * @returns {string} Formatted string
   */
  formatPredecessors(dependencies) {
    return formatDependencies(dependencies);
  }

  /**
   * Calculate task duration
   * @param {Object} task - Task object
   * @returns {number} Duration in days
   */
  calculateTaskDuration(task) {
    const columnMapping = this.getColumnMapping();
    const startDate = task[columnMapping.startDateColumn];
    const endDate = task[columnMapping.endDateColumn];
    
    if (!startDate || !endDate) return 1;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 1;
    if (end < start) return 1;
    
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  }

  /**
   * Check if a field change affects the entire project
   * @private
   */
  doesChangeAffectProject(column, columnMapping) {
    return [
      columnMapping.startDateColumn,
      columnMapping.endDateColumn,
      columnMapping.durationColumn,
      columnMapping.predecessorsColumn
    ].includes(column);
  }

  /**
   * Normalize tasks for circular dependency checking
   * @private
   */
  normalizeTasksForCircularCheck(tasks, columnMapping) {
    const normalized = {};
    
    for (const [taskId, task] of Object.entries(tasks)) {
      normalized[taskId] = {
        id: taskId,
        predecessors: task[columnMapping.predecessorsColumn] || ''
      };
    }
    
    return normalized;
  }
}

/**
 * Factory function to create adapter
 * @param {Object} projectSettings - Project settings
 * @returns {GridViewAdapter} Configured adapter
 */
export const createGridViewAdapter = (projectSettings) => {
  return new GridViewAdapter(projectSettings);
};
