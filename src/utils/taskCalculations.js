/**
 * Task Calculations - Loosely Coupled Architecture
 * 
 * This module provides pure functions for task calculations without tight coupling
 * to specific column names or UI components.
 */

/**
 * Pure function to calculate end date from start date and duration
 * @param {Date|string} startDate - The start date
 * @param {number} duration - Duration in days
 * @returns {Date} The calculated end date
 */
export const calculateEndDate = (startDate, duration) => {
  if (!startDate || !duration || duration <= 0) return null;
  
  const start = new Date(startDate);
  if (isNaN(start.getTime())) return null;
  
  const end = new Date(start);
  end.setDate(end.getDate() + duration - 1);
  return end;
};

/**
 * Pure function to calculate start date from end date and duration
 * @param {Date|string} endDate - The end date
 * @param {number} duration - Duration in days
 * @returns {Date} The calculated start date
 */
export const calculateStartDate = (endDate, duration) => {
  if (!endDate || !duration || duration <= 0) return null;
  
  const end = new Date(endDate);
  if (isNaN(end.getTime())) return null;
  
  const start = new Date(end);
  start.setDate(start.getDate() - duration + 1);
  return start;
};

/**
 * Pure function to calculate duration from start and end dates
 * @param {Date|string} startDate - The start date
 * @param {Date|string} endDate - The end date
 * @returns {number} Duration in days
 */
export const calculateDuration = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
  if (end < start) return 0;
  
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
};

/**
 * Working days calculation utilities
 */
export const WorkingDaysCalculator = {
  /**
   * Calculate working days between two dates
   * @param {Date|string} startDate 
   * @param {Date|string} endDate 
   * @param {string[]} workingDays - Array like ['M', 'T', 'W', 'R', 'F']
   * @returns {number} Number of working days
   */
  calculateWorkingDays: (startDate, endDate, workingDays = ['M', 'T', 'W', 'R', 'F']) => {
    if (!startDate || !endDate) return 0;

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) return 0;

    const dayMap = {
      'Su': 0, 'M': 1, 'T': 2, 'W': 3, 'R': 4, 'F': 5, 'Sa': 6
    };

    const workingDayNumbers = workingDays.map(day => dayMap[day]).filter(num => num !== undefined);

    let count = 0;
    const current = new Date(start);

    while (current <= end) {
      if (workingDayNumbers.includes(current.getDay())) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }

    return count - 1;
  },

  /**
   * Add working days to a date
   * @param {Date|string} startDate 
   * @param {number} days 
   * @param {string[]} workingDays 
   * @returns {Date} New date after adding working days
   */
  addWorkingDays: (startDate, days, workingDays = ['M', 'T', 'W', 'R', 'F']) => {
    if (!startDate || days <= 0) return new Date(startDate);

    const dayMap = {
      'Su': 0, 'M': 1, 'T': 2, 'W': 3, 'R': 4, 'F': 5, 'Sa': 6
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
  }
};

/**
 * Date formatting utilities
 */
export const DateFormatter = {
  /**
   * Format date to ISO string (YYYY-MM-DD)
   * @param {Date} date 
   * @returns {string} ISO date string
   */
  toISO: (date) => {
    if (!date || isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  },

  /**
   * Parse date from various formats
   * @param {Date|string} dateInput 
   * @returns {Date|null} Parsed date or null
   */
  parse: (dateInput) => {
    if (!dateInput) return null;
    if (dateInput instanceof Date) return dateInput;
    
    const parsed = new Date(dateInput);
    return isNaN(parsed.getTime()) ? null : parsed;
  }
};
