import { useState, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Plus, Edit, Copy, Trash2, HelpCircle, 
  Palette, Bold, Italic, Underline, Strikethrough,
  ChevronUp, Check, AlertCircle, Eye, EyeOff
} from 'lucide-react';
import Button from './Button';

// Separate memoized RuleEditor component to prevent unnecessary re-renders
const RuleEditor = memo(({ rule, columns, operatorOptions, backgroundColors, textColors, updateRuleCondition, updateRuleFormat, rowData }) => {
  const [useCustomCriteria, setUseCustomCriteria] = useState(rule.condition.customCriteria || false);
  const [distinctValues, setDistinctValues] = useState([]);

  // Get distinct values from row data for the selected column
  const getDistinctValues = useCallback((columnKey) => {
    if (!rowData || Object.keys(rowData).length === 0) {
      // Fallback to mock values if no data available
      const mockValues = {
        taskName: ['Project Kickoff', 'Design Phase', 'Development Phase', 'Testing Phase', 'Launch'],
        status: ['Pending', 'In Progress', 'Completed', 'On Hold'],
        assignedTo: ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson'],
        priority: ['High', 'Medium', 'Low'],
      };
      return mockValues[columnKey] || [];
    }
    
    // Extract distinct values from actual row data
    const values = new Set();
    Object.values(rowData).forEach(row => {
      const value = row[columnKey];
      if (value !== undefined && value !== null && value !== '') {
        values.add(String(value).trim());
      }
    });
    
    return Array.from(values).sort();
  }, [rowData]);

  // Update distinct values when column changes
  useEffect(() => {
    if (rule.condition.column) {
      setDistinctValues(getDistinctValues(rule.condition.column));
    }
  }, [rule.condition.column, getDistinctValues]);

  const handleColumnChange = (columnKey) => {
    updateRuleCondition(rule.id, { column: columnKey });
    setDistinctValues(getDistinctValues(columnKey));
  };

  const handleValueSelect = (value) => {
    updateRuleCondition(rule.id, { 
      value: value,
      operator: 'equals',
      customCriteria: false
    });
    setUseCustomCriteria(false);
  };

  const handleCustomCriteriaToggle = (useCustom) => {
    setUseCustomCriteria(useCustom);
    updateRuleCondition(rule.id, { 
      customCriteria: useCustom,
      ...(useCustom ? {} : { operator: 'equals', value: '' })
    });
  };

  return (
  <motion.div
    initial={{ opacity: 0, height: 0 }}
    animate={{ opacity: 1, height: 'auto' }}
    exit={{ opacity: 0, height: 0 }}
    className="border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 p-4 space-y-4"
  >
    {/* Condition Section */}
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
        Condition
      </h4>
      
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Column
        </label>
        <select
          value={rule.condition.column}
          onChange={(e) => handleColumnChange(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {columns.map(col => (
            <option key={col.key} value={col.key}>{col.label}</option>
          ))}
        </select>
      </div>

      {/* Criteria Selection Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              name={`criteria-mode-${rule.id}`}
              checked={!useCustomCriteria}
              onChange={() => handleCustomCriteriaToggle(false)}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Select from values</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name={`criteria-mode-${rule.id}`}
              checked={useCustomCriteria}
              onChange={() => handleCustomCriteriaToggle(true)}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Custom criteria</span>
          </label>
        </div>
      </div>

      {/* Distinct Values Selection */}
      {!useCustomCriteria && distinctValues.length > 0 && (
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Values
          </label>
          <div className="border border-gray-300 dark:border-gray-600 rounded-lg max-h-32 overflow-y-auto bg-white dark:bg-gray-800">
            {distinctValues.map((value, index) => (
              <div
                key={index}
                className={`p-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-600 last:border-b-0 ${
                  rule.condition.value === value ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
                onClick={() => handleValueSelect(value)}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    name={`distinct-value-${rule.id}`}
                    checked={rule.condition.value === value}
                    onChange={() => handleValueSelect(value)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                  />
                  <label className="ml-3 text-sm text-gray-900 dark:text-white">
                    {value}
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Custom Criteria (only show when custom criteria is selected) */}
      {useCustomCriteria && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Custom Operator
            </label>
            <select
              value={rule.condition.operator}
              onChange={(e) => updateRuleCondition(rule.id, { operator: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {operatorOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Custom Value
            </label>
            {!['blank', 'not_blank', 'is_number', 'not_number'].includes(rule.condition.operator) ? (
              <input
                type="text"
                value={rule.condition.value}
                onChange={(e) => updateRuleCondition(rule.id, { value: e.target.value })}
                placeholder="Enter value"
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <div className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 flex items-center">
                No value needed
              </div>
            )}
          </div>
        </div>
      )}
    </div>

    {/* Format Section */}
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
        <Palette className="w-4 h-4 mr-2 text-purple-500" />
        Format
      </h4>
      
      {/* Background Color */}
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
          Background Color
        </label>
        <div className="flex flex-wrap gap-2">
          {backgroundColors.map((colorOption) => (
            <button
              key={colorOption.name}
              className={`w-8 h-8 rounded border-2 hover:scale-110 transition-transform ${
                rule.format.backgroundColor === colorOption.color 
                  ? 'border-blue-500 ring-2 ring-blue-200' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              style={{ backgroundColor: colorOption.color }}
              onClick={() => updateRuleFormat(rule.id, { backgroundColor: colorOption.color })}
              title={colorOption.name}
            />
          ))}
        </div>
      </div>

      {/* Text Color */}
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
          Text Color
        </label>
        <div className="flex flex-wrap gap-2">
          {textColors.map((color) => (
            <button
              key={color}
              className={`w-6 h-6 rounded border-2 hover:scale-110 transition-transform ${
                rule.format.textColor === color 
                  ? 'border-blue-500 ring-2 ring-blue-200' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              style={{ backgroundColor: color }}
              onClick={() => updateRuleFormat(rule.id, { textColor: color })}
            />
          ))}
        </div>
      </div>

      {/* Font Style */}
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
          Font Style
        </label>
        <div className="flex items-center space-x-2">
          <Button
            variant={rule.format.fontWeight === 'bold' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => updateRuleFormat(rule.id, { 
              fontWeight: rule.format.fontWeight === 'bold' ? 'normal' : 'bold' 
            })}
            className="px-2 py-1 border border-gray-300 rounded-md"
          >
            <Bold className="w-4 h-4" />
          </Button>
          <Button
            variant={rule.format.fontStyle === 'italic' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => updateRuleFormat(rule.id, { 
              fontStyle: rule.format.fontStyle === 'italic' ? 'normal' : 'italic' 
            })}
            className="px-2 py-1 border border-gray-300 rounded-md"
          >
            <Italic className="w-4 h-4" />
          </Button>
          <Button
            variant={rule.format.textDecoration === 'underline' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => updateRuleFormat(rule.id, { 
              textDecoration: rule.format.textDecoration === 'underline' ? 'none' : 'underline' 
            })}
            className="px-2 py-1 border border-gray-300 rounded-md"
          >
            <Underline className="w-4 h-4" />
          </Button>
          <Button
            variant={rule.format.textDecoration === 'line-through' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => updateRuleFormat(rule.id, { 
              textDecoration: rule.format.textDecoration === 'line-through' ? 'none' : 'line-through' 
            })}
            className="px-2 py-1 border border-gray-300 rounded-md"
          >
            <Strikethrough className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Apply To */}
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
          Apply To
        </label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name={`apply-${rule.id}`}
              checked={rule.format.applyToEntireRow}
              onChange={() => updateRuleFormat(rule.id, { applyToEntireRow: true, applyToColumn: '' })}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Entire row</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name={`apply-${rule.id}`}
              checked={!rule.format.applyToEntireRow}
              onChange={() => updateRuleFormat(rule.id, { applyToEntireRow: false })}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Specific columns</span>
          </label>
          
          {!rule.format.applyToEntireRow && (
            <div className="ml-6 mt-2">
              <select
                multiple
                value={rule.format.applyToColumn ? rule.format.applyToColumn.split(',') : []}
                onChange={(e) => {
                  const selectedColumns = Array.from(e.target.selectedOptions, option => option.value);
                  updateRuleFormat(rule.id, { applyToColumn: selectedColumns.join(',') });
                }}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                size="3"
              >
                {columns.map(col => (
                  <option key={col.key} value={col.key}>{col.label}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Preview */}
      <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Preview:</span>
        <div
          style={{
            backgroundColor: rule.format.backgroundColor,
            color: rule.format.textColor,
            fontWeight: rule.format.fontWeight,
            fontStyle: rule.format.fontStyle,
            textDecoration: rule.format.textDecoration,
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            minWidth: '60px',
            textAlign: 'center',
            border: '1px solid #e1e5e9'
          }}
          className="font-mono"
        >
          Abc
        </div>
      </div>
    </div>
  </motion.div>
  );
});

RuleEditor.displayName = 'RuleEditor';

const ConditionalFormattingModal = ({ 
  isOpen, 
  onClose, 
  columns, 
  onSaveRules, 
  existingRules = [], 
  rowData = {}
}) => {
  const [rules, setRules] = useState(existingRules);
  const [expandedRule, setExpandedRule] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    setRules(existingRules);
  }, [existingRules]);

  const handleAddNewRule = () => {
    const newRule = {
      id: Date.now(),
      condition: {
        column: columns[0]?.key || '',
        operator: 'contains',
        value: '',
        customCriteria: false
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
    
    setRules(prev => [...prev, newRule]);
    setExpandedRule(newRule.id);
  };

  const handleCloneRule = (rule) => {
    const clonedRule = {
      ...rule,
      id: Date.now(),
      condition: { ...rule.condition },
      format: { ...rule.format }
    };
    setRules(prev => [...prev, clonedRule]);
    setExpandedRule(clonedRule.id);
  };

  const handleDeleteRule = (ruleId) => {
    setRules(prev => prev.filter(rule => rule.id !== ruleId));
    if (expandedRule === ruleId) {
      setExpandedRule(null);
    }
  };

  const handleToggleRule = (ruleId) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    ));
  };

  // eslint-disable-next-line no-unused-vars
  const updateRule = (ruleId, updates) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, ...updates } : rule
    ));
  };

  const updateRuleCondition = useCallback((ruleId, conditionUpdates) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId 
        ? { ...rule, condition: { ...rule.condition, ...conditionUpdates } }
        : rule
    ));
  }, []);

  const updateRuleFormat = useCallback((ruleId, formatUpdates) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId 
        ? { ...rule, format: { ...rule.format, ...formatUpdates } }
        : rule
    ));
  }, []);

  const handleSaveAll = () => {
    onSaveRules(rules);
    onClose();
  };

  const getConditionText = (rule) => {
    const column = columns.find(col => col.key === rule.condition.column);
    const columnName = column ? column.label : rule.condition.column;
    
    const operatorText = {
      'contains': 'contains',
      'equals': 'equals',
      'not_equals': 'does not equal',
      'greater_than': 'is greater than',
      'less_than': 'is less than',
      'between': 'is between',
      'blank': 'is blank',
      'not_blank': 'is not blank',
      'is_number': 'is a number',
      'not_number': 'is not a number'
    };
    
    const operator = operatorText[rule.condition.operator] || rule.condition.operator;
    const value = rule.condition.value ? `"${rule.condition.value}"` : '';
    
    return `${columnName} ${operator} ${value}`.trim();
  };

  const getFormatPreview = (format) => {
    const styles = {
      backgroundColor: format.backgroundColor,
      color: format.textColor,
      fontWeight: format.fontWeight,
      fontStyle: format.fontStyle,
      textDecoration: format.textDecoration,
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '12px',
      minWidth: '60px',
      textAlign: 'center',
      border: '1px solid #e1e5e9'
    };

    return (
      <div style={styles} className="font-mono">
        Abc
      </div>
    );
  };

  const operatorOptions = [
    { value: 'contains', label: 'contains' },
    { value: 'equals', label: 'equals' },
    { value: 'not_equals', label: 'does not equal' },
    { value: 'greater_than', label: 'is greater than' },
    { value: 'less_than', label: 'is less than' },
    { value: 'between', label: 'is between' },
    { value: 'blank', label: 'is blank' },
    { value: 'not_blank', label: 'is not blank' },
    { value: 'is_number', label: 'is a number' },
    { value: 'not_number', label: 'is not a number' }
  ];

  const backgroundColors = [
    { name: 'Yellow', color: '#ffff99' },
    { name: 'Light Green', color: '#90EE90' },
    { name: 'Light Blue', color: '#ADD8E6' },
    { name: 'Light Pink', color: '#FFB6C1' },
    { name: 'Light Orange', color: '#FFE4B5' },
    { name: 'Light Purple', color: '#DDA0DD' },
    { name: 'Light Gray', color: '#D3D3D3' },
    { name: 'White', color: '#FFFFFF' },
    { name: 'Red', color: '#FF6B6B' },
    { name: 'Green', color: '#4ECDC4' },
    { name: 'Blue', color: '#45B7D1' },
    { name: 'Purple', color: '#96CEB4' }
  ];

  const textColors = [
    '#000000', '#333333', '#666666', '#999999', '#FFFFFF',
    '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'
  ];


  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-700"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-800">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Palette className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Conditional Formatting
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Format cells automatically based on their values
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setPreviewMode(!previewMode)}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  {previewMode ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                  {previewMode ? 'Hide Preview' : 'Show Preview'}
                </Button>
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Help
                </Button>
                <Button variant="ghost" size="sm" onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              <div className="p-6 space-y-4">
                {/* Add New Rule Button */}
                <div className="flex items-center justify-between">
                  <Button 
                    variant="primary" 
                    size="md"
                    onClick={handleAddNewRule}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Rule
                  </Button>
                  
                  {rules.length > 0 && (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {rules.filter(r => r.enabled).length} of {rules.length} rules active
                    </div>
                  )}
                </div>

                {/* Rules List */}
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {rules.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl">
                      <Palette className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <div className="text-lg font-medium mb-2">No formatting rules yet</div>
                      <div className="text-sm">Click "Add New Rule" to create your first conditional formatting rule.</div>
                    </div>
                  ) : (
                    rules.map((rule, index) => (
                      <motion.div
                        key={rule.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden transition-all ${
                          rule.enabled ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700 opacity-75'
                        } ${expandedRule === rule.id ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}
                      >
                        {/* Rule Summary */}
                        <div className="p-4">
                          <div className="flex items-center justify-between">
                            {/* Rule Content */}
                            <div className="flex items-center space-x-4 flex-1">
                              {/* Enable/Disable Toggle */}
                              <button
                                onClick={() => handleToggleRule(rule.id)}
                                className={`w-10 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                  rule.enabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                                }`}
                              >
                                <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${
                                  rule.enabled ? 'translate-x-5' : 'translate-x-1'
                                }`} />
                              </button>

                              {/* Rule Description */}
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 text-sm">
                                  <span className="text-gray-600 dark:text-gray-400">If</span>
                                  <span className="font-medium text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                    {getConditionText(rule)}
                                  </span>
                                  <span className="text-gray-600 dark:text-gray-400">then format</span>
                                  <span className="text-blue-600 dark:text-blue-400 font-medium">
                                    {rule.format.applyToEntireRow ? 'entire row' : 'selected columns'}
                                  </span>
                                </div>
                              </div>

                              {/* Format Preview */}
                              <div className="flex-shrink-0">
                                {getFormatPreview(rule.format)}
                              </div>
                            </div>

                            {/* Rule Actions */}
                            <div className="flex items-center space-x-1 ml-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setExpandedRule(expandedRule === rule.id ? null : rule.id)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                                title={expandedRule === rule.id ? "Collapse" : "Edit Rule"}
                              >
                                {expandedRule === rule.id ? (
                                  <ChevronUp className="w-4 h-4 text-gray-600" />
                                ) : (
                                  <Edit className="w-4 h-4 text-gray-600" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCloneRule(rule)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                                title="Clone Rule"
                              >
                                <Copy className="w-4 h-4 text-gray-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteRule(rule.id)}
                                className="p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded-md"
                                title="Delete Rule"
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Expanded Rule Editor */}
                        <AnimatePresence>
                          {expandedRule === rule.id && (
                            <RuleEditor 
                              rule={rule}
                              columns={columns}
                              operatorOptions={operatorOptions}
                              backgroundColors={backgroundColors}
                              textColors={textColors}
                              updateRuleCondition={updateRuleCondition}
                              updateRuleFormat={updateRuleFormat}
                              rowData={rowData}
                            />
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))
                  )}
                </div>

                {/* Rules Order Note */}
                {rules.length > 1 && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-800 dark:text-blue-200">
                        <strong>Rule Priority:</strong> Rules are applied from top to bottom. The first matching rule takes precedence.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <Button variant="ghost" onClick={onClose} className="px-6 py-2">
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveAll} className="px-6 py-2 bg-blue-600 hover:bg-blue-700">
                <Check className="w-4 h-4 mr-2" />
                Apply Rules
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConditionalFormattingModal;
