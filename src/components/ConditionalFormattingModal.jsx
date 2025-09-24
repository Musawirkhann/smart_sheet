import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, ChevronDown, Edit, Copy, Trash2, HelpCircle, Play } from 'lucide-react';
import Button from './Button';

const ConditionalFormattingModal = ({ isOpen, onClose, columns, onSaveRules, existingRules = [], rowData = {} }) => {
  const [rules, setRules] = useState(existingRules);
  const [showSetCondition, setShowSetCondition] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [newRule, setNewRule] = useState(null);

  const handleAddNewRule = () => {
    const rule = {
      id: Date.now(),
      condition: {
        column: '',
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
    setNewRule(rule);
    setEditingRule(rule);
    setShowSetCondition(true);
  };

  const handleEditRule = (rule) => {
    setEditingRule({ ...rule });
    setShowSetCondition(true);
  };

  const handleCloneRule = (rule) => {
    const clonedRule = {
      ...rule,
      id: Date.now(),
      condition: { ...rule.condition },
      format: { ...rule.format }
    };
    setRules(prev => [...prev, clonedRule]);
  };

  const handleDeleteRule = (ruleId) => {
    setRules(prev => prev.filter(rule => rule.id !== ruleId));
  };

  const handleSaveRule = (updatedRule) => {
    if (newRule && newRule.id === updatedRule.id) {
      setRules(prev => [...prev, updatedRule]);
      setNewRule(null);
    } else {
      setRules(prev => prev.map(rule => 
        rule.id === updatedRule.id ? updatedRule : rule
      ));
    }
    setShowSetCondition(false);
    setEditingRule(null);
  };

  const handleCancel = () => {
    setShowSetCondition(false);
    setEditingRule(null);
    setNewRule(null);
  };

  const handleSaveAll = () => {
    onSaveRules(rules);
    onClose();
  };

  const getConditionText = (rule) => {
    const column = columns.find(col => col.key === rule.condition.column);
    const columnName = column ? column.label : rule.condition.column;
    
    const operatorText = {
      'contains': 'contains',
      'equals': 'is',
      'not_equals': 'is not equal to',
      'greater_than': 'is greater than',
      'less_than': 'is less than',
      'between': 'is between',
      'blank': 'is blank',
      'not_blank': 'is not blank',
      'is_number': 'is a number',
      'not_number': 'is not a number'
    };
    
    return `${columnName} ${operatorText[rule.condition.operator] || rule.condition.operator} ${rule.condition.value ? `'${rule.condition.value}'` : ''}`;
  };

  const getFormatPreview = (format) => {
    const styles = {
      backgroundColor: format.backgroundColor,
      color: format.textColor,
      fontWeight: format.fontWeight,
      fontStyle: format.fontStyle,
      textDecoration: format.textDecoration,
      padding: '6px 12px',
      borderRadius: '4px',
      fontSize: '13px',
      minWidth: '80px',
      textAlign: 'center',
      border: '1px solid #e1e5e9'
    };

    return (
      <div style={styles}>
        abcde
      </div>
    );
  };

  if (showSetCondition) {
    return (
      <SetConditionModal
        isOpen={showSetCondition}
        onClose={handleCancel}
        onSave={handleSaveRule}
        columns={columns}
        rule={editingRule}
        rowData={rowData}
      />
    );
  }

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
            className="relative bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-5xl w-full max-h-[85vh] overflow-hidden border border-gray-200 dark:border-gray-700"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center space-x-3">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Conditional Formatting
                </h3>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Format cells or rows based on rules.
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Help - Conditional Formatting
                </Button>
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                  <Play className="w-4 h-4 mr-2" />
                  Watch Video (3:32)
                </Button>
                <Button variant="ghost" size="sm" onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Add New Rule Button */}
              <div className="mb-6">
                <Button 
                  variant="secondary" 
                  size="md"
                  onClick={handleAddNewRule}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium px-4 py-2 rounded-md border border-gray-300"
                >
                  Add New Rule
                </Button>
              </div>

              {/* Rules List */}
              <div className="space-y-4 min-h-[300px] max-h-[450px] overflow-y-auto">
                {rules.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <div className="text-lg mb-2">No conditional formatting rules defined.</div>
                    <div className="text-sm">Click "Add New Rule" to create your first rule.</div>
                  </div>
                ) : (
                  rules.map((rule, index) => (
                    <motion.div
                      key={rule.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        {/* Rule Content */}
                        <div className="flex items-center space-x-4 flex-1">
                          {/* Dropdown Toggle */}
                          <Button variant="ghost" size="sm" className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                            <ChevronDown className="w-4 h-4 text-gray-600" />
                          </Button>

                          {/* Rule Description */}
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 text-sm">
                              <span className="text-gray-700 dark:text-gray-300">If</span>
                              <button 
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 underline font-medium"
                                onClick={() => handleEditRule(rule)}
                              >
                                {getConditionText(rule)}
                              </button>
                              <span className="text-gray-700 dark:text-gray-300">then apply</span>
                              <button 
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 underline font-medium"
                                onClick={() => handleEditRule(rule)}
                              >
                                this format
                              </button>
                              <span className="text-gray-700 dark:text-gray-300">to the</span>
                              <button 
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 underline font-medium"
                                onClick={() => handleEditRule(rule)}
                              >
                                {rule.format.applyToEntireRow ? 'entire row' : `${rule.format.applyToColumn} column`}
                              </button>
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
                            onClick={() => handleEditRule(rule)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                            title="Edit Rule"
                          >
                            <Edit className="w-4 h-4 text-gray-600" />
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
                    </motion.div>
                  ))
                )}
              </div>

              {/* Note */}
              <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Note:</strong> Higher rules take priority over lower rules.
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <Button variant="ghost" onClick={onClose} className="px-6 py-2">
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveAll} className="px-6 py-2 bg-blue-600 hover:bg-blue-700">
                OK
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// Set Condition Modal Component
const SetConditionModal = ({ isOpen, onClose, onSave, columns, rule, rowData = {} }) => {
  const [selectedColumn, setSelectedColumn] = useState(rule?.condition?.column || '');
  const [showCriteriaDropdown, setShowCriteriaDropdown] = useState(false);
  const [showFormatModal, setShowFormatModal] = useState(false);
  const [currentFormat, setCurrentFormat] = useState(rule?.format || {
    backgroundColor: '#ffff99',
    textColor: '#000000',
    fontWeight: 'normal',
    fontStyle: 'normal',
    textDecoration: 'none',
    applyToEntireRow: true,
    applyToColumn: ''
  });
  const [customCriteria, setCustomCriteria] = useState({
    operator: rule?.condition?.operator || 'contains',
    value: rule?.condition?.value || ''
  });
  const [distinctValues, setDistinctValues] = useState([]);
  const [selectedValue, setSelectedValue] = useState('');

  // Get distinct values from actual row data
  const getDistinctValues = (columnKey) => {
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
  };

  useEffect(() => {
    if (selectedColumn) {
      setDistinctValues(getDistinctValues(selectedColumn));
    }
  }, [selectedColumn]);

  const handleColumnSelect = (columnKey) => {
    setSelectedColumn(columnKey);
    setShowCriteriaDropdown(true);
  };

  const handleValueSelect = (value) => {
    setSelectedValue(value);
    setCustomCriteria({ operator: 'equals', value });
  };

  const handleCustomCriteria = () => {
    // Keep existing custom criteria
    setShowCriteriaDropdown(false);
  };

  const handleNext = () => {
    if (!selectedColumn) return;
    setShowFormatModal(true);
  };

  const handleFormatSave = (format) => {
    const updatedRule = {
      ...rule,
      condition: {
        column: selectedColumn,
        operator: customCriteria.operator,
        value: selectedValue || customCriteria.value,
        customCriteria: !selectedValue
      },
      format: format
    };
    onSave(updatedRule);
  };

  if (showFormatModal) {
    return (
      <FormatSelectionModal
        isOpen={showFormatModal}
        onClose={() => setShowFormatModal(false)}
        onSave={handleFormatSave}
        columns={columns}
        currentFormat={currentFormat}
      />
    );
  }

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
            className="relative bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-5xl w-full border border-gray-200 dark:border-gray-700"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Set Condition
              </h3>
              <Button variant="ghost" size="sm" onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-8">
              <div className="grid grid-cols-2 gap-12">
                {/* Column Selection */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    1. Select column for condition
                  </h4>
                  <div className="border border-gray-300 dark:border-gray-600 rounded-lg max-h-80 overflow-y-auto bg-white dark:bg-gray-800">
                    {columns.map((column) => (
                      <div
                        key={column.key}
                        className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-600 last:border-b-0 transition-colors ${
                          selectedColumn === column.key ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500' : ''
                        }`}
                        onClick={() => handleColumnSelect(column.key)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{column.label}</span>
                          {selectedColumn === column.key && (
                            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Criteria Selection */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                      2. Select criteria or{' '}
                      <button 
                        className="text-blue-600 hover:text-blue-700 underline font-medium"
                        onClick={handleCustomCriteria}
                      >
                        define custom criteria
                      </button>
                    </h4>
                  </div>
                  
                  {selectedColumn ? (
                    showCriteriaDropdown ? (
                      <div className="space-y-4">
                        {/* Distinct Values List */}
                        <div className="border border-gray-300 dark:border-gray-600 rounded-lg max-h-80 overflow-y-auto bg-white dark:bg-gray-800">
                          <div className="p-3 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                id="select-all"
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <label htmlFor="select-all" className="ml-3 text-sm font-medium text-gray-900 dark:text-white">
                                Select All
                              </label>
                            </div>
                          </div>
                          {distinctValues.map((value, index) => (
                            <div
                              key={index}
                              className={`p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-600 last:border-b-0 ${
                                selectedValue === value ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                              }`}
                              onClick={() => handleValueSelect(value)}
                            >
                              <div className="flex items-center">
                                <input
                                  type="radio"
                                  name="distinct-value"
                                  checked={selectedValue === value}
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

                        {/* Apply Format When Condition NOT Met */}
                        <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <input
                            type="checkbox"
                            id="apply-when-not-met"
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <label htmlFor="apply-when-not-met" className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                            Apply format when condition is NOT met
                          </label>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Custom Criteria Form */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Operator
                          </label>
                          <select
                            value={customCriteria.operator}
                            onChange={(e) => setCustomCriteria(prev => ({ ...prev, operator: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="contains">contains</option>
                            <option value="equals">is equal to</option>
                            <option value="not_equals">is not equal to</option>
                            <option value="greater_than">is greater than</option>
                            <option value="less_than">is less than</option>
                            <option value="between">is between</option>
                            <option value="blank">is blank</option>
                            <option value="not_blank">is not blank</option>
                            <option value="is_number">is a number</option>
                            <option value="not_number">is not a number</option>
                          </select>
                        </div>

                        {/* Value Input */}
                        {!['blank', 'not_blank', 'is_number', 'not_number'].includes(customCriteria.operator) && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Value
                            </label>
                            <input
                              type="text"
                              value={customCriteria.value}
                              onChange={(e) => setCustomCriteria(prev => ({ ...prev, value: e.target.value }))}
                              placeholder="Enter value"
                              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        )}

                        {/* Back to Values List */}
                        <button
                          onClick={() => setShowCriteriaDropdown(true)}
                          className="text-blue-600 hover:text-blue-700 underline text-sm font-medium"
                        >
                          ← Back to select from list
                        </button>
                      </div>
                    )
                  ) : (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                      <div className="text-lg mb-2">Please choose a column to define criteria.</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <Button variant="ghost" onClick={onClose} className="px-6 py-2">
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={handleNext}
                disabled={!selectedColumn || (!selectedValue && !customCriteria.value)}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                OK
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// Format Selection Modal Component  
const FormatSelectionModal = ({ isOpen, onClose, onSave, columns, currentFormat }) => {
  const [format, setFormat] = useState(currentFormat);
  const [showFormatTarget, setShowFormatTarget] = useState(false);

  const colorOptions = [
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
    '#000000', '#333333', '#666666', '#999999', '#CCCCCC', '#FFFFFF',
    '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'
  ];

  const taskBarColors = [
    { name: 'Green', color: '#4CAF50' },
    { name: 'Blue', color: '#2196F3' },
    { name: 'Red', color: '#F44336' },
    { name: 'Orange', color: '#FF9800' },
    { name: 'Purple', color: '#9C27B0' },
    { name: 'Teal', color: '#009688' }
  ];

  const handleSave = () => {
    setShowFormatTarget(true);
  };

  const handleFormatTargetSave = (target) => {
    const finalFormat = { ...format, ...target };
    onSave(finalFormat);
  };

  if (showFormatTarget) {
    return (
      <FormatTargetModal
        isOpen={showFormatTarget}
        onClose={() => setShowFormatTarget(false)}
        onSave={handleFormatTargetSave}
        columns={columns}
        currentTarget={{
          applyToEntireRow: format.applyToEntireRow,
          applyToColumn: format.applyToColumn
        }}
      />
    );
  }

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
            className="relative bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-3xl w-full border border-gray-200 dark:border-gray-700"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Format Selection
              </h3>
              <Button variant="ghost" size="sm" onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-8 space-y-8">
              {/* Format Preview */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
                  Preview:
                </span>
                <div
                  className="px-6 py-3 rounded-md border text-center min-w-[120px] font-medium"
                  style={{
                    backgroundColor: format.backgroundColor,
                    color: format.textColor,
                    fontWeight: format.fontWeight,
                    fontStyle: format.fontStyle,
                    textDecoration: format.textDecoration,
                    border: '1px solid #e1e5e9'
                  }}
                >
                  abcde
                </div>
              </div>

              {/* Font Formatting */}
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Font
                    </label>
                    <select className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500">
                      <option>Auto</option>
                      <option>Arial</option>
                      <option>Helvetica</option>
                      <option>Times New Roman</option>
                      <option>Georgia</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Font Size
                    </label>
                    <select className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500">
                      <option>Auto</option>
                      <option>10</option>
                      <option>12</option>
                      <option>14</option>
                      <option>16</option>
                      <option>18</option>
                      <option>20</option>
                    </select>
                  </div>

                  {/* Font Style Buttons */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Font Style
                    </label>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant={format.fontWeight === 'bold' ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => setFormat(prev => ({ 
                          ...prev, 
                          fontWeight: prev.fontWeight === 'bold' ? 'normal' : 'bold' 
                        }))}
                        className="px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <span className="font-bold">B</span>
                      </Button>
                      <Button
                        variant={format.fontStyle === 'italic' ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => setFormat(prev => ({ 
                          ...prev, 
                          fontStyle: prev.fontStyle === 'italic' ? 'normal' : 'italic' 
                        }))}
                        className="px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <span className="italic">I</span>
                      </Button>
                      <Button
                        variant={format.textDecoration === 'underline' ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => setFormat(prev => ({ 
                          ...prev, 
                          textDecoration: prev.textDecoration === 'underline' ? 'none' : 'underline' 
                        }))}
                        className="px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <span className="underline">U</span>
                      </Button>
                      <Button
                        variant={format.textDecoration === 'line-through' ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => setFormat(prev => ({ 
                          ...prev, 
                          textDecoration: prev.textDecoration === 'line-through' ? 'none' : 'line-through' 
                        }))}
                        className="px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <span className="line-through">S</span>
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Text Color */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Text Color
                    </label>
                    <div className="grid grid-cols-6 gap-2">
                      {textColors.map((color) => (
                        <button
                          key={color}
                          className={`w-8 h-8 rounded border-2 hover:scale-110 transition-transform ${
                            format.textColor === color ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => setFormat(prev => ({ ...prev, textColor: color }))}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Background Color */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Background Color
                    </label>
                    <div className="grid grid-cols-6 gap-2">
                      {colorOptions.map((colorOption) => (
                        <button
                          key={colorOption.name}
                          className={`w-8 h-8 rounded border-2 hover:scale-110 transition-transform ${
                            format.backgroundColor === colorOption.color ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'
                          }`}
                          style={{ backgroundColor: colorOption.color }}
                          onClick={() => setFormat(prev => ({ ...prev, backgroundColor: colorOption.color }))}
                          title={colorOption.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Task Bar Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Task Bar
                </label>
                <div className="flex items-center space-x-3">
                  {taskBarColors.map((color) => (
                    <button
                      key={color.name}
                      className="w-16 h-8 rounded border border-gray-300 hover:scale-105 transition-transform"
                      style={{ backgroundColor: color.color }}
                      title={color.name}
                    />
                  ))}
                  <Button variant="ghost" size="sm" className="border border-gray-300 rounded-md px-3 py-2">
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <Button variant="ghost" onClick={onClose} className="px-6 py-2">
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={handleSave}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700"
              >
                OK
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// Format Target Selection Modal
const FormatTargetModal = ({ isOpen, onClose, onSave, columns, currentTarget }) => {
  const [applyToEntireRow, setApplyToEntireRow] = useState(currentTarget.applyToEntireRow);
  const [selectedColumns, setSelectedColumns] = useState(
    currentTarget.applyToColumn ? currentTarget.applyToColumn.split(',').filter(Boolean) : []
  );

  const handleSave = () => {
    onSave({
      applyToEntireRow,
      applyToColumn: applyToEntireRow ? '' : selectedColumns.join(',')
    });
  };

  const toggleColumn = (columnKey) => {
    setSelectedColumns(prev => 
      prev.includes(columnKey) 
        ? prev.filter(key => key !== columnKey)
        : [...prev, columnKey]
    );
  };

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
            className="relative bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-lg w-full border border-gray-200 dark:border-gray-700"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Select what to format:
              </h3>
              <Button variant="ghost" size="sm" onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="space-y-3">
                {/* Entire Row Option */}
                <div
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    applyToEntireRow 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                  }`}
                  onClick={() => {
                    setApplyToEntireRow(true);
                    setSelectedColumns([]);
                  }}
                >
                  <div className="flex items-center">
                    <div className="w-5 h-5 mr-4 flex items-center justify-center">
                      {applyToEntireRow && (
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      )}
                      <div className={`w-5 h-5 rounded-full border-2 absolute ${
                        applyToEntireRow ? 'border-blue-500' : 'border-gray-400'
                      }`}></div>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white text-lg">entire row</span>
                  </div>
                </div>

                {/* Individual Columns */}
                {columns.map((column) => (
                  <div
                    key={column.key}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      !applyToEntireRow && selectedColumns.includes(column.key) 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                    } ${applyToEntireRow ? 'opacity-50' : ''}`}
                    onClick={() => {
                      if (!applyToEntireRow) {
                        toggleColumn(column.key);
                      } else {
                        setApplyToEntireRow(false);
                        setSelectedColumns([column.key]);
                      }
                    }}
                  >
                    <div className="flex items-center">
                      <div className="w-5 h-5 mr-4 flex items-center justify-center">
                        {!applyToEntireRow && selectedColumns.includes(column.key) && (
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        )}
                        <div className={`w-5 h-5 rounded-full border-2 absolute ${
                          !applyToEntireRow && selectedColumns.includes(column.key) ? 'border-blue-500' : 'border-gray-400'
                        }`}></div>
                      </div>
                      <span className="text-gray-900 dark:text-white text-lg">{column.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <Button variant="ghost" onClick={onClose} className="px-6 py-2">
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={handleSave}
                disabled={!applyToEntireRow && selectedColumns.length === 0}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                OK
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConditionalFormattingModal;
