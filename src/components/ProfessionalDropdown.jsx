import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, Check } from 'lucide-react';

const ProfessionalDropdown = ({ 
  options = [], 
  value, 
  onChange, 
  placeholder = 'Select...', 
  className = '',
  showSearch = false,
  showAvatar = false,
  showColors = false,
  colorMap = {},
  size = 'md',
  disabled = false,
  autoFocus = false,
  onBlur,
  maxHeight = '200px'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const buttonRef = useRef(null);

  // Filter options based on search term
  const filteredOptions = options.filter(option => {
    if (!searchTerm) return true;
    const searchValue = typeof option === 'string' ? option : (option.label || option.name || '');
    return searchValue.toLowerCase().includes(searchTerm.toLowerCase());
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
        if (onBlur) onBlur();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onBlur]);

  useEffect(() => {
    if (autoFocus && buttonRef.current) {
      buttonRef.current.focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    if (isOpen && showSearch && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, showSearch]);

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    setSearchTerm('');
  };

  const handleSelect = (option) => {
    const selectedValue = typeof option === 'string' ? option : option.value;
    onChange(selectedValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  const getDisplayValue = () => {
    if (!value) return placeholder;
    
    const selectedOption = options.find(opt => 
      typeof opt === 'string' ? opt === value : opt.value === value
    );
    
    if (typeof selectedOption === 'string') return selectedOption;
    return selectedOption?.label || selectedOption?.name || value;
  };

  const getSelectedOption = () => {
    return options.find(opt => 
      typeof opt === 'string' ? opt === value : opt.value === value
    );
  };

  const selectedOption = getSelectedOption();

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base'
  };

  const getAvatar = (option) => {
    if (typeof option === 'string') {
      return (
        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
          {option.charAt(0).toUpperCase()}
        </div>
      );
    }
    
    if (option.avatar) {
      return (
        <img 
          src={option.avatar} 
          alt={option.name || option.label} 
          className="w-6 h-6 rounded-full object-cover"
        />
      );
    }
    
    const initials = (option.name || option.label || '').split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2);
    const colors = [
      'from-blue-500 to-blue-600',
      'from-green-500 to-green-600', 
      'from-purple-500 to-purple-600',
      'from-pink-500 to-pink-600',
      'from-indigo-500 to-indigo-600',
      'from-red-500 to-red-600'
    ];
    const colorIndex = (option.name || option.label || '').length % colors.length;
    
    return (
      <div className={`w-6 h-6 bg-gradient-to-br ${colors[colorIndex]} rounded-full flex items-center justify-center text-white text-xs font-medium`}>
        {initials}
      </div>
    );
  };

  const getColorIndicator = (option, index) => {
    if (!showColors) return null;
    
    const optionValue = typeof option === 'string' ? option : option.value;
    const colorClass = colorMap[index] || colorMap[optionValue] || 'bg-transparent border-2 border-gray-400';
    const isTransparent = colorClass.includes('bg-transparent');
    
    return (
      <div className={`w-4 h-4 rounded-full flex-shrink-0 relative ${
        isTransparent ? 'bg-transparent border-2 border-gray-400' : colorClass
      }`}>
        {isTransparent && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-0.5 bg-red-500 rotate-45"></div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`
          w-full text-left bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 
          rounded-lg shadow-sm transition-all duration-200 
          ${sizes[size]}
          ${disabled 
            ? 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-700' 
            : 'hover:border-blue-400 dark:hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          }
          ${isOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''}
        `}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            {showColors && selectedOption && (
              <div className="flex-shrink-0">
                {getColorIndicator(selectedOption, options.findIndex(opt => 
                  typeof opt === 'string' ? opt === value : opt.value === value
                ))}
              </div>
            )}
            {showAvatar && selectedOption && (
              <div className="flex-shrink-0">
                {getAvatar(selectedOption)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className={`truncate ${value ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                {showAvatar && selectedOption && typeof selectedOption !== 'string' ? (
                  <div>
                    <div className="font-medium">{selectedOption.name || selectedOption.label}</div>
                    {selectedOption.email && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {selectedOption.email}
                      </div>
                    )}
                  </div>
                ) : (
                  getDisplayValue()
                )}
              </div>
            </div>
          </div>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ml-2 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl overflow-hidden"
            style={{ minWidth: '100%' }}
          >
            {showSearch && (
              <div className="p-2 border-b border-gray-200 dark:border-gray-600">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search..."
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}
            
            <div className="max-h-60 overflow-y-auto" style={{ maxHeight }}>
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                  {searchTerm ? 'No results found' : 'No options available'}
                </div>
              ) : (
                filteredOptions.map((option, index) => {
                  const optionValue = typeof option === 'string' ? option : option.value;
                  const isSelected = optionValue === value;
                  
                  return (
                    <motion.button
                      key={optionValue || index}
                      type="button"
                      onClick={() => handleSelect(option)}
                      whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                      whileTap={{ scale: 0.98 }}
                      className={`
                        w-full px-3 py-2 text-left text-sm transition-colors duration-150
                        ${isSelected 
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                          : 'text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                        }
                        ${index === 0 ? 'rounded-t-lg' : ''}
                        ${index === filteredOptions.length - 1 ? 'rounded-b-lg' : ''}
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          {showColors && (
                            <div className="flex-shrink-0">
                              {getColorIndicator(option, index)}
                            </div>
                          )}
                          {showAvatar && (
                            <div className="flex-shrink-0">
                              {getAvatar(option)}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            {typeof option === 'string' ? (
                              <div className="truncate">{option}</div>
                            ) : (
                              <div>
                                <div className="font-medium truncate">{option.name || option.label}</div>
                                {option.email && (
                                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    {option.email}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        {isSelected && (
                          <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                        )}
                      </div>
                    </motion.button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfessionalDropdown;
