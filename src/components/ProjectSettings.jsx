import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Settings, HelpCircle } from 'lucide-react';
import Button from './Button';
import ProfessionalDropdown from './ProfessionalDropdown';

const ProjectSettings = ({ 
  isOpen, 
  onClose, 
  projectSettings, 
  onSettingsChange, 
  availableColumns = [] 
}) => {
  const [settings, setSettings] = useState(projectSettings);

  useEffect(() => {
    setSettings(projectSettings);
  }, [projectSettings]);

  const handleSettingsUpdate = (section, key, value) => {
    const newSettings = {
      ...settings,
      [section]: {
        ...settings[section],
        [key]: value
      }
    };
    setSettings(newSettings);
  };

  const handleWorkingDayToggle = (day) => {
    const currentDays = settings.workingDays.workingDays;
    const newDays = currentDays.includes(day) 
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day].sort((a, b) => {
          const order = ['S', 'M', 'T', 'W', 'R', 'F', 'S'];
          return order.indexOf(a) - order.indexOf(b);
        });
    
    handleSettingsUpdate('workingDays', 'workingDays', newDays);
  };

  const handleApply = () => {
    onSettingsChange(settings);
    onClose();
  };

  const dateColumns = availableColumns.filter(col => col.type === 'date');
  const textColumns = availableColumns.filter(col => 
    (col.type === 'text' && col.key !== 'taskId') || 
    col.type === 'predecessors' || 
    col.type === 'duration'
  );

  const fiscalYearOptions = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ].map(month => ({ value: month, label: month }));

  const weekStartOptions = [
    { value: 'Sunday', label: 'Sunday' },
    { value: 'Monday', label: 'Monday' }
  ];

  const workingDaysMap = {
    'Su': 'Sunday',
    'M': 'Monday', 
    'T': 'Tuesday',
    'W': 'Wednesday',
    'R': 'Thursday',
    'F': 'Friday',
    'Sa': 'Saturday'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={onClose}
          />
          
          {/* Settings Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="relative ml-auto w-96 bg-white dark:bg-gray-800 shadow-2xl overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Settings</h2>
                </div>
                <Button variant="ghost" size="sm" onClick={onClose} className="p-1">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-6">
              {/* Date Range Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <h3 className="font-medium text-gray-900 dark:text-white">Date range</h3>
                  </div>
                  <motion.div 
                    whileHover={{ rotate: 15 }}
                    className="cursor-pointer"
                  >
                    <HelpCircle className="w-4 h-4 text-gray-400" />
                  </motion.div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Start date
                    </label>
                    <ProfessionalDropdown
                      options={dateColumns.map(col => ({ value: col.key, label: col.label }))}
                      value={settings.dateRange.startDateColumn}
                      onChange={(value) => handleSettingsUpdate('dateRange', 'startDateColumn', value)}
                      placeholder="Select start date column"
                      size="sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      End date
                    </label>
                    <ProfessionalDropdown
                      options={dateColumns.map(col => ({ value: col.key, label: col.label }))}
                      value={settings.dateRange.endDateColumn}
                      onChange={(value) => handleSettingsUpdate('dateRange', 'endDateColumn', value)}
                      placeholder="Select end date column"
                      size="sm"
                    />
                  </div>
                </div>
              </div>

              {/* Dependencies Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 flex items-center justify-center">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    </div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Dependencies</h3>
                    <motion.div 
                      whileHover={{ rotate: 15 }}
                      className="cursor-pointer"
                    >
                      <HelpCircle className="w-4 h-4 text-gray-400" />
                    </motion.div>
                  </div>
                  
                  {/* Toggle Switch */}
                  <div className="flex items-center">
                    <button
                      onClick={() => handleSettingsUpdate('dependencies', 'enabled', !settings.dependencies.enabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        settings.dependencies.enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                      }`}
                    >
                      <motion.span
                        layout
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.dependencies.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {settings.dependencies.enabled && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3"
                    style={{ overflow: 'visible' }}
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Predecessors
                      </label>
                      <div style={{ position: 'relative', zIndex: 100 }}>
                        <ProfessionalDropdown
                          options={textColumns.map(col => ({ value: col.key, label: col.label }))}
                          value={settings.dependencies.predecessorsColumn}
                          onChange={(value) => handleSettingsUpdate('dependencies', 'predecessorsColumn', value)}
                          placeholder="Select predecessors column"
                          size="sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Duration
                      </label>
                      <div style={{ position: 'relative', zIndex: 99 }}>
                        <ProfessionalDropdown
                          options={textColumns.map(col => ({ value: col.key, label: col.label }))}
                          value={settings.dependencies.durationColumn}
                          onChange={(value) => handleSettingsUpdate('dependencies', 'durationColumn', value)}
                          placeholder="Select duration column"
                          size="sm"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Years, weeks and working days Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900 dark:text-white">Years, weeks and working days</h3>
                  <motion.div 
                    whileHover={{ rotate: 15 }}
                    className="cursor-pointer"
                  >
                    <HelpCircle className="w-4 h-4 text-gray-400" />
                  </motion.div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Start fiscal year in
                    </label>
                    <ProfessionalDropdown
                      options={fiscalYearOptions}
                      value={settings.workingDays.fiscalYearStart}
                      onChange={(value) => handleSettingsUpdate('workingDays', 'fiscalYearStart', value)}
                      size="sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Start week on
                    </label>
                    <ProfessionalDropdown
                      options={weekStartOptions}
                      value={settings.workingDays.weekStart}
                      onChange={(value) => handleSettingsUpdate('workingDays', 'weekStart', value)}
                      size="sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Working days
                    </label>
                    <div className="flex space-x-1">
                      {Object.entries(workingDaysMap).map(([key, label]) => (
                        <button
                          key={key}
                          onClick={() => handleWorkingDayToggle(key)}
                          className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                            settings.workingDays.workingDays.includes(key)
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                          }`}
                          title={label}
                        >
                          {key}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Length of day (hours)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="24"
                      value={settings.workingDays.dayLength}
                      onChange={(e) => handleSettingsUpdate('workingDays', 'dayLength', parseInt(e.target.value))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
              <Button
                variant="primary"
                onClick={handleApply}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Apply
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ProjectSettings;
