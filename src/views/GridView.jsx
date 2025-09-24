import { useState, useRef, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { ChevronDown, Filter, Search, Plus, MoreHorizontal, Star, Copy, Trash2, Edit, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Settings, Download, Share2, Scissors, Clipboard, FileText, RotateCcw, Undo2, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify, DollarSign, Percent, Hash, Quote, Lock, HelpCircle, Cloud, Minus, MessageCircle, Paperclip, Eye, EyeOff, GripVertical, Palette, Indent, Outdent, Calendar, Link, CornerDownRight, CornerUpLeft, MoreVertical, MoreVerticalIcon, Grid3X3 } from 'lucide-react';
import DatePicker from 'react-date-picker';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import ProfessionalDropdown from '../components/ProfessionalDropdown';
import ConditionalFormattingModal from '../components/ConditionalFormattingModal';
import { getCellFormatting, formatToCSSStyles } from '../utils/conditionalFormatting';


const GridView = () => {
  // Custom styles for react-date-picker
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .custom-date-picker {
        width: 100% !important;
      }
      .custom-date-picker .react-date-picker__wrapper {
        border: 1px solid #d1d5db !important;
        border-radius: 6px !important;
        padding: 4px 8px !important;
        background: white !important;
        font-size: 14px !important;
        transition: all 0.2s ease !important;
      }
      .custom-date-picker .react-date-picker__wrapper:focus-within {
        border-color: #3b82f6 !important;
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2) !important;
      }
      .custom-date-picker .react-date-picker__inputGroup {
        font-size: 14px !important;
      }
      .custom-date-picker .react-date-picker__inputGroup__input {
        border: none !important;
        outline: none !important;
        font-size: 14px !important;
        color: #374151 !important;
      }
      .custom-date-picker .react-date-picker__button {
        border: none !important;
        background: transparent !important;
        padding: 2px !important;
      }
      .custom-calendar.react-calendar {
        border: 1px solid #e5e7eb !important;
        border-radius: 8px !important;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
        font-family: Inter, system-ui, sans-serif !important;
        background: white !important;
        padding: 12px !important;
        z-index: 9999 !important;
        position: relative !important;
      }
      .react-date-picker__calendar {
        z-index: 9999 !important;
      }
      .react-date-picker__calendar--open {
        z-index: 9999 !important;
      }
      .custom-calendar .react-calendar__navigation {
        margin-bottom: 12px !important;
      }
      .custom-calendar .react-calendar__navigation button {
        background: transparent !important;
        border: none !important;
        color: #374151 !important;
        font-size: 14px !important;
        font-weight: 500 !important;
        padding: 8px !important;
        border-radius: 6px !important;
        transition: all 0.2s ease !important;
      }
      .custom-calendar .react-calendar__navigation button:hover {
        background: #f3f4f6 !important;
        color: #111827 !important;
      }
      .custom-calendar .react-calendar__month-view__weekdays {
        font-size: 12px !important;
        font-weight: 500 !important;
        color: #6b7280 !important;
        text-transform: uppercase !important;
        letter-spacing: 0.05em !important;
      }
      .custom-calendar .react-calendar__tile {
        background: transparent !important;
        border: none !important;
        color: #374151 !important;
        font-size: 14px !important;
        padding: 8px !important;
        border-radius: 6px !important;
        transition: all 0.2s ease !important;
        margin: 1px !important;
      }
      .custom-calendar .react-calendar__tile:hover {
        background: #f3f4f6 !important;
        color: #111827 !important;
      }
      .custom-calendar .react-calendar__tile--active {
        background: #3b82f6 !important;
        color: white !important;
      }
      .custom-calendar .react-calendar__tile--now {
        background: #dbeafe !important;
        color: #1d4ed8 !important;
        font-weight: 500 !important;
      }
      .custom-calendar .react-calendar__tile--neighboringMonth {
        color: #9ca3af !important;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
  const [rowData, setRowData] = useState({
    1: { taskId: '1', taskName: 'Project Kickoff', dependencies: 'None', assignedTo: 'emily-davis', condition: 'green', startDate: '2024-09-03', endDate: '2024-09-05', status: 'Pending' },
    2: { taskId: '2', taskName: 'Design Phase', dependencies: '1', assignedTo: 'john-doe', condition: 'red', startDate: '2024-09-10', endDate: '2024-09-20', status: 'In Progress' },
    3: { taskId: '3', taskName: 'Development', dependencies: '2', assignedTo: 'mike-johnson', condition: 'yellow', startDate: '2024-09-17', endDate: '2024-10-10', status: 'In Progress' },
    4: { taskId: '4', taskName: 'Testing Phase', dependencies: '3', assignedTo: 'chris-lee', condition: 'yellow', startDate: '2024-10-01', endDate: '2024-10-15', status: 'Pending' },
    5: { taskId: '5', taskName: 'Deployment', dependencies: '4', assignedTo: 'chris-lee', condition: 'red', startDate: '2024-10-15', endDate: '2024-10-25', status: 'Completed' },
  });

  const [editingCell, setEditingCell] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [hoveredCell, setHoveredCell] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedCell, setSelectedCell] = useState(null);
  const [contextMenu, setContextMenu] = useState({ isOpen: false, position: { x: 0, y: 0 }, rowId: null });
  const [contextMenuRowId, setContextMenuRowId] = useState(null);
  const [contextMenuType, setContextMenuType] = useState('row'); // 'row' or 'cell'
  const [contextMenuColumnKey, setContextMenuColumnKey] = useState(null);
  const [columnContextMenu, setColumnContextMenu] = useState({ isOpen: false, position: { x: 0, y: 0 }, columnKey: null });
  const [fontSize, setFontSize] = useState('16');
  const [fontFamily, setFontFamily] = useState('Arial');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [textColor, setTextColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('transparent');
  const [textAlign, setTextAlign] = useState('left');
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showBackgroundColorPicker, setShowBackgroundColorPicker] = useState(false);
  const [showAddColumnModal, setShowAddColumnModal] = useState(false);
  const [addColumnPosition, setAddColumnPosition] = useState({ x: 0, y: 0 });
  const [columnPopupMode, setColumnPopupMode] = useState('add'); // 'add', 'edit'
  const [editingColumnData, setEditingColumnData] = useState(null);
  const [columnName, setColumnName] = useState('');
  const [columnDescription, setColumnDescription] = useState('');
  const [tempDropdownOptions, setTempDropdownOptions] = useState([]);
  const [newDropdownValue, setNewDropdownValue] = useState('');
  const [newColumnType, setNewColumnType] = useState('text');
  const [showColumnFilter, setShowColumnFilter] = useState(false);
  const [filterPosition, setFilterPosition] = useState({ x: 0, y: 0 });
  const [showConditionalFormatting, setShowConditionalFormatting] = useState(false);
  const [conditionalFormattingRules, setConditionalFormattingRules] = useState([]);
  const [filterColumnKey, setFilterColumnKey] = useState(null);
  const [showSortSubmenu, setShowSortSubmenu] = useState(false);
  const [sortSubmenuPosition, setSortSubmenuPosition] = useState({ x: 0, y: 0 });
  const [draggedColumnIndex, setDraggedColumnIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [draggedColumn, setDraggedColumn] = useState(null);
  const [hiddenColumns, setHiddenColumns] = useState([]);
  const [cellStyles, setCellStyles] = useState({});
  const [rowIndents, setRowIndents] = useState({});
  const [showFormatTools, setShowFormatTools] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [columnWidths, setColumnWidths] = useState({});
  const [resizing, setResizing] = useState({ column: null, startX: 0, startWidth: 0 });
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [frozenColumns, setFrozenColumns] = useState([]);
  const [showColumnPropertiesModal, setShowColumnPropertiesModal] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [editingColumnKey, setEditingColumnKey] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartCell, setDragStartCell] = useState(null);
  const [dragEndCell, setDragEndCell] = useState(null);
  const [isFillDragging, setIsFillDragging] = useState(false);
  const [copiedData, setCopiedData] = useState(null);
  const [copiedRow, setCopiedRow] = useState(null);
  const [selectedRange, setSelectedRange] = useState(null);
  const [collapsedRows, setCollapsedRows] = useState(new Set());
  const [parentChildMap, setParentChildMap] = useState({});
  const [dropdownOptions, setDropdownOptions] = useState({
    status: ['Pending', 'In Progress', 'Completed'],
    assignedTo: [
      { value: 'musawir-khan', label: 'Musawir Khan', name: 'Musawir Khan', email: 'musawir.khan@yourcompany.com' },
      { value: 'john-doe', label: 'John Doe', name: 'John Doe', email: 'john.doe@yourcompany.com' },
      { value: 'mike-johnson', label: 'Mike Johnson', name: 'Mike Johnson', email: 'mike.johnson@yourcompany.com' },
      { value: 'chris-lee', label: 'Chris Lee', name: 'Chris Lee', email: 'chris.lee@yourcompany.com' },
      { value: 'emily-davis', label: 'Emily Davis', name: 'Emily Davis', email: 'emily.davis@yourcompany.com' },
      { value: 'sarah-wilson', label: 'Sarah Wilson', name: 'Sarah Wilson', email: 'sarah.wilson@yourcompany.com' }
    ]
  });

  // Toast notification state
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });

  // Helper function to show toast notifications
  const showToast = (message, type = 'success', duration = 3000) => {
    setToast({ isVisible: true, message, type });
    if (duration > 0) {
      setTimeout(() => {
        setToast(prev => ({ ...prev, isVisible: false }));
      }, duration);
    }
  };

  const [dropdownColors, setDropdownColors] = useState({
    status: {
      0: 'bg-yellow-500', // Pending - yellow
      1: 'bg-blue-500',   // In Progress - blue
      2: 'bg-green-500'   // Completed - green
    },
    assignedTo: {
      0: 'bg-transparent border-2 border-gray-400', // Musawir Khan - transparent by default
      1: 'bg-transparent border-2 border-gray-400', // John Doe - transparent by default
      2: 'bg-transparent border-2 border-gray-400', // Mike Johnson - transparent by default
      3: 'bg-transparent border-2 border-gray-400', // Chris Lee - transparent by default
      4: 'bg-transparent border-2 border-gray-400', // Emily Davis - transparent by default
      5: 'bg-transparent border-2 border-gray-400'  // Sarah Wilson - transparent by default
    }
  });

  const [rowHeights, setRowHeights] = useState({});
  const [headerHeight, setHeaderHeight] = useState(48);
  const dataRowRefs = useRef({});
  const numberRowRefs = useRef({});
  const dataHeaderRef = useRef(null);
  const numberHeaderRef = useRef(null);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    });
  };

  // eslint-disable-next-line no-unused-vars
  const convertToDateInput = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  };

  const getHexColor = (bgClass) => {
    const colorMap = {
      'bg-black': '#000000',
      'bg-white': '#ffffff',
      'bg-gray-500': '#6b7280',
      'bg-red-500': '#ef4444',
      'bg-orange-500': '#f97316',
      'bg-yellow-500': '#eab308',
      'bg-lime-500': '#84cc16',
      'bg-green-500': '#22c55e',
      'bg-emerald-500': '#10b981',
      'bg-teal-500': '#14b8a6',
      'bg-cyan-500': '#06b6d4',
      'bg-sky-500': '#0ea5e9',
      'bg-blue-500': '#3b82f6',
      'bg-indigo-500': '#6366f1',
      'bg-violet-500': '#8b5cf6',
      'bg-purple-500': '#a855f7',
      'bg-fuchsia-500': '#d946ef',
      'bg-pink-500': '#ec4899',
      'bg-rose-500': '#f43f5e',
      'bg-slate-500': '#64748b',
      'bg-zinc-500': '#71717a'
    };
    return colorMap[bgClass] || '#000000';
  };

  const colorOptions = [
    { color: 'bg-transparent border-2 border-gray-400', name: 'No Color', isTransparent: true },
    { color: 'bg-black', name: 'Black' },
    { color: 'bg-white', name: 'Pure White' },
    { color: 'bg-gray-500', name: 'Gray' },
    { color: 'bg-red-500', name: 'Red' },
    { color: 'bg-orange-500', name: 'Orange' },
    { color: 'bg-yellow-500', name: 'Yellow' },
    { color: 'bg-lime-500', name: 'Lime' },
    { color: 'bg-green-500', name: 'Green' },
    { color: 'bg-emerald-500', name: 'Emerald' },
    { color: 'bg-teal-500', name: 'Teal' },
    { color: 'bg-cyan-500', name: 'Cyan' },
    { color: 'bg-sky-500', name: 'Sky' },
    { color: 'bg-blue-500', name: 'Blue' },
    { color: 'bg-indigo-500', name: 'Indigo' },
    { color: 'bg-violet-500', name: 'Violet' },
    { color: 'bg-purple-500', name: 'Purple' },
    { color: 'bg-fuchsia-500', name: 'Fuchsia' },
    { color: 'bg-pink-500', name: 'Pink' },
    { color: 'bg-rose-500', name: 'Rose' },
    { color: 'bg-slate-500', name: 'Slate' },
    { color: 'bg-zinc-500', name: 'Zinc' }
  ];

  const columnTypeCategories = {
    basic: [
      { value: 'text', label: 'Text/Number', icon: '📝' },
      { value: 'dropdown', label: 'Dropdown list', icon: '☰' },
      { value: 'date', label: 'Date', icon: '📅' },
      { value: 'contact', label: 'Contact List', icon: '👤' },
      { value: 'checkbox', label: 'Checkbox', icon: '☐' },
      { value: 'symbols', label: 'Symbols', icon: '🔣' },
      { value: 'autonumber', label: 'Autonumber', icon: '#' },
      { value: 'createdby', label: 'Created By', icon: '👤' },
      { value: 'createddate', label: 'Created Date', icon: '📅' },
      { value: 'comment', label: 'Latest Comment', icon: '💬' },
      { value: 'modifiedby', label: 'Modified By', icon: '👤' },
      { value: 'modifieddate', label: 'Modified Date', icon: '📅' },
      { value: 'status', label: 'Status', icon: '🔄' }
    ]
  };

  const renameColumn = (columnKey, newLabel) => {
    setAllColumns(prev => prev.map(col => 
      col.key === columnKey ? { ...col, label: newLabel } : col
    ));
  };

  const changeColumnType = (columnKey, newType) => {
    setAllColumns(prev => prev.map(col => 
      col.key === columnKey ? { ...col, type: newType } : col
    ));
    
    // Initialize status column colors if changing to status type
    if (newType === 'status') {
      setDropdownOptions(prev => ({ ...prev, [columnKey]: ['Pending', 'In Progress', 'Completed'] }));
      setDropdownColors(prev => ({
        ...prev,
        [columnKey]: {
          0: 'bg-yellow-500', // Pending
          1: 'bg-blue-500',   // In Progress
          2: 'bg-green-500'   // Completed
        }
      }));
    }
    
    // Clear data when column type changes
    setRowData(prev => {
      const newData = { ...prev };
      Object.keys(newData).forEach(rowNum => {
        if (newData[rowNum]) {
          newData[rowNum] = { ...newData[rowNum], [columnKey]: '' };
        }
      });
      return newData;
    });
  };

  const addDropdownOption = (columnKey, option) => {
    const newIndex = (dropdownOptions[columnKey] || []).length;
    setDropdownOptions(prev => ({
      ...prev,
      [columnKey]: [...(prev[columnKey] || []), option]
    }));
    setDropdownColors(prev => ({
      ...prev,
      [columnKey]: {
        ...prev[columnKey],
        [newIndex]: 'bg-transparent border-2 border-gray-400' // Default to transparent with border
      }
    }));
  };

  const removeDropdownOption = (columnKey, index) => {
    setDropdownOptions(prev => ({
      ...prev,
      [columnKey]: prev[columnKey]?.filter((_, i) => i !== index) || []
    }));
  };

  const saveToHistory = (action) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({
      ...action,
      timestamp: Date.now(),
      rowData: JSON.parse(JSON.stringify(rowData)),
      cellStyles: JSON.parse(JSON.stringify(cellStyles)),
      columnWidths: JSON.parse(JSON.stringify(columnWidths)),
      rowIndents: JSON.parse(JSON.stringify(rowIndents))
    });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setRowData(prevState.rowData);
      setCellStyles(prevState.cellStyles);
      setColumnWidths(prevState.columnWidths);
      setRowIndents(prevState.rowIndents);
      setHistoryIndex(historyIndex - 1);
      if (selectedCell) updateEditorState(selectedCell);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setRowData(nextState.rowData);
      setCellStyles(nextState.cellStyles);
      setColumnWidths(nextState.columnWidths);
      setRowIndents(nextState.rowIndents);
      setHistoryIndex(historyIndex + 1);
      if (selectedCell) updateEditorState(selectedCell);
    }
  };

  const [allColumns, setAllColumns] = useState([
    { key: 'taskId', label: 'Task ID', width: '80px', type: 'text' },
    { key: 'taskName', label: 'Task Name', width: '200px', type: 'text' },
    { key: 'dependencies', label: 'Dependencies', width: '120px', type: 'text' },
    { key: 'assignedTo', label: 'Assigned To', width: '150px', type: 'contact' },
    { key: 'condition', label: 'Condition', width: '100px', type: 'condition' },
    { key: 'startDate', label: 'Start Date', width: '120px', type: 'date' },
    { key: 'endDate', label: 'End Date', width: '120px', type: 'date' },
    { key: 'status', label: 'Status', width: '120px', type: 'status' },
  ]);

  const [columnOrder, setColumnOrder] = useState(allColumns.map(col => col.key));
  const [nextColumnId, setNextColumnId] = useState(allColumns.length + 1);

  const [totalRows, setTotalRows] = useState(20); // Total rows including empty ones

  const addNewRow = () => {
    setTotalRows(prev => prev + 1);
  };

  // Insert a new row above the specified row number
  const insertRowAbove = (targetRowNumber) => {
    console.log('Inserting row above:', targetRowNumber);

    if (targetRowNumber < 1) return;

    const newRowData = {};
    const newCellStyles = {};
    const newRowIndents = {};
    const newRowHeights = {};

    // Shift all rows down from targetRowNumber onwards
    for (let rowNum = totalRows; rowNum >= targetRowNumber; rowNum--) {
      const newRowNum = rowNum + 1;

      // Shift row data
      if (rowData[rowNum]) {
        newRowData[newRowNum] = { ...rowData[rowNum] };
      }

      // Shift cell styles
      Object.keys(cellStyles).forEach(cellKey => {
        if (cellKey.startsWith(`${rowNum}-`)) {
          const newCellKey = cellKey.replace(`${rowNum}-`, `${newRowNum}-`);
          newCellStyles[newCellKey] = cellStyles[cellKey];
        }
      });

      // Shift row indents
      if (rowIndents[rowNum] !== undefined) {
        newRowIndents[newRowNum] = rowIndents[rowNum];
      }

      // Shift row heights
      if (rowHeights[rowNum] !== undefined) {
        newRowHeights[newRowNum] = rowHeights[rowNum];
      }
    }

    // Insert empty row at target position
    newRowData[targetRowNumber] = {};

    // Update state
    setRowData(prev => ({ ...prev, ...newRowData }));
    setCellStyles(prev => {
      const updated = { ...prev };
      Object.keys(newCellStyles).forEach(key => {
        delete updated[key.replace(`${targetRowNumber}-`, `${targetRowNumber + 1}-`)];
        updated[key] = newCellStyles[key];
      });
      return updated;
    });
    setRowIndents(prev => ({ ...prev, ...newRowIndents }));
    setRowHeights(prev => ({ ...prev, ...newRowHeights }));
    setTotalRows(prev => prev + 1);

    // Update parent-child relationships
    const newParentChildMap = {};
    Object.entries(parentChildMap).forEach(([childRow, parentRow]) => {
      const childRowNum = parseInt(childRow);
      const parentRowNum = parseInt(parentRow);

      if (childRowNum >= targetRowNumber) {
        newParentChildMap[childRowNum + 1] = parentRowNum >= targetRowNumber ? parentRowNum + 1 : parentRowNum;
      } else {
        newParentChildMap[childRowNum] = parentRowNum >= targetRowNumber ? parentRowNum + 1 : parentRowNum;
      }
    });
    setParentChildMap(newParentChildMap);

    // Update selected cell if it was affected
    if (selectedCell) {
      const [selectedRowNum, colKey] = selectedCell.split('-');
      const selectedRow = parseInt(selectedRowNum);
      if (selectedRow >= targetRowNumber) {
        setSelectedCell(`${selectedRow + 1}-${colKey}`);
      }
    }

    console.log('Row inserted above successfully');
    showToast(`Row inserted above row ${targetRowNumber}`, 'success');
  };

  // Insert a new row below the specified row number
  const insertRowBelow = (targetRowNumber) => {
    console.log('Inserting row below:', targetRowNumber);

    const insertPosition = targetRowNumber + 1;
    insertRowAbove(insertPosition);
  };

  // Delete the specified row
  const deleteRow = (targetRowNumber) => {
    console.log('Deleting row:', targetRowNumber);

    if (targetRowNumber < 1 || targetRowNumber > totalRows) return;

    const newRowData = { ...rowData };
    const newCellStyles = { ...cellStyles };
    const newRowIndents = { ...rowIndents };
    const newRowHeights = { ...rowHeights };

    // Remove the target row
    delete newRowData[targetRowNumber];
    delete newRowIndents[targetRowNumber];
    delete newRowHeights[targetRowNumber];

    // Remove cell styles for the target row
    Object.keys(newCellStyles).forEach(cellKey => {
      if (cellKey.startsWith(`${targetRowNumber}-`)) {
        delete newCellStyles[cellKey];
      }
    });

    // Shift all subsequent rows up
    for (let rowNum = targetRowNumber + 1; rowNum <= totalRows; rowNum++) {
      const newRowNum = rowNum - 1;

      // Shift row data
      if (newRowData[rowNum]) {
        newRowData[newRowNum] = { ...newRowData[rowNum] };
        delete newRowData[rowNum];
      }

      // Shift cell styles
      Object.keys(newCellStyles).forEach(cellKey => {
        if (cellKey.startsWith(`${rowNum}-`)) {
          const newCellKey = cellKey.replace(`${rowNum}-`, `${newRowNum}-`);
          newCellStyles[newCellKey] = newCellStyles[cellKey];
          delete newCellStyles[cellKey];
        }
      });

      // Shift row indents
      if (newRowIndents[rowNum] !== undefined) {
        newRowIndents[newRowNum] = newRowIndents[rowNum];
        delete newRowIndents[rowNum];
      }

      // Shift row heights
      if (newRowHeights[rowNum] !== undefined) {
        newRowHeights[newRowNum] = newRowHeights[rowNum];
        delete newRowHeights[rowNum];
      }
    }

    // Update state
    setRowData(newRowData);
    setCellStyles(newCellStyles);
    setRowIndents(newRowIndents);
    setRowHeights(newRowHeights);
    setTotalRows(prev => prev - 1);

    // Update parent-child relationships
    const newParentChildMap = {};
    Object.entries(parentChildMap).forEach(([childRow, parentRow]) => {
      const childRowNum = parseInt(childRow);
      const parentRowNum = parseInt(parentRow);

      if (childRowNum > targetRowNumber) {
        // Child row is after deleted row, shift it up
        const newChildRow = childRowNum - 1;
        const newParentRow = parentRowNum > targetRowNumber ? parentRowNum - 1 : parentRowNum;
        if (newParentRow !== targetRowNumber) { // Don't create self-references
          newParentChildMap[newChildRow] = newParentRow;
        }
      } else if (childRowNum < targetRowNumber) {
        // Child row is before deleted row
        const newParentRow = parentRowNum > targetRowNumber ? parentRowNum - 1 : parentRowNum;
        if (newParentRow !== targetRowNumber) { // Don't create self-references
          newParentChildMap[childRowNum] = newParentRow;
        }
      }
      // If childRowNum === targetRowNumber, it's the deleted row, skip it
    });
    setParentChildMap(newParentChildMap);

    // Update selected cell if it was affected
    if (selectedCell) {
      const [selectedRowNum, colKey] = selectedCell.split('-');
      const selectedRow = parseInt(selectedRowNum);
      if (selectedRow === targetRowNumber) {
        // Selected cell was in deleted row, clear selection
        setSelectedCell(null);
      } else if (selectedRow > targetRowNumber) {
        // Selected cell was after deleted row, shift it up
        setSelectedCell(`${selectedRow - 1}-${colKey}`);
      }
    }

    // Update selected rows
    setSelectedRows(prev => prev.filter(rowId => rowId !== targetRowNumber).map(rowId => rowId > targetRowNumber ? rowId - 1 : rowId));

    console.log('Row deleted successfully');
    showToast(`Row ${targetRowNumber} deleted`, 'success');
  };

  // eslint-disable-next-line no-unused-vars
  const addNewColumn = () => {
    const newColumn = {
      key: `column${nextColumnId}`,
      label: `Column ${nextColumnId}`,
      width: '150px',
      type: newColumnType
    };
    
    setAllColumns(prev => [...prev, newColumn]);
    setColumnOrder(prev => [...prev, newColumn.key]);
    setNextColumnId(prev => prev + 1);
    setShowAddColumnModal(false);
    setNewColumnType('text');
  };

  const visibleColumns = columnOrder
    .map(key => allColumns.find(col => col.key === key))
    .filter(col => col && !hiddenColumns.includes(col.key));

  const getColumnWidth = (columnKey) => {
    return columnWidths[columnKey] || parseInt(allColumns.find(col => col.key === columnKey)?.width) || 150;
  };

  const handleResizeStart = (e, columnKey) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startWidth = getColumnWidth(columnKey);
    setResizing({ column: columnKey, startX, startWidth });
  };

  const handleResizeMove = (e) => {
    if (!resizing.column) return;
    e.preventDefault();
    const deltaX = e.clientX - resizing.startX;
    const newWidth = Math.max(80, resizing.startWidth + deltaX);
    setColumnWidths(prev => ({ ...prev, [resizing.column]: newWidth }));
  };

  const handleResizeComplete = (columnKey, newWidth) => {
    saveToHistory({ type: 'column_resize', column: columnKey, oldWidth: getColumnWidth(columnKey), newWidth });
  };

  const handleResizeEnd = () => {
    if (resizing.column) {
      handleResizeComplete(resizing.column, getColumnWidth(resizing.column));
    }
    setResizing({ column: null, startX: 0, startWidth: 0 });
  };

  useEffect(() => {
    if (resizing.column) {
      document.addEventListener('mousemove', handleResizeMove, { passive: false });
      document.addEventListener('mouseup', handleResizeEnd);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      return () => {
        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeEnd);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [resizing]);

  // Sync heights between tables
  useEffect(() => {
    const syncHeights = () => {
      // Sync header heights
      if (dataHeaderRef.current && numberHeaderRef.current) {
        const dataHeaderHeight = dataHeaderRef.current.offsetHeight;
        const numberHeaderHeight = numberHeaderRef.current.offsetHeight;
        const maxHeaderHeight = Math.max(dataHeaderHeight, numberHeaderHeight, 48);
        setHeaderHeight(maxHeaderHeight);
      }
      
      // Sync row heights
      const newRowHeights = {};
      getAllRows().forEach(row => {
        const dataRowRef = dataRowRefs.current[row.rowNumber];
        const numberRowRef = numberRowRefs.current[row.rowNumber];
        
        if (dataRowRef && numberRowRef) {
          const dataHeight = dataRowRef.offsetHeight;
          const numberHeight = numberRowRef.offsetHeight;
          const maxHeight = Math.max(dataHeight, numberHeight, 31);
          newRowHeights[row.rowNumber] = maxHeight;
        }
      });
      setRowHeights(newRowHeights);
    };
    
    const timeoutId = setTimeout(syncHeights, 0);
    const observer = new ResizeObserver(() => {
      clearTimeout(timeoutId);
      setTimeout(syncHeights, 0);
    });
    
    if (dataHeaderRef.current) observer.observe(dataHeaderRef.current);
    if (numberHeaderRef.current) observer.observe(numberHeaderRef.current);
    Object.values(dataRowRefs.current).forEach(ref => {
      if (ref) observer.observe(ref);
    });
    
    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [rowData, cellStyles, allColumns]);

  const copySelection = () => {
    if (!selectedRange) return;
    
    const { startRow, endRow, startCol, endCol } = selectedRange;
    const data = [];
    
    for (let r = startRow; r <= endRow; r++) {
      const rowValues = [];
      for (let c = startCol; c <= endCol; c++) {
        const colKey = visibleColumns[c]?.key;
        const cellValue = rowData[r]?.[colKey] || '';
        rowValues.push(cellValue);
      }
      data.push(rowValues);
    }
    
    setCopiedData({ data, isCut: false });

    // Clear copiedRow to avoid state conflicts
    setCopiedRow(null);

    // Copy to clipboard as tab-separated values
    const textData = data.map(row => row.join('\t')).join('\n');
    navigator.clipboard.writeText(textData);
  };

  const cutSelection = () => {
    if (!selectedRange) return;
    
    copySelection();
    setCopiedData(prev => prev ? { ...prev, isCut: true } : null);
    
    // Clear the cut cells
    const { startRow, endRow, startCol, endCol } = selectedRange;
    const newRowData = { ...rowData };
    
    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const colKey = visibleColumns[c]?.key;
        if (colKey && newRowData[r]) {
          newRowData[r] = { ...newRowData[r], [colKey]: '' };
        }
      }
    }
    
    setRowData(newRowData);
  };

  const pasteSelection = async () => {
    console.log('Starting paste operation...');
    console.log('Current state:', {
      selectedRange,
      selectedCell,
      copiedData: copiedData ? { dataLength: copiedData.data?.length, isCut: copiedData.isCut } : null,
      copiedRow: copiedRow ? Object.keys(copiedRow) : null
    });

    // Check if we have a selected range for area paste
    if (selectedRange && copiedData?.data) {
      console.log('Area paste: using selectedRange and copiedData');
      return pasteAreaSelection();
    }

    // Check if we have a selected cell for single paste operations
    if (!selectedCell) {
      console.log('No selection found for paste operation');
      return;
    }

    console.log('Single cell paste: trying clipboard data first');

    try {
      const clipboardText = await navigator.clipboard.readText();

      if (clipboardText && clipboardText.includes('\t')) {
        // Handle row paste (tab-separated values)
        console.log('Row paste: detected tab-separated data');
        return pasteRowData(clipboardText);
      } else if (clipboardText && clipboardText.includes('\n')) {
        // Handle multi-line paste (area paste from external source)
        console.log('Multi-line paste: detected area data from clipboard');
        return pasteMultiLineData(clipboardText);
      } else {
        // Handle single cell paste
        console.log('Single cell paste: detected single value');
        return pasteSingleCell(clipboardText);
      }
    } catch (error) {
      console.log('Clipboard read failed, using internal copiedData:', error);
    }

    // Fallback to internal copiedData
    if (copiedData?.data) {
      console.log('Fallback: using internal copiedData for area paste');
      return pasteAreaSelection();
    }

    console.log('No data available for paste operation');
  };

  // Handle area selection paste
  const pasteAreaSelection = () => {
    if (!selectedRange || !copiedData?.data) {
      console.log('Area paste failed: missing selectedRange or copiedData');
      return;
    }

    const { startRow, startCol } = selectedRange;
    console.log('Area paste: selectedRange =', selectedRange);
    console.log('Area paste: copiedData.data =', copiedData.data);
    console.log('Area paste: copiedData.data structure:', copiedData.data.map((row, i) => `Row ${i}: [${row.join(', ')}]`));

    const newRowData = { ...rowData };
    const pasteHeight = copiedData.data.length;
    const pasteWidth = copiedData.data[0]?.length || 0;

    // Special case: single cell paste (1x1)
    if (pasteHeight === 1 && pasteWidth === 1) {
      console.log('Single cell paste detected, using simple paste logic');
      const singleValue = copiedData.data[0][0];
      const targetColKey = visibleColumns[startCol]?.key;

      if (targetColKey) {
        if (!newRowData[startRow]) {
          newRowData[startRow] = {};
        }
        newRowData[startRow] = {
          ...newRowData[startRow],
          [targetColKey]: singleValue
        };
      }

      setRowData(newRowData);

      // Clear copied data if it was cut
      if (copiedData.isCut) {
        setCopiedData(null);
      }

      console.log('Single cell paste completed successfully');
      showToast('Cell value pasted successfully!', 'success');
      return;
    }

    // Calculate how many rows/columns we can actually paste
    const maxPasteRows = Math.min(pasteHeight, totalRows - startRow + 1);
    const maxPasteCols = Math.min(pasteWidth, visibleColumns.length - startCol);

    console.log(`Area paste: pasting ${maxPasteRows}x${maxPasteCols} area starting at row ${startRow}, col ${startCol}`);
    console.log('Area paste: visibleColumns =', visibleColumns.map(col => col.key));

    for (let rowOffset = 0; rowOffset < maxPasteRows; rowOffset++) {
      const targetRow = startRow + rowOffset;
      const sourceRow = copiedData.data[rowOffset];

      if (!sourceRow) continue;

      for (let colOffset = 0; colOffset < maxPasteCols; colOffset++) {
        const targetColIndex = startCol + colOffset;
        const targetColKey = visibleColumns[targetColIndex]?.key;

        if (targetColKey && sourceRow[colOffset] !== undefined) {
          if (!newRowData[targetRow]) {
            newRowData[targetRow] = {};
          }
          newRowData[targetRow] = {
            ...newRowData[targetRow],
            [targetColKey]: sourceRow[colOffset]
          };
        }
      }
    }

    setRowData(newRowData);

    // Clear copied data if it was cut
    if (copiedData.isCut) {
      setCopiedData(null);
    }

    console.log('Area paste completed successfully');
    showToast('Area pasted successfully!', 'success');
  };

  // Handle row paste (tab-separated values)
  const pasteRowData = (clipboardText) => {
    const [startRowStr, startColKey] = selectedCell.split('-');
    const startRow = parseInt(startRowStr);
    const startColIndex = visibleColumns.findIndex(col => col.key === startColKey);

    if (startColIndex === -1) return;

    const values = clipboardText.split('\t');
    const newRowData = { ...rowData };

    if (!newRowData[startRow]) {
      newRowData[startRow] = {};
    }

    console.log(`Row paste: pasting ${values.length} values starting at row ${startRow}, col ${startColIndex}`);

    // Paste row data starting from selected cell
    values.forEach((value, index) => {
      const targetColIndex = startColIndex + index;
      const targetColKey = visibleColumns[targetColIndex]?.key;
      if (targetColKey) {
        newRowData[startRow][targetColKey] = value;
      }
    });

    setRowData(newRowData);
    console.log('Row paste completed successfully');
    showToast('Row data pasted successfully!', 'success');
  };

  // Handle multi-line paste from external sources
  const pasteMultiLineData = (clipboardText) => {
    const [startRowStr, startColKey] = selectedCell.split('-');
    const startRow = parseInt(startRowStr);
    const startColIndex = visibleColumns.findIndex(col => col.key === startColKey);

    if (startColIndex === -1) return;

    const lines = clipboardText.split('\n').filter(line => line.trim());
    const newRowData = { ...rowData };

    console.log(`Multi-line paste: pasting ${lines.length} lines starting at row ${startRow}, col ${startColIndex}`);

    lines.forEach((line, rowOffset) => {
      const targetRow = startRow + rowOffset;
      if (targetRow > totalRows) return;

      const values = line.split('\t');

      values.forEach((value, colOffset) => {
        const targetColIndex = startColIndex + colOffset;
        const targetColKey = visibleColumns[targetColIndex]?.key;

        if (targetColKey) {
          if (!newRowData[targetRow]) {
            newRowData[targetRow] = {};
          }
          newRowData[targetRow] = {
            ...newRowData[targetRow],
            [targetColKey]: value
          };
        }
      });
    });

    setRowData(newRowData);
    console.log('Multi-line paste completed successfully');
    showToast('Data pasted successfully!', 'success');
  };

  // Handle single cell paste
  const pasteSingleCell = (clipboardText) => {
    const [startRowStr, startColKey] = selectedCell.split('-');
    const startRow = parseInt(startRowStr);
    const startColIndex = visibleColumns.findIndex(col => col.key === startColKey);

    if (startColIndex === -1) return;

    const newRowData = { ...rowData };

    if (!newRowData[startRow]) {
      newRowData[startRow] = {};
    }

    newRowData[startRow] = {
      ...newRowData[startRow],
      [startColKey]: clipboardText
    };

    setRowData(newRowData);
    console.log('Single cell paste completed successfully');
    showToast('Cell value pasted successfully!', 'success');
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          undo();
        } else if ((e.key === 'y') || (e.key === 'z' && e.shiftKey)) {
          e.preventDefault();
          redo();
        } else if (e.key === 'c') {
          e.preventDefault();
          copySelection();
        } else if (e.key === 'x') {
          e.preventDefault();
          cutSelection();
        } else if (e.key === 'v') {
          e.preventDefault();
          pasteSelection();
        } else if (e.key === 'i' && !e.shiftKey) {
          // Ctrl + I: Insert row above current selection
          e.preventDefault();
          const currentRow = selectedCell ? parseInt(selectedCell.split('-')[0]) : 1;
          insertRowAbove(currentRow);
        } else if (e.key === 'i' && e.shiftKey) {
          // Ctrl + Shift + I: Insert row below current selection
          e.preventDefault();
          const currentRow = selectedCell ? parseInt(selectedCell.split('-')[0]) : 1;
          insertRowBelow(currentRow);
        }
      } else if (selectedCell && !editingCell) {
        const [rowNum, colKey] = selectedCell.split('-');
        const currentRowIndex = parseInt(rowNum);
        const currentColIndex = visibleColumns.findIndex(col => col.key === colKey);
        const column = visibleColumns[currentColIndex];
        
        // Check if it's a printable character (typing)
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          if (column && (column.type === 'text' || column.type === 'autonumber' || column.type === 'createdby' || column.type === 'modifiedby' || column.type === 'comment')) {
            e.preventDefault();
            setEditingCell(selectedCell);
            setIsTyping(true);
            // Clear existing content and start with typed character
            setTimeout(() => {
              const input = document.querySelector(`input[data-cell="${selectedCell}"]`);
              if (input) {
                input.value = e.key;
                input.focus();
                input.setSelectionRange(1, 1);
              }
            }, 0);
            return;
          }
        }
        
        let newRowIndex = currentRowIndex;
        let newColIndex = currentColIndex;
        
        switch (e.key) {
          case 'ArrowUp':
            e.preventDefault();
            newRowIndex = Math.max(1, currentRowIndex - 1);
            break;
          case 'ArrowDown':
            e.preventDefault();
            newRowIndex = Math.min(totalRows, currentRowIndex + 1);
            break;
          case 'ArrowLeft':
            e.preventDefault();
            newColIndex = Math.max(0, currentColIndex - 1);
            break;
          case 'ArrowRight':
            e.preventDefault();
            newColIndex = Math.min(visibleColumns.length - 1, currentColIndex + 1);
            break;
          case 'Enter':
            e.preventDefault();
            if (currentRowIndex >= totalRows) {
              setTotalRows(prev => prev + 1);
              newRowIndex = currentRowIndex + 1;
            } else {
              newRowIndex = Math.min(totalRows, currentRowIndex + 1);
            }
            break;
          case 'Tab':
            e.preventDefault();
            if (e.shiftKey) {
              newColIndex = currentColIndex > 0 ? currentColIndex - 1 : visibleColumns.length - 1;
              if (newColIndex === visibleColumns.length - 1) newRowIndex = Math.max(1, currentRowIndex - 1);
            } else {
              newColIndex = currentColIndex < visibleColumns.length - 1 ? currentColIndex + 1 : 0;
              if (newColIndex === 0) newRowIndex = Math.min(totalRows, currentRowIndex + 1);
            }
            break;
          case 'Delete':
          case 'Backspace':
            e.preventDefault();
            // Row deletion is now only available through context menu
            // Clear cell content instead of deleting the entire row
            if (selectedCell && rowData[currentRowIndex]) {
              const newRowData = { ...rowData };
              if (newRowData[currentRowIndex][colKey] !== undefined) {
                const oldValue = newRowData[currentRowIndex][colKey];
                newRowData[currentRowIndex][colKey] = '';
                setRowData(newRowData);
                
                // Save to history for undo functionality
                saveToHistory({
                  type: 'cell_edit',
                  rowId: currentRowIndex,
                  columnKey: colKey,
                  oldValue,
                  newValue: ''
                });
              }
            }
            break;
        }
        
        if (newRowIndex !== currentRowIndex || newColIndex !== currentColIndex) {
          const newCell = `${newRowIndex}-${visibleColumns[newColIndex].key}`;
          setSelectedCell(newCell);
          updateEditorState(newCell);
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, history, selectedCell, editingCell, visibleColumns, totalRows]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showColorPicker && !e.target.closest('.color-picker-container')) {
        setShowColorPicker(null);
      }
      if (showTextColorPicker && !e.target.closest('.text-color-picker')) {
        setShowTextColorPicker(false);
      }
      if (showBackgroundColorPicker && !e.target.closest('.bg-color-picker')) {
        setShowBackgroundColorPicker(false);
      }
      if (contextMenu.isOpen && !e.target.closest('.context-menu')) {
        setContextMenu({ ...contextMenu, isOpen: false });
      }
      if (columnContextMenu.isOpen && !e.target.closest('[data-column-menu]') && !e.target.closest('.sort-submenu')) {
        setColumnContextMenu({ ...columnContextMenu, isOpen: false });
        setShowSortSubmenu(false);
      }
      if (showAddColumnModal && !e.target.closest('.fixed')) {
        setShowAddColumnModal(false);
      }
      if (showColumnFilter && !e.target.closest('.fixed')) {
        setShowColumnFilter(false);
      }
      if (showSortSubmenu && !e.target.closest('.sort-submenu')) {
        setShowSortSubmenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showColorPicker, showTextColorPicker, showBackgroundColorPicker, contextMenu, showAddColumnModal]);

  const handleColumnClick = (e, columnKey) => {
    if (e.target.closest('.resize-handle')) return;
    setSelectedColumn(columnKey);
    setSelectedCell(null);
  };

  const handleCellEdit = (rowNumber, column, value) => {
    saveToHistory({ type: 'cell_edit', rowNumber, column, oldValue: rowData[rowNumber]?.[column], newValue: value });
    setRowData(prev => ({
      ...prev,
      [rowNumber]: { ...prev[rowNumber], [column]: value }
    }));
    setEditingCell(null);
  };

  const updateEditorState = (cellKey) => {
    const currentStyle = cellStyles[cellKey] || {};
    setFontSize(currentStyle.fontSize ? currentStyle.fontSize.replace('px', '') : '16');
    setFontFamily(currentStyle.fontFamily || 'Arial');
    setIsBold(currentStyle.fontWeight === 'bold');
    setIsItalic(currentStyle.fontStyle === 'italic');
    setIsUnderline(currentStyle.textDecoration === 'underline');
    setTextColor(currentStyle.color || '#000000');
    setBackgroundColor(currentStyle.backgroundColor || 'transparent');
    setTextAlign(currentStyle.textAlign || 'left');
  };

  const applyFormatting = (updates = {}) => {
    if (selectedCell) {
      const currentStyle = cellStyles[selectedCell] || {};
      saveToHistory({ type: 'format_change', cell: selectedCell, oldStyle: currentStyle });
      const newStyles = {
        fontWeight: updates.fontWeight !== undefined ? updates.fontWeight : (isBold ? 'bold' : 'normal'),
        fontStyle: updates.fontStyle !== undefined ? updates.fontStyle : (isItalic ? 'italic' : 'normal'),
        textDecoration: updates.textDecoration !== undefined ? updates.textDecoration : (isUnderline ? 'underline' : 'none'),
        color: updates.color !== undefined ? updates.color : textColor,
        backgroundColor: updates.backgroundColor !== undefined ? updates.backgroundColor : backgroundColor,
        textAlign: updates.textAlign !== undefined ? updates.textAlign : textAlign,
        fontSize: updates.fontSize !== undefined ? updates.fontSize : `${fontSize}px`,
        fontFamily: updates.fontFamily !== undefined ? updates.fontFamily : fontFamily
      };
      setCellStyles(prev => ({
        ...prev,
        [selectedCell]: { ...currentStyle, ...newStyles }
      }));
    }
  };

  const resetFormatting = () => {
    if (selectedCell) {
      setCellStyles(prev => {
        const newStyles = { ...prev };
        delete newStyles[selectedCell];
        return newStyles;
      });
      setFontSize('16');
      setFontFamily('Arial');
      setIsBold(false);
      setIsItalic(false);
      setIsUnderline(false);
      setTextColor('#000000');
      setBackgroundColor('transparent');
      setTextAlign('left');
    }
  };

  const indentRow = (rowNumber) => {
    // Find the previous visible row to make it the parent
    for (let i = rowNumber - 1; i >= 1; i--) {
      if (isRowVisible(i)) {
        setParentChildMap(prev => ({
          ...prev,
          [rowNumber]: i
        }));
        
        setRowIndents(prev => ({
          ...prev,
          [rowNumber]: Math.min((prev[rowNumber] || 0) + 1, 5)
        }));
        break;
      }
    }
  };

  const outdentRow = (rowNumber) => {
    setParentChildMap(prev => {
      const newMap = { ...prev };
      delete newMap[rowNumber];
      return newMap;
    });
    
    setRowIndents(prev => ({
      ...prev,
      [rowNumber]: Math.max((prev[rowNumber] || 0) - 1, 0)
    }));
  };

  const getRowIndent = (rowId) => {
    return rowIndents[rowId] || 0;
  };

  // eslint-disable-next-line no-unused-vars
  const getChildRows = (parentTaskId) => {
    return Object.keys(rowData).filter(rowNum => parentChildMap[rowNum] === parentTaskId);
  };

  const hasChildren = (rowNumber) => {
    return Object.values(parentChildMap).includes(rowNumber);
  };

  const toggleRowCollapse = (rowNumber) => {
    setCollapsedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(rowNumber)) {
        newSet.delete(rowNumber);
      } else {
        newSet.add(rowNumber);
      }
      return newSet;
    });
  };

  const isRowVisible = (rowNumber) => {
    const parentRowNum = parentChildMap[rowNumber];
    if (!parentRowNum) return true;
    
    if (collapsedRows.has(parentRowNum)) return false;
    
    return isRowVisible(parentRowNum);
  };

  const getVisibleData = () => {
    return getAllRows().filter(row => !row.isEmpty);
  };

  const getAllRows = () => {
    const rows = [];
    
    for (let i = 1; i <= totalRows; i++) {
      if (isRowVisible(i)) {
        const data = rowData[i] || {};
        rows.push({ 
          rowNumber: i, 
          isEmpty: !rowData[i],
          ...data
        });
      }
    }
    return rows;
  };

  const expandAll = () => {
    setCollapsedRows(new Set());
  };

  const collapseAll = () => {
    const parentRowNums = [...new Set(Object.values(parentChildMap))];
    setCollapsedRows(new Set(parentRowNums));
  };

  const handleIndent = () => {
    if (selectedRows.length > 0) {
      selectedRows.forEach(rowId => indentRow(rowId));
    }
  };

  const handleOutdent = () => {
    if (selectedRows.length > 0) {
      selectedRows.forEach(rowId => outdentRow(rowId));
    }
  };

  const handleColumnDragStart = (e, columnKey) => {
    setDraggedColumn(columnKey);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleColumnDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleColumnDrop = (e, targetColumnKey) => {
    e.preventDefault();
    if (draggedColumn && draggedColumn !== targetColumnKey) {
      const newOrder = [...columnOrder];
      const draggedIndex = newOrder.indexOf(draggedColumn);
      const targetIndex = newOrder.indexOf(targetColumnKey);
      
      newOrder.splice(draggedIndex, 1);
      newOrder.splice(targetIndex, 0, draggedColumn);
      
      setColumnOrder(newOrder);
    }
    setDraggedColumn(null);
  };

  const toggleColumnVisibility = (columnKey) => {
    setHiddenColumns(prev => 
      prev.includes(columnKey)
        ? prev.filter(key => key !== columnKey)
        : [...prev, columnKey]
    );
  };

  const insertColumnLeft = (targetColumnKey) => {
    const newColumn = {
      key: `column${nextColumnId}`,
      label: `Column ${nextColumnId}`,
      width: '150px',
      type: 'text'
    };
    
    setAllColumns(prev => {
      const targetIndex = prev.findIndex(col => col.key === targetColumnKey);
      const newColumns = [...prev];
      newColumns.splice(targetIndex, 0, newColumn);
      return newColumns;
    });
    
    setColumnOrder(prev => {
      const targetIndex = prev.indexOf(targetColumnKey);
      const newOrder = [...prev];
      newOrder.splice(targetIndex, 0, newColumn.key);
      return newOrder;
    });
    
    setNextColumnId(prev => prev + 1);
  };

  const insertColumnRight = (targetColumnKey) => {
    const newColumn = {
      key: `column${nextColumnId}`,
      label: `Column ${nextColumnId}`,
      width: '150px',
      type: 'text'
    };
    
    setAllColumns(prev => {
      const targetIndex = prev.findIndex(col => col.key === targetColumnKey);
      const newColumns = [...prev];
      newColumns.splice(targetIndex + 1, 0, newColumn);
      return newColumns;
    });
    
    setColumnOrder(prev => {
      const targetIndex = prev.indexOf(targetColumnKey);
      const newOrder = [...prev];
      newOrder.splice(targetIndex + 1, 0, newColumn.key);
      return newOrder;
    });
    
    setNextColumnId(prev => prev + 1);
  };

  const deleteColumn = (columnKey) => {
    setAllColumns(prev => prev.filter(col => col.key !== columnKey));
    setColumnOrder(prev => prev.filter(key => key !== columnKey));
    setHiddenColumns(prev => prev.filter(key => key !== columnKey));
    setFrozenColumns(prev => prev.filter(key => key !== columnKey));
  };

  const toggleColumnFreeze = (columnKey) => {
    setFrozenColumns(prev => {
      const columnIndex = columnOrder.indexOf(columnKey);
      if (prev.includes(columnKey)) {
        // Unfreezing: keep only columns to the right of this column
        return prev.filter(key => columnOrder.indexOf(key) > columnIndex);
      } else {
        // Freezing: freeze all columns from left up to and including this column
        return columnOrder.slice(0, columnIndex + 1);
      }
    });
  };

  const getFrozenColumnLeft = (columnKey) => {
    const frozenIndex = frozenColumns.indexOf(columnKey);
    if (frozenIndex === -1) return 0;
    
    let left = 0;
    for (let i = 0; i < frozenIndex; i++) {
      left += getColumnWidth(frozenColumns[i]);
    }
    return left;
  };

  const isLastFrozenColumn = (columnKey) => {
    return frozenColumns.length > 0 && frozenColumns[frozenColumns.length - 1] === columnKey;
  };

  const increaseFontSize = () => {
    const newSize = Math.min(parseInt(fontSize) + 2, 36);
    setFontSize(newSize.toString());
    applyFormatting({ fontSize: `${newSize}px` });
  };

  const decreaseFontSize = () => {
    const newSize = Math.max(parseInt(fontSize) - 2, 8);
    setFontSize(newSize.toString());
    applyFormatting({ fontSize: `${newSize}px` });
  };

  const toggleBold = () => {
    const newBold = !isBold;
    setIsBold(newBold);
    applyFormatting({ fontWeight: newBold ? 'bold' : 'normal' });
  };

  const toggleItalic = () => {
    const newItalic = !isItalic;
    setIsItalic(newItalic);
    applyFormatting({ fontStyle: newItalic ? 'italic' : 'normal' });
  };

  const toggleUnderline = () => {
    const newUnderline = !isUnderline;
    setIsUnderline(newUnderline);
    applyFormatting({ textDecoration: newUnderline ? 'underline' : 'none' });
  };

  const setAlignment = (align) => {
    setTextAlign(align);
    applyFormatting({ textAlign: align });
  };

  const getCellStyle = (rowId, columnKey) => {
    const cellKey = `${rowId}-${columnKey}`;
    const manualStyles = cellStyles[cellKey] || {};
    
    // Get conditional formatting styles
    const row = rowData[rowId];
    const conditionalStyles = row ? getCellFormatting(row, columnKey, conditionalFormattingRules) : null;
    const conditionalCSSStyles = conditionalStyles ? formatToCSSStyles(conditionalStyles) : {};
    
    // Manual styles override conditional formatting styles
    return { ...conditionalCSSStyles, ...manualStyles };
  };

  const isInDragSelection = (rowNumber, columnKey) => {
    if (!isDragging || !dragStartCell || !dragEndCell) return false;
    
    const [startRow, startCol] = dragStartCell.split('-');
    const [endRow, endCol] = dragEndCell.split('-');
    const startRowNum = parseInt(startRow);
    const endRowNum = parseInt(endRow);
    const startColIndex = visibleColumns.findIndex(col => col.key === startCol);
    const endColIndex = visibleColumns.findIndex(col => col.key === endCol);
    const currentColIndex = visibleColumns.findIndex(col => col.key === columnKey);
    
    const minRow = Math.min(startRowNum, endRowNum);
    const maxRow = Math.max(startRowNum, endRowNum);
    const minCol = Math.min(startColIndex, endColIndex);
    const maxCol = Math.max(startColIndex, endColIndex);
    
    return rowNumber >= minRow && rowNumber <= maxRow && 
           currentColIndex >= minCol && currentColIndex <= maxCol;
  };

  const getDragSelectionBorder = (rowNumber, columnKey) => {
    if (!isInDragSelection(rowNumber, columnKey)) return '';
    
    const [startRow, startCol] = dragStartCell.split('-');
    const [endRow, endCol] = dragEndCell.split('-');
    const startRowNum = parseInt(startRow);
    const endRowNum = parseInt(endRow);
    const startColIndex = visibleColumns.findIndex(col => col.key === startCol);
    const endColIndex = visibleColumns.findIndex(col => col.key === endCol);
    const currentColIndex = visibleColumns.findIndex(col => col.key === columnKey);
    
    const minRow = Math.min(startRowNum, endRowNum);
    const maxRow = Math.max(startRowNum, endRowNum);
    const minCol = Math.min(startColIndex, endColIndex);
    const maxCol = Math.max(startColIndex, endColIndex);
    
    let borders = [];
    if (rowNumber === minRow) borders.push('border-t-2 border-t-blue-500');
    if (rowNumber === maxRow) borders.push('border-b-2 border-b-blue-500');
    if (currentColIndex === minCol) borders.push('border-l-2 border-l-blue-500');
    if (currentColIndex === maxCol) borders.push('border-r-2 border-r-blue-500');
    
    return borders.join(' ');
  };

  // eslint-disable-next-line no-unused-vars
  const handleRowSelect = (rowId) => {
    setSelectedRows(prev => 
      prev.includes(rowId) 
        ? prev.filter(id => id !== rowId)
        : [...prev, rowId]
    );
  };

  const copyRowToClipboard = (rowId) => {
    console.log('Copying row:', rowId, 'with data:', rowData[rowId]);

    const rowToCopy = rowData[rowId];
    if (!rowToCopy) {
      console.warn('Row not found or empty:', rowId);
      showToast('Row not found or empty', 'error');
      return;
    }

    setCopiedRow({ ...rowToCopy });

    // Convert row data to area format for consistency with copySelection
    // This ensures paste logic works correctly for both area and row copies
    const rowDataArray = [visibleColumns.map(col => rowToCopy[col.key] || '')];
    setCopiedData({ data: rowDataArray, isCut: false });

    // Copy row data to system clipboard as tab-separated values
    const rowValues = rowDataArray[0].join('\t');
    console.log('Row values to copy:', rowValues);

    navigator.clipboard.writeText(rowValues).then(() => {
      console.log('Row copied successfully to clipboard');
      showToast(`Row ${rowId} copied successfully!`, 'success');
    }).catch((err) => {
      console.error('Failed to copy to clipboard:', err);
      showToast('Failed to copy row to clipboard', 'error');
    });
  };

  const pasteRow = async (targetRowId) => {
    try {
      // Try to get data from system clipboard first
      const clipboardText = await navigator.clipboard.readText();
      if (clipboardText && clipboardText.includes('\t')) {
        // Parse tab-separated values
        const values = clipboardText.split('\t');
        const newRowData = { ...rowData };
        const pastedRow = {};
        
        // Map values to columns
        visibleColumns.forEach((col, index) => {
          if (values[index] !== undefined) {
            pastedRow[col.key] = values[index];
          }
        });
        
        // Update autonumber fields if they exist
        if (pastedRow.taskId) {
          pastedRow.taskId = targetRowId.toString();
        }
        
        newRowData[targetRowId] = pastedRow;
        setRowData(newRowData);
        
        saveToHistory({ 
          type: 'paste_row', 
          targetRow: targetRowId, 
          data: pastedRow 
        });
        
        showToast(`Row pasted to row ${targetRowId} successfully!`, 'success');
        return;
      }
    } catch (error) {
      console.log('Clipboard read failed, using internal state:', error);
    }
    
    // Fallback to internal copiedRow state
    if (!copiedRow) {
      showToast('No row copied! Please copy a row first.', 'warning');
      return;
    }
    
    const newRowData = { ...rowData };
    const pastedRow = { ...copiedRow };
    
    // Update autonumber fields if they exist
    if (pastedRow.taskId) {
      pastedRow.taskId = targetRowId.toString();
    }
    
    newRowData[targetRowId] = pastedRow;
    setRowData(newRowData);
    
    saveToHistory({ 
      type: 'paste_row', 
      targetRow: targetRowId, 
      data: pastedRow 
    });
    
    showToast(`Row pasted to row ${targetRowId} successfully!`, 'success');
  };

  const handleContextMenu = (e, rowId, type = 'row', columnKey = null) => {
    e.preventDefault();
    console.log('Context menu opened:', { rowId, type, columnKey });

    setContextMenu({
      isOpen: true,
      position: { x: e.clientX, y: e.clientY },
      rowId,
      type, // 'row' or 'cell'
      columnKey // only for cell type
    });
    setContextMenuRowId(rowId);
    setContextMenuType(type);
    setContextMenuColumnKey(columnKey);
  };

  const getConditionColor = (condition) => {
    switch (condition) {
      case 'green': return 'bg-green-500';
      case 'yellow': return 'bg-yellow-500';
      case 'red': return 'bg-red-500';
      default: return 'bg-gray-300';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAssigneeInitials = (value) => {
    const contact = dropdownOptions.assignedTo?.find(contact => contact.value === value);
    const name = contact?.name || contact?.label || value;
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getAssigneeColor = (name) => {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500'];
    const index = name.length % colors.length;
    return colors[index];
  };

  const getContactDisplayName = (value) => {
    const contact = dropdownOptions.assignedTo?.find(contact => contact.value === value);
    return contact?.name || contact?.label || value;
  };

  const handleColumnContextMenu = (e, columnKey) => {
    e.preventDefault();
    e.stopPropagation();
    setColumnContextMenu({
      isOpen: true,
      position: { x: e.clientX, y: e.clientY },
      columnKey
    });
  };

  const getContextMenuItems = () => {
    console.log('Getting context menu items, type:', contextMenuType, 'copiedRow:', copiedRow);

    if (contextMenuType === 'row') {
      // Row context menu (from row number column)
      return [
        { label: 'Copy row', icon: Copy, shortcut: 'Ctrl + Shift + C', onClick: () => copyRowToClipboard(contextMenuRowId) },
        { label: 'Paste row', icon: Clipboard, shortcut: 'Ctrl + Shift + V', onClick: () => pasteRow(contextMenuRowId), disabled: !copiedRow },
        { type: 'separator' },
        { label: 'Insert row above', icon: Plus, shortcut: 'Ctrl + I', onClick: () => insertRowAbove(contextMenuRowId) },
        { label: 'Insert row below', icon: Plus, shortcut: 'Ctrl + Shift + I', onClick: () => insertRowBelow(contextMenuRowId) },
        { label: 'Delete row', icon: Trash2, shortcut: '⌘ + Delete', onClick: () => deleteRow(contextMenuRowId), danger: true },
        { type: 'separator' },
        { label: 'Copy row link', icon: Link, shortcut: 'Option + Shift + C', onClick: () => {} },
        { type: 'separator' },
        { label: 'Promote child row', icon: CornerUpLeft, shortcut: '⌘ + [', onClick: () => outdentRow(contextMenuRowId) },
        { label: 'Make child row', icon: CornerDownRight, shortcut: '⌘ + ]', onClick: () => indentRow(contextMenuRowId) },
        { type: 'separator' },
        { label: 'Lock row', icon: Lock, shortcut: '⌘ + Shift + L', onClick: () => {} },
      ];
    } else {
      // Cell context menu (from data cells)
      return [
        { label: 'Cut', icon: Scissors, shortcut: '⌘ + X', onClick: () => cutSelection() },
        { label: 'Copy', icon: Copy, shortcut: '⌘ + C', onClick: () => copyCellValue() },
        { label: 'Paste', icon: Clipboard, shortcut: '⌘ + V', onClick: () => pasteSelection() },
        { type: 'separator' },
        { label: 'Copy row', icon: Copy, shortcut: 'Ctrl + Shift + C', onClick: () => copyRowToClipboard(contextMenuRowId) },
        { label: 'Paste row', icon: Clipboard, shortcut: 'Ctrl + Shift + V', onClick: () => pasteRow(contextMenuRowId), disabled: !copiedRow },
        { type: 'separator' },
        { label: 'Insert row above', icon: Plus, shortcut: 'Ctrl + I', onClick: () => insertRowAbove(contextMenuRowId) },
        { label: 'Insert row below', icon: Plus, shortcut: 'Ctrl + Shift + I', onClick: () => insertRowBelow(contextMenuRowId) },
        { label: 'Delete row', icon: Trash2, shortcut: '⌘ + Delete', onClick: () => deleteRow(contextMenuRowId), danger: true },
        { type: 'separator' },
        { label: 'Promote child row', icon: CornerUpLeft, shortcut: '⌘ + [', onClick: () => outdentRow(contextMenuRowId) },
        { label: 'Make child row', icon: CornerDownRight, shortcut: '⌘ + ]', onClick: () => indentRow(contextMenuRowId) },
      ];
    }
  };

  // Copy just the current cell value
  const copyCellValue = () => {
    if (!contextMenuColumnKey || !contextMenuRowId) return;

    const cellValue = rowData[contextMenuRowId]?.[contextMenuColumnKey] || '';
    console.log('Copying cell value:', cellValue, 'from row:', contextMenuRowId, 'column:', contextMenuColumnKey);

    // Set single cell data for paste operations
    const singleCellData = [[cellValue]];
    setCopiedData({ data: singleCellData, isCut: false });

    // Clear row-specific state to avoid conflicts
    setCopiedRow(null);

    // Also set to clipboard
    navigator.clipboard.writeText(cellValue).then(() => {
      console.log('Cell value copied to clipboard successfully');
      showToast('Cell value copied successfully!', 'success');
    }).catch((err) => {
      console.error('Failed to copy cell to clipboard:', err);
      showToast('Failed to copy cell value', 'error');
    });
  };

  const columnContextMenuItems = [
    { label: 'Insert column left', icon: Plus, shortcut: 'Ctrl + Shift + I', onClick: () => insertColumnLeft(columnContextMenu.columnKey) },
    { label: 'Insert column right', icon: Plus, onClick: () => insertColumnRight(columnContextMenu.columnKey) },
    // eslint-disable-next-line no-unused-vars
    { label: 'Rename column', icon: Edit, onClick: (e) => {
      const columnHeader = document.querySelector(`[data-column-key="${columnContextMenu.columnKey}"]`);
      const rect = columnHeader ? columnHeader.getBoundingClientRect() : { left: columnContextMenu.position.x, bottom: columnContextMenu.position.y };
      const column = allColumns.find(col => col.key === columnContextMenu.columnKey);
      setAddColumnPosition({ x: rect.left - 100, y: rect.bottom + 10 });
      setColumnPopupMode('edit');
      setEditingColumnData(column);
      setColumnName(column?.label || '');
      setColumnDescription('');
      setNewColumnType(column?.type || 'text');
      setTempDropdownOptions(dropdownOptions[columnContextMenu.columnKey] || []);
      // Load existing colors into temp state (same as Column properties)
      const existingColors = dropdownColors[columnContextMenu.columnKey] || {};
      // For status columns, ensure default colors are set if not already present
      if (column?.type === 'status' && Object.keys(existingColors).length === 0) {
        const statusColors = {
          0: 'bg-yellow-500', // Pending
          1: 'bg-blue-500',   // In Progress  
          2: 'bg-green-500'   // Completed
        };
        setDropdownColors(prev => ({ ...prev, temp: statusColors }));
      } else {
        setDropdownColors(prev => ({ ...prev, temp: existingColors }));
      }
      setNewDropdownValue('');
      setShowAddColumnModal(true);
    } },
    { label: 'Delete column', icon: Trash2, shortcut: '⌘ + Shift + Delete', onClick: () => deleteColumn(columnContextMenu.columnKey), danger: true },
    { label: 'Filter', icon: Filter, onClick: (e) => {
      const rect = e?.target?.getBoundingClientRect() || { left: columnContextMenu.position.x, bottom: columnContextMenu.position.y };
      setFilterPosition({ x: rect.left - 200, y: rect.bottom + 10 });
      setFilterColumnKey(columnContextMenu.columnKey);
      setShowColumnFilter(true);
    } },
    { 
      label: 'Sort rows', 
      icon: ArrowUp, 
      hasSubmenu: true,
      onClick: () => {}
    },
    { label: 'Lock column', icon: Lock, shortcut: '⌘ + Shift + L', onClick: () => {} },
    { label: 'Resize column', icon: ArrowRight, shortcut: 'Opt + R', onClick: () => {} },
    { label: 'Hide column', icon: EyeOff, onClick: () => toggleColumnVisibility(columnContextMenu.columnKey) },
    { label: 'Expand all', icon: ArrowDown, onClick: () => expandAll() },
    { label: 'Collapse all', icon: ArrowUp, onClick: () => collapseAll() },
    { 
      label: frozenColumns.includes(columnContextMenu.columnKey) ? 'Unfreeze column' : 'Freeze column',
      icon: frozenColumns.includes(columnContextMenu.columnKey) ? Clipboard : Clipboard,
      onClick: () => toggleColumnFreeze(columnContextMenu.columnKey)
    },
    // eslint-disable-next-line no-unused-vars
    { label: 'Column properties', icon: Settings, onClick: (e) => {
      const columnHeader = document.querySelector(`[data-column-key="${columnContextMenu.columnKey}"]`);
      const rect = columnHeader ? columnHeader.getBoundingClientRect() : { left: columnContextMenu.position.x, bottom: columnContextMenu.position.y };
      const column = allColumns.find(col => col.key === columnContextMenu.columnKey);
      setAddColumnPosition({ x: rect.left - 100, y: rect.bottom + 10 });
      setColumnPopupMode('edit');
      setEditingColumnData(column);
      setColumnName(column?.label || '');
      setColumnDescription('');
      setNewColumnType(column?.type || 'text');
      setTempDropdownOptions(dropdownOptions[columnContextMenu.columnKey] || []);
      // Load existing colors into temp state
      const existingColors = dropdownColors[columnContextMenu.columnKey] || {};
      // For status columns, ensure default colors are set if not already present
      if (column?.type === 'status' && Object.keys(existingColors).length === 0) {
        const statusColors = {
          0: 'bg-yellow-500', // Pending
          1: 'bg-blue-500',   // In Progress  
          2: 'bg-green-500'   // Completed
        };
        setDropdownColors(prev => ({ ...prev, temp: statusColors }));
      } else {
        setDropdownColors(prev => ({ ...prev, temp: existingColors }));
      }
      setNewDropdownValue('');
      setShowAddColumnModal(true);
    } },
  ];



  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden max-w-full"
      >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-purple-100 rounded flex items-center justify-center">
              <FileText className="w-4 h-4 text-purple-600" />
            </div>
            <h1 className="text-lg font-medium text-gray-900 dark:text-white">Project Sheet</h1>
            <Star className="w-4 h-4 text-gray-400" />
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <HelpCircle className="w-4 h-4" />
            <span>Help & Feedback</span>
            <Cloud className="w-4 h-4" />
          </div>
        </div>
        <Button variant="primary" size="sm">
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button className="flex items-center px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded border border-gray-300">
              <FileText className="w-4 h-4 mr-1" />
              Table
              <ChevronDown className="w-3 h-3 ml-1" />
            </button>
            <button className="p-1 text-gray-600 hover:bg-gray-100 rounded" onClick={undo} disabled={historyIndex <= 0}>
              <Undo2 className="w-4 h-4" />
            </button>
            <button className="p-1 text-gray-600 hover:bg-gray-100 rounded" onClick={redo} disabled={historyIndex >= history.length - 1}>
              <RotateCcw className="w-4 h-4" />
            </button>
            <button className="p-1 text-gray-600 hover:bg-gray-100 rounded">
              <Search className="w-4 h-4" />
            </button>
            <button className={`flex items-center px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded ${showFilter ? 'bg-blue-50' : ''}`} onClick={() => setShowFilter(!showFilter)}>
              <Filter className="w-4 h-4 mr-1" />
              Filter
            </button>
            <button className={`flex items-center px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded ${showFormatTools ? 'bg-blue-50' : ''}`} onClick={() => setShowFormatTools(!showFormatTools)}>
              <Palette className="w-4 h-4 mr-1" />
              Format
            </button>
            <button className="flex items-center px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded">
              Format rules
            </button>
            <button className="flex items-center px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded">
              Formulas
            </button>
            <button className="p-1 text-gray-600 hover:bg-gray-100 rounded">
              <MessageCircle className="w-4 h-4" />
            </button>
            <button className="p-1 text-gray-600 hover:bg-gray-100 rounded">
              <Paperclip className="w-4 h-4" />
            </button>
            <button className="p-1 text-gray-600 hover:bg-gray-100 rounded">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>
        <button className="p-1 text-gray-600 hover:bg-gray-100 rounded">
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Formatting Toolbar */}
      {showFormatTools && (
      <div className="flex items-center space-x-4 p-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <select 
          value={fontFamily} 
          onChange={(e) => {
            setFontFamily(e.target.value);
            applyFormatting({ fontFamily: e.target.value });
          }}
          className="px-2 py-1 border border-gray-300 rounded text-sm bg-white dark:bg-gray-700 dark:border-gray-600"
        >
          <option>Arial</option>
          <option>Helvetica</option>
          <option>Times New Roman</option>
          <option>Georgia</option>
          <option>Verdana</option>
        </select>
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="sm" className="p-1" onClick={decreaseFontSize}>
            <Minus className="w-4 h-4" />
          </Button>
          <input 
            type="text" 
            value={fontSize} 
            onChange={(e) => {
              setFontSize(e.target.value);
              applyFormatting({ fontSize: `${e.target.value}px` });
            }}
            className="w-8 text-center text-sm border border-gray-300 rounded bg-white dark:bg-gray-700 dark:border-gray-600"
          />
          <Button variant="ghost" size="sm" className="p-1" onClick={increaseFontSize}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center space-x-1">
          <Button 
            variant={isBold ? 'primary' : 'ghost'} 
            size="sm" 
            className="p-1" 
            onClick={toggleBold}
          >
            <Bold className="w-4 h-4" />
          </Button>
          <Button 
            variant={isItalic ? 'primary' : 'ghost'} 
            size="sm" 
            className="p-1" 
            onClick={toggleItalic}
          >
            <Italic className="w-4 h-4" />
          </Button>
          <Button 
            variant={isUnderline ? 'primary' : 'ghost'} 
            size="sm" 
            className="p-1" 
            onClick={toggleUnderline}
          >
            <Underline className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center space-x-1">
          <div className="relative text-color-picker">
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-1 relative" 
              onClick={() => setShowTextColorPicker(!showTextColorPicker)}
            >
              <div className="flex flex-col items-center">
                <span className="text-lg font-bold" style={{ color: textColor }}>A</span>
                <div className="w-4 h-1" style={{ backgroundColor: textColor }}></div>
              </div>
            </Button>
            {showTextColorPicker && (
              <div className="absolute top-10 left-0 z-[200] bg-white border border-gray-300 rounded-lg shadow-xl p-3 min-w-[200px] text-color-picker">
                <div className="grid grid-cols-6 gap-2 mb-3">
                  {colorOptions.slice(1).map((color) => (
                    <div
                      key={color.color}
                      className={`w-7 h-7 rounded cursor-pointer border-2 border-gray-200 hover:border-gray-400 ${color.color}`}
                      onClick={() => {
                        const hexColor = color.color.includes('bg-white') ? '#ffffff' : getHexColor(color.color);
                        setTextColor(hexColor);
                        applyFormatting({ color: hexColor });
                        setShowTextColorPicker(false);
                      }}
                      title={color.name}
                    />
                  ))}
                </div>
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => {
                    setTextColor(e.target.value);
                    applyFormatting({ color: e.target.value });
                  }}
                  className="w-full h-8 rounded cursor-pointer border border-gray-300"
                />
              </div>
            )}
          </div>
          <div className="relative bg-color-picker">
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-1 relative" 
              onClick={() => setShowBackgroundColorPicker(!showBackgroundColorPicker)}
            >
              <div className="flex flex-col items-center">
                <div className="w-4 h-3 border border-gray-400 relative" style={{ backgroundColor: backgroundColor === 'transparent' ? 'white' : backgroundColor }}>
                  {backgroundColor === 'transparent' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-3 h-0.5 bg-red-500 rotate-45"></div>
                    </div>
                  )}
                </div>
                <div className="w-4 h-1 bg-yellow-400"></div>
              </div>
            </Button>
            {showBackgroundColorPicker && (
              <div className="absolute top-10 right-0 z-[200] bg-white border border-gray-300 rounded-lg shadow-xl p-3 min-w-[200px] bg-color-picker">
                <div className="grid grid-cols-6 gap-2 mb-3">
                  <div
                    className="w-7 h-7 rounded cursor-pointer border-2 border-gray-400 bg-white relative hover:border-gray-600"
                    onClick={() => {
                      setBackgroundColor('transparent');
                      applyFormatting({ backgroundColor: 'transparent' });
                      setShowBackgroundColorPicker(false);
                    }}
                    title="No Fill"
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-4 h-0.5 bg-red-500 rotate-45"></div>
                    </div>
                  </div>
                  {colorOptions.slice(1).map((color) => (
                    <div
                      key={color.color}
                      className={`w-7 h-7 rounded cursor-pointer border-2 border-gray-200 hover:border-gray-400 ${color.color}`}
                      onClick={() => {
                        const hexColor = getHexColor(color.color);
                        setBackgroundColor(hexColor);
                        applyFormatting({ backgroundColor: hexColor });
                        setShowBackgroundColorPicker(false);
                      }}
                      title={color.name}
                    />
                  ))}
                </div>
                <input
                  type="color"
                  value={backgroundColor === 'transparent' ? '#ffffff' : backgroundColor}
                  onChange={(e) => {
                    setBackgroundColor(e.target.value);
                    applyFormatting({ backgroundColor: e.target.value });
                  }}
                  className="w-full h-8 rounded cursor-pointer border border-gray-300"
                />
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <Button 
            variant={textAlign === 'left' ? 'primary' : 'ghost'} 
            size="sm" 
            className="p-1" 
            onClick={() => setAlignment('left')}
          >
            <AlignLeft className="w-4 h-4" />
          </Button>
          <Button 
            variant={textAlign === 'center' ? 'primary' : 'ghost'} 
            size="sm" 
            className="p-1" 
            onClick={() => setAlignment('center')}
          >
            <AlignCenter className="w-4 h-4" />
          </Button>
          <Button 
            variant={textAlign === 'right' ? 'primary' : 'ghost'} 
            size="sm" 
            className="p-1" 
            onClick={() => setAlignment('right')}
          >
            <AlignRight className="w-4 h-4" />
          </Button>
          <Button 
            variant={textAlign === 'justify' ? 'primary' : 'ghost'} 
            size="sm" 
            className="p-1" 
            onClick={() => setAlignment('justify')}
          >
            <AlignJustify className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center space-x-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-1" 
            onClick={handleOutdent}
            disabled={selectedRows.length === 0}
            title="Decrease indent"
          >
            <Outdent className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-1" 
            onClick={handleIndent}
            disabled={selectedRows.length === 0}
            title="Increase indent"
          >
            <Indent className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="sm" className="p-1">
            <DollarSign className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="p-1">
            <Percent className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="p-1">
            <Hash className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="p-1">
            <Quote className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center space-x-1">
          <div className="relative group">
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700" 
              onClick={() => setShowConditionalFormatting(true)}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
              Conditional Formatting
            </div>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setShowColumnModal(true)}>
          <Eye className="w-4 h-4 mr-2" />
          Columns
        </Button>
        <Button variant="ghost" size="sm" onClick={resetFormatting} disabled={!selectedCell}>
          Reset
        </Button>
      </div>
      )}

      {/* Table */}
      <div className="flex rounded-lg overflow-hidden select-none">
        {/* Fixed Row Number Column */}
        <div className="flex-shrink-0 rounded-l-lg overflow-hidden">
          <table className="border-collapse">
            <thead>
              <tr className="bg-white dark:bg-gray-800" ref={numberHeaderRef} style={{ height: headerHeight }}>
                <th className="w-12 px-3 py-2 border-r border-b border-gray-200 bg-white">
                  <div className="flex items-center justify-center">
                    <span className="text-xs text-gray-500">#</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {getAllRows().map((row) => (
                <motion.tr
                  key={row.rowNumber}
                  ref={el => numberRowRefs.current[row.rowNumber] = el}
                  className={`hover:bg-blue-50 dark:hover:bg-blue-900/20 ${
                    selectedRows.includes(row.rowNumber) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                  onContextMenu={(e) => handleContextMenu(e, row.rowNumber, 'row')}
                  style={{ height: rowHeights[row.rowNumber] || '31px' }}
                >
                  <td className="p-0 border-r border-b border-gray-200 text-center bg-white group relative">
                    <div className="flex items-center justify-between h-full px-3 py-1">
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-gray-600 dark:text-gray-400">{row.rowNumber}</span>
                      </div>
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          className={`p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors ${
                            copiedRow ? 'bg-green-100 text-green-600' : ''
                          }`}
                          title="Copy row"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyRowToClipboard(row.rowNumber);
                          }}
                        >
                          <Copy className="w-3 h-3 text-gray-500" />
                        </button>
                        <button 
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                          title="Insert row"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Insert row functionality
                          }}
                        >
                          <Plus className="w-3 h-3 text-gray-500" />
                        </button>
                        <button 
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                          title="Move row"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Move row functionality
                          }}
                        >
                          <GripVertical className="w-3 h-3 text-gray-500" />
                        </button>
                        <button 
                          className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                          title="Promote child row"
                          onClick={(e) => {
                            e.stopPropagation();
                            outdentRow(row.rowNumber);
                          }}
                        >
                          <ArrowLeft className="w-2.5 h-2.5 text-gray-500" />
                        </button>
                        <button 
                          className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                          title="Make child row"
                          onClick={(e) => {
                            e.stopPropagation();
                            indentRow(row.rowNumber);
                          }}
                        >
                          <ArrowRight className="w-2.5 h-2.5 text-gray-500" />
                        </button>
                        <button 
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                          title="More options"
                          onClick={(e) => handleContextMenu(e, row.rowNumber)}
                        >
                          <MoreVerticalIcon className="w-3 h-3 text-gray-500" />
                        </button>
                      </div>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {/* Add Row */}
              <tr>
                <td className="p-2 border border-gray-200 dark:border-gray-600 text-center bg-white dark:bg-gray-800">
                  <div className="flex items-center justify-center">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="p-1 w-8 h-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center justify-center" 
                      onClick={addNewRow}
                      title="Add new row"
                    >
                      <Plus className="w-6 h-6" strokeWidth={3} />
                    </Button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        {/* Scrollable Data Columns */}
        <div className="flex-1 overflow-x-auto rounded-r-lg">
          <table className="border-collapse" style={{ tableLayout: 'fixed', width: 'max-content' }}>
            <thead>
              <tr className="bg-white dark:bg-gray-800" ref={dataHeaderRef} style={{ height: headerHeight }}>
                {visibleColumns.map((column) => (
                  <th
                    key={column.key}
                    data-column-key={column.key}
                    className={`px-3 py-2 border-b border-gray-200 text-left cursor-pointer relative group bg-white hover:bg-gray-50 ${
                      selectedColumn === column.key ? 'bg-blue-50' : ''
                    } ${
                      frozenColumns.includes(column.key) ? 'sticky z-10 shadow-md' : ''
                    } ${
                      isLastFrozenColumn(column.key) ? 'border-r-2 border-r-blue-400 after:content-[""] after:absolute after:top-0 after:right-0 after:w-0.5 after:h-full after:bg-blue-400 after:z-20' : 'border-r'
                    }`}
                    style={{ 
                      width: getColumnWidth(column.key),
                      left: frozenColumns.includes(column.key) ? `${getFrozenColumnLeft(column.key)}px` : 'auto'
                    }}
                    draggable
                    onDragStart={(e) => handleColumnDragStart(e, column.key)}
                    onDragOver={handleColumnDragOver}
                    onDrop={(e) => handleColumnDrop(e, column.key)}
                    onContextMenu={(e) => handleColumnContextMenu(e, column.key)}
                    onClick={(e) => handleColumnClick(e, column.key)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <GripVertical className="w-3 h-3 text-gray-400" />
                        <span className="text-sm font-medium text-gray-800">
                          {column.label}
                        </span>
                        {column.key === 'dependencies' && (
                          <HelpCircle className="w-3 h-3 text-gray-400" />
                        )}
                        {column.key === 'gfgfgf' && (
                          <HelpCircle className="w-3 h-3 text-gray-400" />
                        )}
                      </div>
                      <MoreVerticalIcon className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" 
                        onClick={(e) => handleColumnContextMenu(e, column.key)} />
                    </div>
                    <div
                      className="resize-handle absolute top-0 right-0 w-2 h-full cursor-col-resize hover:bg-blue-500 transition-colors z-10"
                      onMouseDown={(e) => handleResizeStart(e, column.key)}
                    />
                  </th>
                ))}
                <th className="p-2 border-r border-b border-gray-200 bg-white w-12">
                  <div className="flex items-center justify-center">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={(e) => {
                        const rect = e.target.getBoundingClientRect();
                        setAddColumnPosition({ x: rect.left - 300, y: rect.bottom + 10 });
                        setColumnPopupMode('add');
                        setColumnName(`Column${nextColumnId}`);
                        setColumnDescription('');
                        setTempDropdownOptions([]);
                        setNewDropdownValue('');
                        setNewColumnType('text');
                        setShowAddColumnModal(true);
                      }}
                      className="p-1 w-8 h-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center justify-center"
                      title="Add new column"
                    >
                      <Plus className="w-6 h-6" strokeWidth={3} />
                    </Button>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {getAllRows().map((row) => (
                <motion.tr
                  key={row.rowNumber}
                  ref={el => dataRowRefs.current[row.rowNumber] = el}
                  className={`hover:bg-blue-50 dark:hover:bg-blue-900/20 ${
                    selectedRows.includes(row.rowNumber) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                  style={{ height: rowHeights[row.rowNumber] || '31px' }}
                >
                  {visibleColumns.map((column) => (
                    <td
                      key={`${row.rowNumber}-${column.key}`}
                      className={`px-3 py-1 border-b border-gray-200 ${
                        selectedCell === `${row.rowNumber}-${column.key}` ? 'outline outline-3 outline-blue-500 outline-offset-[-2px] bg-white rounded-md' : 
                        (isInDragSelection(row.rowNumber, column.key) || (selectedRange && row.rowNumber >= selectedRange.startRow && row.rowNumber <= selectedRange.endRow && visibleColumns.findIndex(col => col.key === column.key) >= selectedRange.startCol && visibleColumns.findIndex(col => col.key === column.key) <= selectedRange.endCol)) ? `bg-blue-100 ${getDragSelectionBorder(row.rowNumber, column.key) || (() => {
                          if (!selectedRange) return '';
                          const colIndex = visibleColumns.findIndex(col => col.key === column.key);
                          let borders = [];
                          if (row.rowNumber === selectedRange.startRow) borders.push('border-t-2 border-t-blue-500');
                          if (row.rowNumber === selectedRange.endRow) borders.push('border-b-2 border-b-blue-500');
                          if (colIndex === selectedRange.startCol) borders.push('border-l-2 border-l-blue-500');
                          if (colIndex === selectedRange.endCol) borders.push('border-r-2 border-r-blue-500');
                          return borders.join(' ');
                        })()}` :
                        selectedColumn === column.key ? 'bg-blue-50' : 'bg-white hover:bg-gray-50'
                      } ${
                        frozenColumns.includes(column.key) ? 'sticky z-10 bg-white shadow-md' : ''
                      } ${
                        isLastFrozenColumn(column.key) ? 'border-r-2 border-r-blue-400 after:content-[""] after:absolute after:top-0 after:right-0 after:w-0.5 after:h-full after:bg-blue-400 after:z-20' : 'border-r'
                      }`}
                      style={{ 
                        width: getColumnWidth(column.key), 
                        left: frozenColumns.includes(column.key) ? `${getFrozenColumnLeft(column.key)}px` : 'auto',
                        ...getCellStyle(row.rowNumber, column.key) 
                      }}
                      onMouseEnter={() => {
                        if (isDragging) {
                          const cellKey = `${row.rowNumber}-${column.key}`;
                          setDragEndCell(cellKey);
                        }
                        if (column.type === 'dropdown' || column.type === 'status') {
                          setHoveredCell(`${row.rowNumber}-${column.key}`);
                        }
                      }}

                      onClick={() => {
                        const cellKey = `${row.rowNumber}-${column.key}`;
                        setSelectedCell(cellKey);
                        setSelectedColumn(null);
                        setIsTyping(false);
                        
                        // Update editor state immediately
                        const currentStyle = cellStyles[cellKey] || {};
                        setFontSize(currentStyle.fontSize ? currentStyle.fontSize.replace('px', '') : '16');
                        setFontFamily(currentStyle.fontFamily || 'Arial');
                        setIsBold(currentStyle.fontWeight === 'bold');
                        setIsItalic(currentStyle.fontStyle === 'italic');
                        setIsUnderline(currentStyle.textDecoration === 'underline');
                        setTextColor(currentStyle.color || '#000000');
                        setTextAlign(currentStyle.textAlign || 'left');
                        
                        // Only show dropdown/status on single click
                        if (column.type === 'dropdown' || column.type === 'status') {
                          setHoveredCell(cellKey);
                        }
                      }}
                      onMouseDown={(e) => {
                        const cellKey = `${row.rowNumber}-${column.key}`;
                        if (!e.target.closest('.fill-handle')) {
                          // Regular cell selection
                          setDragStartCell(cellKey);
                          setDragEndCell(cellKey);
                          setIsDragging(true);
                          setIsFillDragging(false);
                        }
                      }}
                      // eslint-disable-next-line no-unused-vars
                      onMouseUp={(e) => {
                        if (isDragging && dragStartCell && dragEndCell) {
                          const [startRow, startCol] = dragStartCell.split('-');
                          const [endRow, endCol] = dragEndCell.split('-');
                          const startRowNum = parseInt(startRow);
                          const endRowNum = parseInt(endRow);
                          const startColIndex = visibleColumns.findIndex(col => col.key === startCol);
                          const endColIndex = visibleColumns.findIndex(col => col.key === endCol);
                          
                          const minRow = Math.min(startRowNum, endRowNum);
                          const maxRow = Math.max(startRowNum, endRowNum);
                          const minCol = Math.min(startColIndex, endColIndex);
                          const maxCol = Math.max(startColIndex, endColIndex);
                          
                          // Set selected range for copy/paste operations
                          setSelectedRange({
                            startRow: minRow,
                            endRow: maxRow,
                            startCol: minCol,
                            endCol: maxCol
                          });
                          
                          // Only perform fill operation when dragging from fill handle
                          if (isFillDragging && (startRowNum !== endRowNum || startColIndex !== endColIndex)) {
                            const sourceValue = rowData[startRowNum]?.[startCol] || '';
                            const newRowData = { ...rowData };
                            for (let r = minRow; r <= maxRow; r++) {
                              for (let c = minCol; c <= maxCol; c++) {
                                const colKey = visibleColumns[c]?.key;
                                if (colKey && (r !== startRowNum || colKey !== startCol)) {
                                  if (!newRowData[r]) newRowData[r] = {};
                                  newRowData[r][colKey] = sourceValue;
                                }
                              }
                            }
                            setRowData(newRowData);
                          }
                          
                          setIsDragging(false);
                          setIsFillDragging(false);
                        }
                      }}
                      onContextMenu={(e) => handleContextMenu(e, row.rowNumber, 'cell', column.key)}
                      onDoubleClick={() => {
                        const cellKey = `${row.rowNumber}-${column.key}`;
                        if (column.type === 'text' || column.type === 'autonumber' || column.type === 'createdby' || column.type === 'modifiedby' || column.type === 'comment' || column.type === 'date') {
                          setEditingCell(cellKey);
                          setIsTyping(false);
                        }
                      }}
                    >
                      {editingCell === `${row.rowNumber}-${column.key}` && column.type !== 'date' ? (
                        <input
                          type="text"
                          data-cell={`${row.rowNumber}-${column.key}`}
                          defaultValue={isTyping ? '' : row[column.key]}
                          onBlur={(e) => {
                            handleCellEdit(row.rowNumber, column.key, e.target.value);
                            setIsTyping(false);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleCellEdit(row.rowNumber, column.key, e.target.value);
                              setIsTyping(false);
                              // Move to next row in same column
                              const nextRow = Math.min(totalRows, row.rowNumber + 1);
                              const nextCell = `${nextRow}-${column.key}`;
                              setSelectedCell(nextCell);
                              updateEditorState(nextCell);
                            } else if (e.key === 'Escape') {
                              setEditingCell(null);
                              setIsTyping(false);
                            }
                          }}
                          className="w-full px-1 py-0 border-0 bg-transparent text-sm focus:outline-none rounded"
                          style={getCellStyle(row.rowNumber, column.key)}
                          autoFocus
                        />
                      ) : editingCell === `${row.rowNumber}-${column.key}` && column.type === 'date' ? (
                        <div className="w-full">
                          <DatePicker
                            value={row[column.key] ? new Date(row[column.key]) : null}
                            onChange={(date) => {
                              const dateStr = date ? date.toISOString().split('T')[0] : '';
                              handleCellEdit(row.rowNumber, column.key, dateStr);
                              setEditingCell(null);
                            }}
                            onClickOutside={() => setEditingCell(null)}
                            className="custom-date-picker"
                            calendarClassName="custom-calendar"
                            format="dd/MM/yyyy"
                            clearIcon={null}
                            calendarIcon={<Calendar className="w-4 h-4 text-gray-500" />}
                            autoFocus
                          />
                        </div>
                      ) : (
                        <div className="text-sm relative" style={getCellStyle(row.rowNumber, column.key)}>
                          {row.isEmpty ? (
                            <span className="text-sm text-gray-400"></span>
                          ) : column.type === 'dropdown' ? (
                            hoveredCell === `${row.rowNumber}-${column.key}` ? (
                              <ProfessionalDropdown
                                value={row[column.key] || ''}
                                onChange={(value) => {
                                  handleCellEdit(row.rowNumber, column.key, value);
                                  setHoveredCell(null);
                                }}
                                onBlur={() => setHoveredCell(null)}
                                options={Array.isArray(dropdownOptions[column.key]) 
                                  ? (typeof dropdownOptions[column.key][0] === 'string' 
                                    ? dropdownOptions[column.key].map(opt => ({ value: opt, label: opt }))
                                    : dropdownOptions[column.key])
                                  : []}
                                placeholder="Select..."
                                showColors={dropdownColors[column.key] ? true : false}
                                colorMap={dropdownColors[column.key] || {}}
                                autoFocus
                                size="sm"
                                className="min-w-0"
                              />
                            ) : (
                              <div className="px-2 py-1 text-sm">
                                {row[column.key] ? (
                                  <span className={`px-2 py-1 rounded ${
                                    (() => {
                                      const options = dropdownOptions[column.key] || [];
                                      let optIndex = -1;
                                      
                                      if (typeof options[0] === 'string') {
                                        optIndex = options.indexOf(row[column.key]);
                                      } else {
                                        optIndex = options.findIndex(opt => opt.value === row[column.key]);
                                      }
                                      
                                      const colorClass = dropdownColors[column.key]?.[optIndex] || 'bg-transparent border-2 border-gray-400';
                                      const isTransparent = colorClass.includes('bg-transparent');
                                      return isTransparent ? 'text-gray-700 bg-transparent' : `${colorClass} text-white`;
                                    })()
                                  }`}>
                                    {(() => {
                                      const options = dropdownOptions[column.key] || [];
                                      if (typeof options[0] === 'string') {
                                        return row[column.key];
                                      } else {
                                        const option = options.find(opt => opt.value === row[column.key]);
                                        return option?.label || row[column.key];
                                      }
                                    })()}
                                  </span>
                                ) : (
                                  <span className="text-gray-500"></span>
                                )}
                              </div>
                            )
                          ) : column.type === 'checkbox' ? (
                            <div className="flex justify-center">
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={row[column.key] === 'true' || row[column.key] === true}
                                  onChange={(e) => handleCellEdit(row.rowNumber, column.key, e.target.checked.toString())}
                                  className="sr-only"
                                />
                                <div className={`w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center ${
                                  row[column.key] === 'true' || row[column.key] === true
                                    ? 'bg-blue-600 border-blue-600'
                                    : 'bg-white border-gray-300 hover:border-gray-400'
                                }`}>
                                  {(row[column.key] === 'true' || row[column.key] === true) && (
                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                </div>
                              </label>
                            </div>
                          ) : column.type === 'date' ? (
                            <span className="text-sm cursor-pointer hover:bg-gray-100 rounded px-2 py-1">
                              {formatDate(row[column.key]) || 'Select date'}
                            </span>
                          ) : column.type === 'contact' ? (
                            hoveredCell === `${row.rowNumber}-${column.key}` ? (
                              <ProfessionalDropdown
                                value={row[column.key] || ''}
                                onChange={(value) => {
                                  handleCellEdit(row.rowNumber, column.key, value);
                                  setHoveredCell(null);
                                }}
                                onBlur={() => setHoveredCell(null)}
                                options={dropdownOptions.assignedTo || []}
                                placeholder="Select contact..."
                                showAvatar={true}
                                showSearch={true}
                                autoFocus
                                size="sm"
                                className="min-w-0"
                              />
                            ) : row[column.key] ? (
                              <div className="flex items-center space-x-2 px-2 py-1">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white ${getAssigneeColor(row[column.key])}`}>
                                  {getAssigneeInitials(row[column.key])}
                                </div>
                                <span>{getContactDisplayName(row[column.key])}</span>
                              </div>
                            ) : (
                              <span className="text-gray-500 px-2 py-1">Unassigned</span>
                            )
                          ) : column.type === 'condition' ? (
                            <div className="flex justify-center">
                              <div className={`w-4 h-4 rounded-full ${getConditionColor(row[column.key])}`}></div>
                            </div>
                          ) : column.type === 'autonumber' ? (
                            <span className="text-gray-600">#{row.rowNumber}</span>
                          ) : column.type === 'status' ? (
                            hoveredCell === `${row.rowNumber}-${column.key}` ? (
                              <ProfessionalDropdown
                                value={row[column.key] || ''}
                                onChange={(value) => {
                                  handleCellEdit(row.rowNumber, column.key, value);
                                  setHoveredCell(null);
                                }}
                                onBlur={() => setHoveredCell(null)}
                                options={dropdownOptions.status?.map(opt => ({
                                  value: opt,
                                  label: opt
                                })) || []}
                                placeholder="Select status..."
                                showColors={true}
                                colorMap={dropdownColors.status}
                                autoFocus
                                size="sm"
                                className="min-w-0"
                              />
                            ) : (
                              <span className={`px-2 py-1 rounded text-xs cursor-pointer ${getStatusColor(row[column.key])}`}>
                                {row[column.key] || 'Pending'}
                              </span>
                            )
                          ) : column.key === 'taskId' ? (
                            <div className="flex items-center relative">
                              {(() => {
                                const indentLevel = getRowIndent(row.rowNumber);
                                const hasParent = parentChildMap[row.rowNumber];
                                const displayIndent = hasParent ? Math.max(indentLevel, 1) : indentLevel;
                                
                                return displayIndent > 0 && (
                                  <div className="flex items-center mr-2">
                                    {Array.from({ length: displayIndent }).map((_, i) => (
                                      <div key={i} className="w-4" />
                                    ))}
                                  </div>
                                );
                              })()}
                              <div className="flex items-center">
                                {hasChildren(row.rowNumber) ? (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleRowCollapse(row.rowNumber);
                                    }}
                                    className="w-4 h-4 flex items-center justify-center mr-1 bg-gray-50 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-sm transition-colors border border-gray-200 dark:border-gray-600"
                                  >
                                    <svg 
                                      className={`w-3.5 h-3.5 text-gray-700 font-bold transition-transform ${
                                        collapsedRows.has(row.rowNumber) ? '' : 'rotate-90'
                                      }`} 
                                      fill="currentColor" 
                                      viewBox="0 0 20 20"
                                      strokeWidth="2"
                                    >
                                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                    </svg>
                                  </button>
                                ) : (
                                  <div className="w-4 mr-1" />
                                )}
                                <span className="text-sm">{row[column.key] || ''}</span>
                              </div>
                            </div>
                          ) : column.key === 'taskName' ? (
                            <span>{row[column.key]}</span>
                          ) : (
                            <span>{row[column.key]}</span>
                          )}
                          {selectedCell === `${row.rowNumber}-${column.key}` && (
                            <div 
                              className="fill-handle absolute -bottom-1 -right-1 w-2 h-2 bg-blue-500 cursor-crosshair z-30 rounded-sm border border-blue-600"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const cellKey = `${row.rowNumber}-${column.key}`;
                                setIsDragging(true);
                                setIsFillDragging(true);
                                setDragStartCell(cellKey);
                                setDragEndCell(cellKey);
                              }}
                            >
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  ))}
                </motion.tr>
              ))}

            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center space-x-4">
          <span>COUNT: {getVisibleData().length}</span>
          <span>MIN: {(() => {
            const dates = getVisibleData().flatMap(row => [row.startDate, row.endDate]).filter(Boolean).map(d => new Date(d));
            return dates.length ? new Date(Math.min(...dates)).toLocaleDateString('en-GB') : 'N/A';
          })()}</span>
          <span>MAX: {(() => {
            const dates = getVisibleData().flatMap(row => [row.startDate, row.endDate]).filter(Boolean).map(d => new Date(d));
            return dates.length ? new Date(Math.max(...dates)).toLocaleDateString('en-GB') : 'N/A';
          })()}</span>
        </div>
      </div>

      {contextMenu.isOpen && (() => {
        const menuItems = getContextMenuItems();
        console.log('Context menu items:', menuItems);
        console.log('Copied row state:', copiedRow);
        return (
          <div
            className="fixed context-menu bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl py-2 z-[9999] min-w-[280px]"
            style={{
              left: contextMenu.position.x,
              top: contextMenu.position.y
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {menuItems.map((item, index) => {
              if (item.type === 'separator') {
                return <div key={index} className="h-px bg-gray-200 dark:bg-gray-600 my-2" />;
              }
              return (
                <button
                  key={index}
                  className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between transition-colors ${
                    item.danger ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-gray-200'
                  } ${
                    item.disabled ? 'opacity-40 cursor-not-allowed text-gray-400' : ''
                  }`}
                  onClick={() => {
                    if (!item.disabled) {
                      item.onClick();
                      setContextMenu({ ...contextMenu, isOpen: false });
                    }
                  }}
                  disabled={item.disabled}
                >
                  <div className="flex items-center space-x-3">
                    {item.icon && <item.icon className="w-4 h-4" />}
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {item.shortcut && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">{item.shortcut}</span>
                  )}
                </button>
              );
            })}
          </div>
        );
      })()}

      {columnContextMenu.isOpen && (
        <>
          <div 
            className="fixed inset-0 z-[9998]"
            onClick={() => {
              setColumnContextMenu({ ...columnContextMenu, isOpen: false });
              setShowSortSubmenu(false);
            }}
          />
          <div 
            data-column-menu
            className="fixed bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl py-2 z-[9999] min-w-[280px]"
            style={{ 
              left: columnContextMenu.position.x, 
              top: columnContextMenu.position.y 
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {columnContextMenuItems.map((item, index) => {
              if (item.type === 'separator') {
                return <div key={index} className="h-px bg-gray-200 dark:bg-gray-600 my-2" />;
              }
              return (
                <button
                  key={index}
                  className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between transition-colors ${
                    item.danger ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-gray-200'
                  } ${
                    item.disabled ? 'opacity-40 cursor-not-allowed text-gray-400' : ''
                  }`}
                  onClick={(e) => {
                    if (!item.disabled) {
                      item.onClick(e);
                      if (!item.hasSubmenu) {
                        setColumnContextMenu({ ...columnContextMenu, isOpen: false });
                        setShowSortSubmenu(false);
                      }
                    }
                  }}
                  onMouseEnter={(e) => {
                    if (item.hasSubmenu) {
                      const rect = e.target.getBoundingClientRect();
                      setSortSubmenuPosition({ x: rect.right + 5, y: rect.top });
                      setShowSortSubmenu(true);
                    } else {
                      setShowSortSubmenu(false);
                    }
                  }}
                  disabled={item.disabled}
                >
                  <div className="flex items-center space-x-3">
                    {item.icon && <item.icon className="w-4 h-4" />}
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {item.shortcut && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">{item.shortcut}</span>
                    )}
                    {item.hasSubmenu && (
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}

      <Modal isOpen={showColumnModal} onClose={() => setShowColumnModal(false)} title="Manage Columns" size="md">
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">Show or hide columns and reorder them by dragging.</p>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {columnOrder.map((columnKey, index) => {
              const column = allColumns.find(col => col.key === columnKey);
              if (!column) return null;
              
              return (
                <div 
                  key={column.key} 
                  className={`flex items-center justify-between p-3 border rounded-lg transition-all duration-200 cursor-move ${
                    draggedColumnIndex === index ? 'opacity-50 scale-95' : ''
                  } ${
                    dragOverIndex === index ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                  draggable
                  onDragStart={(e) => {
                    setDraggedColumnIndex(index);
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    setDragOverIndex(index);
                  }}
                  onDragLeave={() => {
                    setDragOverIndex(null);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (draggedColumnIndex !== null && draggedColumnIndex !== index) {
                      const newOrder = [...columnOrder];
                      const draggedKey = newOrder[draggedColumnIndex];
                      newOrder.splice(draggedColumnIndex, 1);
                      newOrder.splice(index, 0, draggedKey);
                      setColumnOrder(newOrder);
                    }
                    setDraggedColumnIndex(null);
                    setDragOverIndex(null);
                  }}
                  onDragEnd={() => {
                    setDraggedColumnIndex(null);
                    setDragOverIndex(null);
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!hiddenColumns.includes(column.key)}
                        onChange={() => toggleColumnVisibility(column.key)}
                        className="sr-only"
                        disabled={column.key === 'taskId'}
                      />
                      <div className={`w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center ${
                        !hiddenColumns.includes(column.key)
                          ? 'bg-blue-600 border-blue-600'
                          : 'bg-white border-gray-300 hover:border-gray-400'
                      }`}>
                        {!hiddenColumns.includes(column.key) && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </label>
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-900 dark:text-white font-medium">
                        {column.label}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {column.type === 'text' ? 'Text/Number' : 
                         column.type === 'dropdown' ? 'Dropdown' :
                         column.type === 'date' ? 'Date' :
                         column.type === 'contact' ? 'Contact' :
                         column.type === 'checkbox' ? 'Checkbox' :
                         column.type === 'status' ? 'Status' :
                         column.type.charAt(0).toUpperCase() + column.type.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!hiddenColumns.includes(column.key) ? (
                      <Eye className="w-4 h-4 text-green-500" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-600">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {allColumns.length - hiddenColumns.length} of {allColumns.length} columns visible
            </div>
            <div className="flex space-x-2">
              <Button variant="ghost" onClick={() => setShowColumnModal(false)}>Cancel</Button>
              <Button variant="primary" onClick={() => setShowColumnModal(false)}>Done</Button>
            </div>
          </div>
        </div>
      </Modal>

      {showSortSubmenu && (
        <div 
          className="fixed bg-white border border-gray-200 rounded-lg shadow-xl z-[10000] w-64 sort-submenu"
          style={{ 
            left: sortSubmenuPosition.x, 
            top: sortSubmenuPosition.y 
          }}
          onMouseEnter={() => setShowSortSubmenu(true)}
          onMouseLeave={() => setShowSortSubmenu(false)}
        >
          <div className="p-2">
            <div className="space-y-1">
              <button className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 rounded">
                <span>Sort A - Z</span>
                <span className="text-xs text-gray-500">Shift + A</span>
              </button>
              <button className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 rounded">
                <span>Sort Z - A</span>
                <span className="text-xs text-gray-500">Shift + D</span>
              </button>
              <div className="border-t border-gray-200 my-2"></div>
              <button className="w-full px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 rounded text-left">
                Clear all sorting on sheet
              </button>
            </div>
          </div>
        </div>
      )}

      {showColumnFilter && (
        <div 
          className="fixed bg-white border border-gray-200 rounded-lg shadow-xl z-[9999] w-64"
          style={{ 
            left: filterPosition.x, 
            top: filterPosition.y 
          }}
        >
          <div className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Sort A - Z</span>
                <span className="text-xs text-gray-500">Shift + A</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Sort Z - A</span>
                <span className="text-xs text-gray-500">Shift + D</span>
              </div>
              <div className="border-t border-gray-200 pt-2">
                <span className="text-sm text-gray-500">Clear all sorting on sheet</span>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 p-4">
            <div className="space-y-2">
              {filterColumnKey === 'assignedTo' ? (
                <>
                  <div className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                    <input type="checkbox" className="rounded" defaultChecked />
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs text-white">ED</div>
                      <span className="text-sm">Emily Davis</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                    <input type="checkbox" className="rounded" defaultChecked />
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center text-xs text-white">JD</div>
                      <span className="text-sm">John Doe</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                    <input type="checkbox" className="rounded" defaultChecked />
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-xs text-white">MJ</div>
                      <span className="text-sm">Mike Johnson</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                    <input type="checkbox" className="rounded" defaultChecked />
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs text-white">CL</div>
                      <span className="text-sm">Chris Lee</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-sm text-gray-500 p-2">No filter options available</div>
              )}
            </div>
          </div>
        </div>
      )}

      {showAddColumnModal && (
        <div 
          className="fixed bg-white border-2 border-blue-500 rounded-lg shadow-xl z-[9999] w-80 max-h-[500px] flex flex-col"
          style={{ 
            left: addColumnPosition.x, 
            top: addColumnPosition.y 
          }}
        >
          <div className="p-6 flex-1 overflow-y-auto">
            <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Column name</label>
              <input
                type="text"
                value={columnName}
                onChange={(e) => setColumnName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Column description <span className="text-gray-500">(optional)</span></label>
              <textarea
                rows={3}
                value={columnDescription}
                onChange={(e) => setColumnDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder=""
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Column type</label>
              <ProfessionalDropdown
                value={newColumnType}
                onChange={(value) => {
                  // Only process change if it's actually different
                  if (value === newColumnType) return;
                  
                  setNewColumnType(value);
                  // Initialize status colors when status type is selected
                  if (value === 'status') {
                    setTempDropdownOptions(['Pending', 'In Progress', 'Completed']);
                    setDropdownColors(prev => ({
                      ...prev,
                      temp: {
                        0: 'bg-yellow-500', // Pending
                        1: 'bg-blue-500',   // In Progress
                        2: 'bg-green-500'   // Completed
                      }
                    }));
                  } else if (value === 'dropdown') {
                    // Only clear temp options if we're in add mode, preserve existing in edit mode
                    if (columnPopupMode === 'add') {
                      setTempDropdownOptions([]);
                      setDropdownColors(prev => ({ ...prev, temp: {} }));
                    }
                    // In edit mode, keep existing temp dropdown options and colors
                  } else {
                    // For other column types, clear dropdown-specific temp data
                    if (columnPopupMode === 'add') {
                      setTempDropdownOptions([]);
                      setDropdownColors(prev => ({ ...prev, temp: {} }));
                    }
                  }
                }}
                options={[
                  { value: 'text', label: '📝 Text/Number' },
                  { value: 'dropdown', label: '☰ Dropdown list' },
                  { value: 'date', label: '📅 Date' },
                  { value: 'contact', label: '👤 Contact List' },
                  { value: 'checkbox', label: '☐ Checkbox' },
                  { value: 'symbols', label: '🔣 Symbols' },
                  { value: 'autonumber', label: '# Autonumber' },
                  { value: 'createdby', label: '👤 Created By' },
                  { value: 'createddate', label: '📅 Created Date' },
                  { value: 'comment', label: '💬 Latest Comment' },
                  { value: 'modifiedby', label: '👤 Modified By' },
                  { value: 'modifieddate', label: '📅 Modified Date' },
                  { value: 'status', label: '🔄 Status' }
                ]}
                placeholder="Select column type..."
                className="border-2 border-blue-500"
              />
            </div>
            
            {newColumnType === 'dropdown' && (
              <>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium text-gray-700">Limit to one value per cell</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only" />
                    <div className="w-12 h-6 bg-blue-500 rounded-full relative transition-colors duration-200">
                      <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 shadow-sm transition-transform duration-200"></div>
                    </div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium text-gray-700">Limit to list values only</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only" />
                    <div className="w-12 h-6 bg-gray-300 rounded-full relative transition-colors duration-200">
                      <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 shadow-sm transition-transform duration-200"></div>
                    </div>
                  </label>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">Dropdown list values</span>
                    <Clipboard className="w-5 h-5 text-gray-400" />
                  </div>
                  
                  {tempDropdownOptions.map((option, index) => {
                    const colorKey = `temp-${index}`;
                    const currentColor = dropdownColors.temp?.[index] || 'bg-transparent border-2 border-gray-400';
                    return (
                      <div key={index} className="flex items-center space-x-2 mb-2">
                        <div className="relative color-picker-container">
                          <div 
                            className={`w-3 h-3 rounded flex-shrink-0 cursor-pointer border-2 ${currentColor} ${
                              currentColor.includes('bg-transparent') ? 'relative' : 'border-gray-300'
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowColorPicker(showColorPicker === colorKey ? null : colorKey);
                            }}
                          >
                            {currentColor.includes('bg-transparent') && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-2 h-0.5 bg-red-500 rotate-45"></div>
                              </div>
                            )}
                          </div>
                          {showColorPicker === colorKey && (
                            <div className="fixed z-[100] bg-white border border-gray-300 rounded-lg shadow-xl p-3 color-picker-container" style={{
                              left: '50%',
                              top: '50%',
                              transform: 'translate(-50%, -50%)'
                            }}>
                              <div className="grid grid-cols-5 gap-2 max-w-xs">
                                {colorOptions.map((color) => (
                                  <div
                                    key={color.color}
                                    className={`w-7 h-7 rounded cursor-pointer border-2 hover:border-gray-400 ${color.color} ${
                                      currentColor === color.color ? 'border-gray-600 ring-2 ring-blue-500' : 'border-gray-200'
                                    } ${color.isTransparent ? 'relative' : ''}`}
                                    onClick={() => {
                                      setDropdownColors(prev => ({
                                        ...prev,
                                        temp: {
                                          ...prev.temp,
                                          [index]: color.color
                                        }
                                      }));
                                      setShowColorPicker(null);
                                    }}
                                    title={color.name}
                                  >
                                    {color.isTransparent && (
                                      <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-4 h-0.5 bg-red-500 rotate-45"></div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                              <button 
                                onClick={() => setShowColorPicker(null)}
                                className="mt-2 w-full px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                              >
                                Close
                              </button>
                            </div>
                          )}
                        </div>
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...tempDropdownOptions];
                            newOptions[index] = e.target.value;
                            setTempDropdownOptions(newOptions);
                          }}
                          className="flex-1 px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button
                          onClick={() => {
                            setTempDropdownOptions(prev => prev.filter((_, i) => i !== index));
                            setDropdownColors(prev => {
                              const newTemp = { ...prev.temp };
                              delete newTemp[index];
                              return { ...prev, temp: newTemp };
                            });
                          }}
                          className="p-1 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                  
                  <div className="max-h-40 overflow-y-auto mb-3">
                    <input
                      type="text"
                      placeholder="Enter or paste values"
                      value={newDropdownValue}
                      onChange={(e) => setNewDropdownValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newDropdownValue.trim()) {
                          const newIndex = tempDropdownOptions.length;
                          setTempDropdownOptions(prev => [...prev, newDropdownValue.trim()]);
                          setDropdownColors(prev => ({
                            ...prev,
                            temp: {
                              ...prev.temp,
                              [newIndex]: 'bg-transparent border-2 border-gray-400'
                            }
                          }));
                          setNewDropdownValue('');
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <button 
                    onClick={() => {
                      if (newDropdownValue.trim()) {
                        const newIndex = tempDropdownOptions.length;
                        setTempDropdownOptions(prev => [...prev, newDropdownValue.trim()]);
                        setDropdownColors(prev => ({
                          ...prev,
                          temp: {
                            ...prev.temp,
                            [newIndex]: 'bg-transparent border-2 border-gray-400'
                          }
                        }));
                        setNewDropdownValue('');
                      }
                    }}
                    className="w-full py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 flex items-center justify-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Value</span>
                  </button>
                </div>
              </>
            )}
            
            </div>
          </div>
          
          <div className="flex-shrink-0 border-t border-gray-200 p-4 bg-gray-50 rounded-b-lg">
            <div className="flex justify-end space-x-3">
              <Button 
                variant="ghost" 
                onClick={() => {
                  setShowAddColumnModal(false);
                  setColumnName('');
                  setColumnDescription('');
                  setTempDropdownOptions([]);
                  setNewDropdownValue('');
                  setNewColumnType('text');
                  setDropdownColors(prev => ({ ...prev, temp: {} }));
                }}
                className="px-6 py-2"
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={() => {
                  if (columnPopupMode === 'add') {
                    const newColumn = {
                      key: `column${nextColumnId}`,
                      label: columnName || `Column ${nextColumnId}`,
                      width: '150px',
                      type: newColumnType
                    };
                    
                    setAllColumns(prev => [...prev, newColumn]);
                    setColumnOrder(prev => [...prev, newColumn.key]);
                    setNextColumnId(prev => prev + 1);
                    setRowData(prev => {
                      const newData = { ...prev };
                      Object.keys(newData).forEach(rowNum => {
                        if (newData[rowNum]) {
                          newData[rowNum] = { ...newData[rowNum], [newColumn.key]: '' };
                        }
                      });
                      return newData;
                    });
                    
                    if (newColumnType === 'dropdown' && tempDropdownOptions.length > 0) {
                      setDropdownOptions(prev => ({ ...prev, [newColumn.key]: tempDropdownOptions }));
                      const tempColors = dropdownColors.temp || {};
                      setDropdownColors(prev => ({ 
                        ...prev, 
                        [newColumn.key]: tempColors,
                        temp: {}
                      }));
                    } else if (newColumnType === 'status') {
                      setDropdownOptions(prev => ({ ...prev, [newColumn.key]: ['Pending', 'In Progress', 'Completed'] }));
                      setDropdownColors(prev => ({
                        ...prev,
                        [newColumn.key]: {
                          0: 'bg-yellow-500', // Pending
                          1: 'bg-blue-500',   // In Progress
                          2: 'bg-green-500'   // Completed
                        },
                        temp: {}
                      }));
                    }
                  } else {
                    // Edit mode
                    setAllColumns(prev => prev.map(col => 
                      col.key === editingColumnData.key 
                        ? { ...col, label: columnName, type: newColumnType }
                        : col
                    ));
                    
                    if (newColumnType === 'dropdown' && tempDropdownOptions.length > 0) {
                      setDropdownOptions(prev => ({ ...prev, [editingColumnData.key]: tempDropdownOptions }));
                      const tempColors = dropdownColors.temp || {};
                      setDropdownColors(prev => ({ 
                        ...prev, 
                        [editingColumnData.key]: tempColors,
                        temp: {}
                      }));
                    } else if (newColumnType === 'status') {
                      setDropdownOptions(prev => ({ ...prev, [editingColumnData.key]: ['Pending', 'In Progress', 'Completed'] }));
                      setDropdownColors(prev => ({
                        ...prev,
                        [editingColumnData.key]: {
                          0: 'bg-yellow-500', // Pending
                          1: 'bg-blue-500',   // In Progress
                          2: 'bg-green-500'   // Completed
                        },
                        temp: {}
                      }));
                    }
                  }
                  
                  setShowAddColumnModal(false);
                  setColumnName('');
                  setColumnDescription('');
                  setTempDropdownOptions([]);
                  setNewDropdownValue('');
                  setNewColumnType('text');
                  setDropdownColors(prev => ({ ...prev, temp: {} }));
                }}
                className="px-6 py-2"
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}

      <Modal isOpen={showColumnPropertiesModal} onClose={() => setShowColumnPropertiesModal(false)} title={editingColumnKey && allColumns.find(col => col.key === editingColumnKey)?.label} size="xl">
        {editingColumnKey && (() => {
          const column = allColumns.find(col => col.key === editingColumnKey);
          const options = dropdownOptions[editingColumnKey] || [];
          return (
            <div className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Column name</label>
                <input
                  type="text"
                  defaultValue={column?.label}
                  onChange={(e) => renameColumn(editingColumnKey, e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base sm:text-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Column description (optional)</label>
                <textarea
                  rows={2}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm sm:text-base"
                  placeholder=""
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Column type</label>
                <ProfessionalDropdown
                  value={column?.type || 'text'}
                  onChange={(value) => changeColumnType(editingColumnKey, value)}
                  options={Array.from(new Map(Object.values(columnTypeCategories).flat().map(type => [type.value, type])).values()).map((type) => ({
                    value: type.value,
                    label: type.label
                  }))}
                  placeholder="Select column type..."
                  size="lg"
                />
              </div>
              {column?.type === 'dropdown' && (
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Limit to one value per cell</span>
                    <div className="w-10 h-5 sm:w-12 sm:h-6 bg-blue-500 rounded-full relative cursor-pointer">
                      <div className="w-4 h-4 sm:w-5 sm:h-5 bg-white rounded-full absolute top-0.5 right-0.5 shadow-sm"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Limit to list values only</span>
                    <div className="w-10 h-5 sm:w-12 sm:h-6 bg-gray-300 rounded-full relative cursor-pointer">
                      <div className="w-4 h-4 sm:w-5 sm:h-5 bg-white rounded-full absolute top-0.5 left-0.5 shadow-sm"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Dropdown list values</span>
                      <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-gray-300 rounded flex items-center justify-center">
                        <Copy className="w-3 h-3 text-gray-400" />
                      </div>
                    </div>
                    <div className="space-y-2 sm:space-y-3 max-h-60 overflow-y-auto relative">
                      {options.map((option, index) => {
                        const colorClass = dropdownColors[editingColumnKey]?.[index] || colorOptions[index % colorOptions.length].color;
                        return (
                          <div key={index} className="flex items-center space-x-2 sm:space-x-3 relative">
                            <div className="w-2 h-2 flex-shrink-0">
                              <div className="w-full h-full bg-gray-400 rounded-sm"></div>
                            </div>
                            <div className="relative color-picker-container">
                              <div 
                                className={`w-3 h-3 sm:w-4 sm:h-4 rounded flex-shrink-0 cursor-pointer border-2 border-gray-300 ${colorClass}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowColorPicker(showColorPicker === `${editingColumnKey}-${index}` ? null : `${editingColumnKey}-${index}`);
                                }}
                              ></div>
                              {showColorPicker === `${editingColumnKey}-${index}` && (
                                <div className="fixed z-[100] bg-white border border-gray-300 rounded-lg shadow-xl p-3 color-picker-container" style={{
                                  left: '50%',
                                  top: '50%',
                                  transform: 'translate(-50%, -50%)'
                                }}>
                                  <div className="grid grid-cols-5 gap-2 max-w-xs">
                                    {colorOptions.map((color) => (
                                      <div
                                        key={color.color}
                                        className={`w-7 h-7 rounded cursor-pointer border-2 hover:border-gray-400 ${color.color} ${
                                          colorClass === color.color ? 'border-gray-600 ring-2 ring-blue-500' : 'border-gray-200'
                                        } ${color.isTransparent ? 'relative' : ''}`}
                                        onClick={() => {
                                          setDropdownColors(prev => ({
                                            ...prev,
                                            [editingColumnKey]: {
                                              ...prev[editingColumnKey],
                                              [index]: color.color
                                            }
                                          }));
                                          setShowColorPicker(null);
                                        }}
                                        title={color.name}
                                      >
                                        {color.isTransparent && (
                                          <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-4 h-0.5 bg-red-500 rotate-45"></div>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                  <button 
                                    onClick={() => setShowColorPicker(null)}
                                    className="mt-2 w-full px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                                  >
                                    Close
                                  </button>
                                </div>
                              )}
                            </div>
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => {
                                const newOptions = [...options];
                                newOptions[index] = e.target.value;
                                setDropdownOptions(prev => ({ ...prev, [editingColumnKey]: newOptions }));
                              }}
                              className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                            />
                            <Button variant="ghost" size="sm" onClick={() => removeDropdownOption(editingColumnKey, index)} className="p-1 flex-shrink-0">
                              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                            </Button>
                          </div>
                        );
                      })}
                      <div className="flex items-center space-x-2 sm:space-x-3 relative">
                        <div className="w-2 h-2 flex-shrink-0">
                          <div className="w-full h-full bg-gray-400 rounded-sm"></div>
                        </div>
                        <div className="relative color-picker-container">
                          <div 
                            className="w-3 h-3 sm:w-4 sm:h-4 bg-yellow-400 rounded flex-shrink-0 cursor-pointer border-2 border-gray-300"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowColorPicker(showColorPicker === `${editingColumnKey}-new` ? null : `${editingColumnKey}-new`);
                            }}
                          ></div>
                          {showColorPicker === `${editingColumnKey}-new` && (
                            <div className="fixed z-[100] bg-white border border-gray-300 rounded-lg shadow-xl p-3 color-picker-container" style={{
                              left: '50%',
                              top: '50%',
                              transform: 'translate(-50%, -50%)'
                            }}>
                              <div className="grid grid-cols-4 gap-2">
                                {colorOptions.map((color) => (
                                  <div
                                    key={color.color}
                                    className={`w-8 h-8 rounded cursor-pointer border-2 hover:border-gray-400 ${color.color} border-gray-200`}
                                    onClick={() => {
                                      setShowColorPicker(null);
                                    }}
                                    title={color.name}
                                  />
                                ))}
                              </div>
                              <button 
                                onClick={() => setShowColorPicker(null)}
                                className="mt-2 w-full px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                              >
                                Close
                              </button>
                            </div>
                          )}
                        </div>
                        <input
                          type="text"
                          placeholder="Enter or paste values"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.target.value.trim()) {
                              addDropdownOption(editingColumnKey, e.target.value.trim());
                              e.target.value = '';
                            }
                          }}
                          className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 border-2 border-blue-500 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                        />
                        <div className="w-6 flex-shrink-0"></div>
                      </div>
                      <button 
                        onClick={() => addDropdownOption(editingColumnKey, 'New Option')}
                        className="w-full py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center justify-center space-x-2 text-sm sm:text-base"
                      >
                        <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>Add Value</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-600">
                <Button variant="ghost" onClick={() => setShowColumnPropertiesModal(false)} className="w-full sm:w-auto px-4 sm:px-6 py-2 order-2 sm:order-1">Cancel</Button>
                <Button variant="primary" onClick={() => setShowColumnPropertiesModal(false)} className="w-full sm:w-auto px-4 sm:px-6 py-2 order-1 sm:order-2">Apply</Button>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* Conditional Formatting Modal */}
      <ConditionalFormattingModal
        isOpen={showConditionalFormatting}
        onClose={() => setShowConditionalFormatting(false)}
        columns={visibleColumns}
        onSaveRules={setConditionalFormattingRules}
        existingRules={conditionalFormattingRules}
        rowData={rowData}
      />

      {/* Toast Notification */}
      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />
      </motion.div>
    </div>
  );
};

export default GridView;