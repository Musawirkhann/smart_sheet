// Conditional Formatting Utilities

/**
 * Evaluates a condition against a cell value
 * @param {*} cellValue - The value of the cell to evaluate
 * @param {Object} condition - The condition object
 * @param {string} condition.operator - The operator (contains, equals, etc.)
 * @param {*} condition.value - The value to compare against
 * @returns {boolean} - Whether the condition is met
 */
export const evaluateCondition = (cellValue, condition) => {
  const { operator, value } = condition;
  
  // Convert to string for most comparisons
  const cellStr = String(cellValue || '').toLowerCase();
  const valueStr = String(value || '').toLowerCase();
  
  switch (operator) {
    case 'contains':
      return cellStr.includes(valueStr);
      
    case 'equals':
    case 'is_equal_to':
      return cellStr === valueStr;
      
    case 'not_equals':
    case 'is_not_equal_to':
      return cellStr !== valueStr;
      
    case 'greater_than':
      const cellNum = parseFloat(cellValue);
      const valueNum = parseFloat(value);
      return !isNaN(cellNum) && !isNaN(valueNum) && cellNum > valueNum;
      
    case 'less_than':
      const cellNum2 = parseFloat(cellValue);
      const valueNum2 = parseFloat(value);
      return !isNaN(cellNum2) && !isNaN(valueNum2) && cellNum2 < valueNum2;
      
    case 'greater_than_or_equal':
      const cellNum3 = parseFloat(cellValue);
      const valueNum3 = parseFloat(value);
      return !isNaN(cellNum3) && !isNaN(valueNum3) && cellNum3 >= valueNum3;
      
    case 'less_than_or_equal':
      const cellNum4 = parseFloat(cellValue);
      const valueNum4 = parseFloat(value);
      return !isNaN(cellNum4) && !isNaN(valueNum4) && cellNum4 <= valueNum4;
      
    case 'between':
      // Assuming value is in format "min,max"
      const [min, max] = String(value).split(',').map(v => parseFloat(v.trim()));
      const cellNum5 = parseFloat(cellValue);
      return !isNaN(cellNum5) && !isNaN(min) && !isNaN(max) && cellNum5 >= min && cellNum5 <= max;
      
    case 'blank':
    case 'is_blank':
      return !cellValue || cellValue === '' || cellValue === null || cellValue === undefined;
      
    case 'not_blank':
    case 'is_not_blank':
      return cellValue && cellValue !== '' && cellValue !== null && cellValue !== undefined;
      
    case 'is_number':
      return !isNaN(parseFloat(cellValue)) && isFinite(cellValue);
      
    case 'not_number':
    case 'is_not_number':
      return isNaN(parseFloat(cellValue)) || !isFinite(cellValue);
      
    case 'starts_with':
      return cellStr.startsWith(valueStr);
      
    case 'ends_with':
      return cellStr.endsWith(valueStr);
      
    case 'does_not_contain':
      return !cellStr.includes(valueStr);
      
    default:
      return false;
  }
};

/**
 * Evaluates all conditions for a rule (supports AND logic)
 * @param {Object} row - The row data
 * @param {Object} rule - The conditional formatting rule
 * @returns {boolean} - Whether all conditions are met
 */
export const evaluateRule = (row, rule) => {
  if (!rule.enabled) return false;
  
  const { condition } = rule;
  
  // For now, we only support single conditions
  // Future enhancement: support multiple conditions with AND/OR logic
  const cellValue = row[condition.column];
  return evaluateCondition(cellValue, condition);
};

/**
 * Gets the applicable formatting for a cell based on all rules
 * @param {Object} row - The row data
 * @param {string} columnKey - The column key
 * @param {Array} rules - Array of conditional formatting rules
 * @returns {Object|null} - The formatting object or null if no rules apply
 */
export const getCellFormatting = (row, columnKey, rules) => {
  if (!rules || rules.length === 0 || !row) return null;
  
  // Rules are processed in order, first matching rule wins (higher priority)
  for (const rule of rules) {
    if (evaluateRule(row, rule)) {
      const { format } = rule;
      
      // Check if this rule applies to this cell
      if (format.applyToEntireRow) {
        return format;
      } else if (format.applyToColumn) {
        const targetColumns = format.applyToColumn.split(',').map(col => col.trim()).filter(Boolean);
        if (targetColumns.includes(columnKey)) {
          return format;
        }
      }
    }
  }
  
  return null;
};

/**
 * Gets the applicable formatting for an entire row based on all rules
 * @param {Object} row - The row data
 * @param {Array} rules - Array of conditional formatting rules
 * @returns {Object|null} - The formatting object or null if no rules apply
 */
export const getRowFormatting = (row, rules) => {
  if (!rules || rules.length === 0) return null;
  
  // Rules are processed in order, first matching rule wins (higher priority)
  for (const rule of rules) {
    if (evaluateRule(row, rule) && rule.format.applyToEntireRow) {
      return rule.format;
    }
  }
  
  return null;
};

/**
 * Converts a format object to CSS styles
 * @param {Object} format - The format object
 * @returns {Object} - CSS style object
 */
export const formatToCSSStyles = (format) => {
  if (!format) return {};
  
  const styles = {};
  
  if (format.backgroundColor && format.backgroundColor !== 'transparent') {
    styles.backgroundColor = format.backgroundColor;
  }
  
  if (format.textColor && format.textColor !== '#000000') {
    styles.color = format.textColor;
  }
  
  if (format.fontWeight && format.fontWeight !== 'normal') {
    styles.fontWeight = format.fontWeight;
  }
  
  if (format.fontStyle && format.fontStyle !== 'normal') {
    styles.fontStyle = format.fontStyle;
  }
  
  if (format.textDecoration && format.textDecoration !== 'none') {
    styles.textDecoration = format.textDecoration;
  }
  
  if (format.fontSize) {
    styles.fontSize = format.fontSize;
  }
  
  if (format.fontFamily) {
    styles.fontFamily = format.fontFamily;
  }
  
  return styles;
};

/**
 * Validates a conditional formatting rule
 * @param {Object} rule - The rule to validate
 * @returns {Object} - Validation result with isValid and errors
 */
export const validateRule = (rule) => {
  const errors = [];
  
  if (!rule.condition) {
    errors.push('Rule must have a condition');
  } else {
    if (!rule.condition.column) {
      errors.push('Condition must specify a column');
    }
    
    if (!rule.condition.operator) {
      errors.push('Condition must specify an operator');
    }
    
    // Check if value is required for this operator
    const operatorsRequiringValue = [
      'contains', 'equals', 'not_equals', 'greater_than', 'less_than',
      'greater_than_or_equal', 'less_than_or_equal', 'between',
      'starts_with', 'ends_with', 'does_not_contain'
    ];
    
    if (operatorsRequiringValue.includes(rule.condition.operator) && 
        (rule.condition.value === undefined || rule.condition.value === '')) {
      errors.push('This operator requires a value');
    }
  }
  
  if (!rule.format) {
    errors.push('Rule must have formatting');
  } else {
    if (!rule.format.applyToEntireRow && !rule.format.applyToColumn) {
      errors.push('Rule must specify what to format (entire row or specific columns)');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Creates a default conditional formatting rule
 * @param {Array} columns - Available columns
 * @returns {Object} - Default rule object
 */
export const createDefaultRule = (columns) => {
  const firstColumn = columns.length > 0 ? columns[0].key : '';
  
  return {
    id: Date.now(),
    condition: {
      column: firstColumn,
      operator: 'contains',
      value: '',
      customCriteria: true
    },
    format: {
      backgroundColor: '#ffff99',
      textColor: '#000000',
      fontWeight: 'normal',
      fontStyle: 'normal',
      textDecoration: 'none',
      applyToEntireRow: true,
      applyToColumn: ''
    },
    enabled: true
  };
};

/**
 * Exports conditional formatting rules to a JSON string
 * @param {Array} rules - Array of rules to export
 * @returns {string} - JSON string of rules
 */
export const exportRules = (rules) => {
  return JSON.stringify(rules, null, 2);
};

/**
 * Imports conditional formatting rules from a JSON string
 * @param {string} jsonString - JSON string of rules
 * @returns {Array} - Array of imported rules
 */
export const importRules = (jsonString) => {
  try {
    const rules = JSON.parse(jsonString);
    return Array.isArray(rules) ? rules : [];
  } catch (error) {
    console.error('Error importing conditional formatting rules:', error);
    return [];
  }
};

/**
 * Gets a preview of how a rule will affect the data
 * @param {Array} rows - The data rows
 * @param {Object} rule - The rule to preview
 * @returns {Object} - Preview information
 */
export const getPreview = (rows, rule) => {
  let affectedRows = 0;
  let affectedCells = 0;
  
  rows.forEach(row => {
    if (evaluateRule(row, rule)) {
      affectedRows++;
      if (rule.format.applyToEntireRow) {
        // Count all visible cells in the row
        affectedCells += Object.keys(row).length;
      } else if (rule.format.applyToColumn) {
        const targetColumns = rule.format.applyToColumn.split(',').map(col => col.trim());
        affectedCells += targetColumns.length;
      }
    }
  });
  
  return {
    affectedRows,
    affectedCells,
    totalRows: rows.length
  };
};
