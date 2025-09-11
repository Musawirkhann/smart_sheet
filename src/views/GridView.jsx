import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Filter, Search, Plus, MoreHorizontal, Star, Copy, Trash2, Edit, ArrowUp, ArrowDown, Settings, Download, Share2, Scissors, Clipboard, FileText, RotateCcw, Undo2, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify, DollarSign, Percent, Hash, Quote, Lock, HelpCircle, Cloud, Minus, MessageCircle, Paperclip, Eye, EyeOff, GripVertical, Palette, Indent, Outdent } from 'lucide-react';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Dropdown from '../components/Dropdown';
import ContextMenu from '../components/ContextMenu';
import ColorPicker from '../components/ColorPicker';

const GridView = () => {
  const [data, setData] = useState([
    { id: 1, taskId: '1', taskName: 'Project Kickoff', dependencies: 'None', assignedTo: 'Emily Davis', condition: 'green', startDate: '09/03/24' },
    { id: 2, taskId: '2', taskName: 'Design Phase', dependencies: '1', assignedTo: 'John Doe', condition: 'red', startDate: '09/10/24' },
    { id: 3, taskId: '3', taskName: 'Development', dependencies: '2', assignedTo: 'Mike Johnson', condition: 'yellow', startDate: '09/17/24' },
    { id: 4, taskId: '4', taskName: 'Testing Phase', dependencies: '3', assignedTo: 'Chris Lee', condition: 'yellow', startDate: '10/01/24' },
    { id: 5, taskId: '5', taskName: 'Deployment', dependencies: '4', assignedTo: 'Chris Lee', condition: 'red', startDate: '10/15/24' },
  ]);

  const [editingCell, setEditingCell] = useState(null);
  const [hoveredCell, setHoveredCell] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedCell, setSelectedCell] = useState(null);
  const [contextMenu, setContextMenu] = useState({ isOpen: false, position: { x: 0, y: 0 }, rowId: null });
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
  const [newColumnType, setNewColumnType] = useState('text');
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [draggedColumn, setDraggedColumn] = useState(null);
  const [hiddenColumns, setHiddenColumns] = useState([]);
  const [cellStyles, setCellStyles] = useState({});
  const [rowIndents, setRowIndents] = useState({});
  const [showFormatTools, setShowFormatTools] = useState(false);
  const [columnWidths, setColumnWidths] = useState({});
  const [resizing, setResizing] = useState({ column: null, startX: 0, startWidth: 0 });
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [frozenColumns, setFrozenColumns] = useState([]);
  const [showColumnPropertiesModal, setShowColumnPropertiesModal] = useState(false);
  const [editingColumnKey, setEditingColumnKey] = useState(null);
  const [dropdownOptions, setDropdownOptions] = useState({});
  const [dropdownColors, setDropdownColors] = useState({});
  const dragRef = useRef(null);

  const getHexColor = (bgClass) => {
    const colorMap = {
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
    recommended: [
      { value: 'text', label: 'Text/number', icon: '📝' },
      { value: 'dropdown', label: 'Dropdown list', icon: '☰' },
      { value: 'date', label: 'Date', icon: '📅' },
      { value: 'checkbox', label: 'Checkbox', icon: '☐' }
    ],
    basic: [
      { value: 'text', label: 'Text/number', icon: '📝' },
      { value: 'autonumber', label: 'Auto-number', icon: '#' }
    ],
    planning: [
      { value: 'dropdown', label: 'Dropdown list', icon: '☰' },
      { value: 'checkbox', label: 'Checkbox', icon: '☐' },
      { value: 'status', label: 'Status', icon: '◐' },
      { value: 'progress', label: 'Progress', icon: '📊' },
      { value: 'trends', label: 'Trends', icon: '📈' },
      { value: 'ratings', label: 'Ratings', icon: '⭐' }
    ],
    date: [
      { value: 'date', label: 'Date', icon: '📅' },
      { value: 'createddate', label: 'Created date', icon: '📅' },
      { value: 'modifieddate', label: 'Modified date', icon: '📅' },
      { value: 'duration', label: 'Duration', icon: '⏱️' }
    ],
    people: [
      { value: 'contact', label: 'Contact list', icon: '👤' },
      { value: 'createdby', label: 'Created by', icon: '👤' },
      { value: 'modifiedby', label: 'Modified by', icon: '👤' },
      { value: 'comment', label: 'Latest comment', icon: '💬' }
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
    // Clear data when column type changes
    setData(prev => prev.map(row => ({ ...row, [columnKey]: '' })));
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
        [newIndex]: colorOptions[0].color // Default to transparent
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
      data: JSON.parse(JSON.stringify(data)),
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
      setData(prevState.data);
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
      setData(nextState.data);
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
  ]);

  const [columnOrder, setColumnOrder] = useState(allColumns.map(col => col.key));
  const [nextColumnId, setNextColumnId] = useState(allColumns.length + 1);

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
    setData(prev => prev.map(row => ({ ...row, [newColumn.key]: '' })));
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

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          undo();
        } else if ((e.key === 'y') || (e.key === 'z' && e.shiftKey)) {
          e.preventDefault();
          redo();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, history]);

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
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showColorPicker, showTextColorPicker, showBackgroundColorPicker]);

  const handleColumnClick = (e, columnKey) => {
    if (e.target.closest('.resize-handle')) return;
    setSelectedColumn(columnKey);
    setSelectedCell(null);
  };

  const handleCellEdit = (rowId, column, value) => {
    saveToHistory({ type: 'cell_edit', rowId, column, oldValue: data.find(r => r.id === rowId)?.[column], newValue: value });
    setData(prev => prev.map(row => 
      row.id === rowId ? { ...row, [column]: value } : row
    ));
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

  const indentRow = (rowId) => {
    setRowIndents(prev => ({
      ...prev,
      [rowId]: Math.min((prev[rowId] || 0) + 1, 5)
    }));
  };

  const outdentRow = (rowId) => {
    setRowIndents(prev => ({
      ...prev,
      [rowId]: Math.max((prev[rowId] || 0) - 1, 0)
    }));
  };

  const getRowIndent = (rowId) => {
    return rowIndents[rowId] || 0;
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
    setData(prev => prev.map(row => ({ ...row, [newColumn.key]: '' })));
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
    setData(prev => prev.map(row => ({ ...row, [newColumn.key]: '' })));
  };

  const deleteColumn = (columnKey) => {
    setAllColumns(prev => prev.filter(col => col.key !== columnKey));
    setColumnOrder(prev => prev.filter(key => key !== columnKey));
    setHiddenColumns(prev => prev.filter(key => key !== columnKey));
    setFrozenColumns(prev => prev.filter(key => key !== columnKey));
    setData(prev => prev.map(row => {
      const { [columnKey]: removed, ...rest } = row;
      return rest;
    }));
  };

  const toggleColumnFreeze = (columnKey) => {
    setFrozenColumns(prev => 
      prev.includes(columnKey)
        ? prev.filter(key => key !== columnKey)
        : [...prev, columnKey]
    );
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
    return cellStyles[cellKey] || {};
  };

  const handleRowSelect = (rowId) => {
    setSelectedRows(prev => 
      prev.includes(rowId) 
        ? prev.filter(id => id !== rowId)
        : [...prev, rowId]
    );
  };

  const handleContextMenu = (e, rowId) => {
    e.preventDefault();
    setContextMenu({
      isOpen: true,
      position: { x: e.clientX, y: e.clientY },
      rowId
    });
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
      case 'Complete': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Not Started': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAssigneeInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getAssigneeColor = (name) => {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500'];
    const index = name.length % colors.length;
    return colors[index];
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

  const contextMenuItems = [
    { label: 'Cut', icon: Scissors, shortcut: '⌘ + X', onClick: () => {} },
    { label: 'Copy', icon: Copy, shortcut: '⌘ + C', onClick: () => {} },
    { label: 'Paste', icon: Clipboard, shortcut: '⌘ + V', onClick: () => {} },
    { label: 'Insert row above', shortcut: 'Ctrl + I', onClick: () => {} },
    { label: 'Edit details', icon: Edit, shortcut: '⌘ + E', onClick: () => {} },
    { label: 'Delete row', icon: Trash2, shortcut: '⌘ + Delete', onClick: () => {} },
    { label: 'Copy row link', shortcut: 'Option + Shift + C', onClick: () => {} },
    { label: 'Promote child row', shortcut: '⌘ + [', onClick: () => outdentRow(contextMenu.rowId) },
    { label: 'Make child row', shortcut: '⌘ + ]', onClick: () => indentRow(contextMenu.rowId) },
    { label: 'Lock row', icon: Lock, shortcut: '⌘ + Shift + L', onClick: () => {} },
  ];

  const columnContextMenuItems = [
    { label: 'Insert column left', shortcut: 'Ctrl + Shift + I', onClick: () => insertColumnLeft(columnContextMenu.columnKey) },
    { label: 'Insert column right', onClick: () => insertColumnRight(columnContextMenu.columnKey) },
    { label: 'Rename column', icon: Edit, onClick: () => {
      setEditingColumnKey(columnContextMenu.columnKey);
      setShowColumnPropertiesModal(true);
    } },
    { label: 'Delete column', icon: Trash2, shortcut: '⌘ + Shift + Delete', onClick: () => deleteColumn(columnContextMenu.columnKey) },
    { label: 'Filter', icon: Filter, onClick: () => {} },
    { label: 'Sort rows', onClick: () => {} },
    { label: 'Lock column', icon: Lock, shortcut: '⌘ + Shift + L', onClick: () => {} },
    { label: 'Resize column', shortcut: 'Opt + R', onClick: () => {} },
    { label: 'Hide column', icon: EyeOff, onClick: () => toggleColumnVisibility(columnContextMenu.columnKey) },
    { 
      label: frozenColumns.includes(columnContextMenu.columnKey) ? 'Unfreeze column' : 'Freeze column', 
      onClick: () => toggleColumnFreeze(columnContextMenu.columnKey) 
    },
    { label: 'Column properties', onClick: () => {
      setEditingColumnKey(columnContextMenu.columnKey);
      setShowColumnPropertiesModal(true);
    } },
  ];



  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-900 min-h-screen"
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
      <div className="flex items-center justify-between p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Dropdown 
              options={[{ value: 'table', label: 'Table' }]} 
              value="Table" 
              className="w-20" 
            />
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-1" 
              onClick={undo}
              disabled={historyIndex <= 0}
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-1" 
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              title="Redo (Ctrl+Y)"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="p-1">
              <Search className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="p-1">
              <Filter className="w-4 h-4" />
            </Button>
            <Button variant={showFormatTools ? "primary" : "ghost"} size="sm" onClick={() => setShowFormatTools(!showFormatTools)}>
              <Palette className="w-4 h-4 mr-2" />
              Format
            </Button>
            <Button variant="ghost" size="sm">
              Format rules
            </Button>
            <Button variant="ghost" size="sm">
              Formulas
            </Button>
            <Button variant="ghost" size="sm" className="p-1">
              <MessageCircle className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="p-1">
              <Paperclip className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="p-1">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="p-1">
          <Settings className="w-4 h-4" />
        </Button>
      </div>

      {/* Formatting Toolbar */}
      {showFormatTools && (
      <div className="flex items-center space-x-4 p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
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
                        const hexColor = getHexColor(color.color);
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
      <div className="overflow-x-auto">
        <table className="border-collapse" style={{ tableLayout: 'fixed', width: 'max-content' }}>
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800">
              <th className="w-8 p-2 border border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-center">
                  <span className="text-xs text-gray-500">#</span>
                </div>
              </th>
              {visibleColumns.map((column) => (
                <th
                  key={column.key}
                  className={`p-2 border border-gray-200 dark:border-gray-600 text-left cursor-pointer relative group ${
                    selectedColumn === column.key ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-50 dark:bg-gray-800'
                  } ${
                    frozenColumns.includes(column.key) ? 'sticky left-0 z-10 shadow-md' : ''
                  }`}
                  style={{ width: getColumnWidth(column.key) }}
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
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        {column.label}
                      </span>
                      {column.key === 'dependencies' && (
                        <HelpCircle className="w-3 h-3 text-gray-400" />
                      )}
                      {column.key === 'gfgfgf' && (
                        <HelpCircle className="w-3 h-3 text-gray-400" />
                      )}
                    </div>
                    <ChevronDown className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" 
                      onClick={(e) => handleColumnContextMenu(e, column.key)} />
                  </div>
                  <div
                    className="resize-handle absolute top-0 right-0 w-2 h-full cursor-col-resize hover:bg-blue-500 transition-colors z-10"
                    onMouseDown={(e) => handleResizeStart(e, column.key)}
                  />
                </th>
              ))}
              <th className="p-2 border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 w-32">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowAddColumnModal(true)}
                  className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 w-full justify-center"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-xs">Column</span>
                </Button>
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <motion.tr
                key={row.id}
                className={`hover:bg-blue-50 dark:hover:bg-blue-900/20 ${
                  selectedRows.includes(row.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
                onContextMenu={(e) => handleContextMenu(e, row.id)}
              >
                <td className="p-2 border border-gray-200 dark:border-gray-600 text-center bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center justify-center space-x-1">
                    {getRowIndent(row.id) > 0 && (
                      <div className="flex">
                        {Array.from({ length: getRowIndent(row.id) }).map((_, i) => (
                          <div key={i} className="w-2 h-px bg-gray-300 dark:bg-gray-600 mr-1" />
                        ))}
                      </div>
                    )}
                    <span className="text-xs text-gray-600 dark:text-gray-400">{index + 1}</span>
                  </div>
                </td>
                {visibleColumns.map((column) => (
                  <td
                    key={`${row.id}-${column.key}`}
                    className={`p-2 border border-gray-200 dark:border-gray-600 ${
                      selectedCell === `${row.id}-${column.key}` ? 'outline outline-2 outline-blue-500 outline-offset-[-1px] bg-blue-50' : 
                      selectedColumn === column.key ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    } ${
                      frozenColumns.includes(column.key) ? 'sticky left-0 z-10 bg-white dark:bg-gray-900 shadow-md' : ''
                    }`}
                    style={{ width: getColumnWidth(column.key), ...getCellStyle(row.id, column.key) }}
                    onMouseEnter={() => {
                      if (column.type === 'dropdown') {
                        setHoveredCell(`${row.id}-${column.key}`);
                      }
                    }}
                    onMouseLeave={() => {
                      if (column.type === 'dropdown') {
                        setHoveredCell(null);
                      }
                    }}
                    onClick={() => {
                      const cellKey = `${row.id}-${column.key}`;
                      setSelectedCell(cellKey);
                      setSelectedColumn(null);
                      
                      // Update editor state immediately
                      const currentStyle = cellStyles[cellKey] || {};
                      setFontSize(currentStyle.fontSize ? currentStyle.fontSize.replace('px', '') : '16');
                      setFontFamily(currentStyle.fontFamily || 'Arial');
                      setIsBold(currentStyle.fontWeight === 'bold');
                      setIsItalic(currentStyle.fontStyle === 'italic');
                      setIsUnderline(currentStyle.textDecoration === 'underline');
                      setTextColor(currentStyle.color || '#000000');
                      setTextAlign(currentStyle.textAlign || 'left');
                      
                      if (column.type === 'text' || column.type === 'autonumber' || column.type === 'createdby' || column.type === 'modifiedby' || column.type === 'comment') {
                        setEditingCell(cellKey);
                      } else if (column.type === 'dropdown') {
                        setHoveredCell(cellKey);
                      }
                    }}
                  >
                    {editingCell === `${row.id}-${column.key}` ? (
                      <input
                        type="text"
                        defaultValue={row[column.key]}
                        onBlur={(e) => handleCellEdit(row.id, column.key, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleCellEdit(row.id, column.key, e.target.value);
                          }
                        }}
                        className="w-full px-1 py-0 border-0 bg-transparent text-sm focus:outline-none rounded"
                        style={getCellStyle(row.id, column.key)}
                        autoFocus
                      />
                    ) : (
                      <div className="text-sm" style={getCellStyle(row.id, column.key)}>
                        {column.type === 'dropdown' ? (
                          hoveredCell === `${row.id}-${column.key}` ? (
                            <select
                              value={row[column.key] || ''}
                              onChange={(e) => {
                                handleCellEdit(row.id, column.key, e.target.value);
                                setHoveredCell(null);
                              }}
                              onBlur={() => setHoveredCell(null)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              autoFocus
                            >
                              <option value="">Select...</option>
                              {(dropdownOptions[column.key] || []).map((opt, idx) => (
                                <option key={idx} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <div className="px-2 py-1 text-sm">
                              {row[column.key] ? (
                                <span className={`px-2 py-1 rounded ${
                                  (() => {
                                    const optIndex = (dropdownOptions[column.key] || []).indexOf(row[column.key]);
                                    const colorClass = dropdownColors[column.key]?.[optIndex] || colorOptions[0].color;
                                    const isTransparent = colorClass.includes('bg-transparent');
                                    return isTransparent ? 'text-gray-700 border border-gray-300' : `${colorClass} text-white`;
                                  })()
                                }`}>
                                  {row[column.key]}
                                </span>
                              ) : (
                                <span className="text-gray-500"></span>
                              )}
                            </div>
                          )
                        ) : column.type === 'checkbox' ? (
                          <div className="flex justify-center">
                            <input
                              type="checkbox"
                              checked={row[column.key] === 'true' || row[column.key] === true}
                              onChange={(e) => handleCellEdit(row.id, column.key, e.target.checked.toString())}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </div>
                        ) : column.type === 'date' ? (
                          <input
                            type="date"
                            value={row[column.key] || ''}
                            onChange={(e) => handleCellEdit(row.id, column.key, e.target.value)}
                            className="w-full px-2 py-1 border-0 bg-transparent text-sm focus:outline-none"
                          />
                        ) : column.type === 'contact' ? (
                          row[column.key] ? (
                            <div className="flex items-center space-x-2">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white ${getAssigneeColor(row[column.key])}`}>
                                {getAssigneeInitials(row[column.key])}
                              </div>
                              <span>{row[column.key]}</span>
                            </div>
                          ) : (
                            <span className="text-gray-500">Unassigned</span>
                          )
                        ) : column.type === 'condition' ? (
                          <div className="flex justify-center">
                            <div className={`w-4 h-4 rounded-full ${getConditionColor(row[column.key])}`}></div>
                          </div>
                        ) : column.type === 'autonumber' ? (
                          <span className="text-gray-600">#{row.id}</span>
                        ) : column.type === 'status' ? (
                          <span className={`px-2 py-1 rounded text-xs ${getStatusColor(row[column.key])}`}>
                            {row[column.key] || 'Not Started'}
                          </span>
                        ) : column.key === 'taskName' ? (
                          <div className="flex items-center">
                            {getRowIndent(row.id) > 0 && (
                              <div className="flex mr-2">
                                {Array.from({ length: getRowIndent(row.id) }).map((_, i) => (
                                  <div key={i} className="w-4 border-l border-gray-300 dark:border-gray-600 mr-1" />
                                ))}
                              </div>
                            )}
                            <span>
                              {row[column.key]}
                            </span>
                          </div>
                        ) : (
                          <span>{row[column.key]}</span>
                        )}
                      </div>
                    )}
                  </td>
                ))}
              </motion.tr>
            ))}
            {/* Add Row */}
            <tr>
              <td className="p-2 border border-gray-200 dark:border-gray-600 text-center bg-gray-50 dark:bg-gray-800">
                <Button variant="ghost" size="sm" className="p-0 w-6 h-6">
                  <Plus className="w-3 h-3" />
                </Button>
              </td>
              <td colSpan={visibleColumns.length} className="p-2 border border-gray-200 dark:border-gray-600"></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center space-x-4">
          <span>COUNT: {data.length}</span>
          <span>MIN: 09/02/25</span>
          <span>MAX: 09/08/25</span>
        </div>
      </div>

      <ContextMenu
        isOpen={contextMenu.isOpen}
        position={contextMenu.position}
        onClose={() => setContextMenu({ ...contextMenu, isOpen: false })}
        items={contextMenuItems}
      />

      <ContextMenu
        isOpen={columnContextMenu.isOpen}
        position={columnContextMenu.position}
        onClose={() => setColumnContextMenu({ ...columnContextMenu, isOpen: false })}
        items={columnContextMenuItems}
      />

      <Modal isOpen={showColumnModal} onClose={() => setShowColumnModal(false)} title="Manage Columns" size="md">
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">Show or hide columns and reorder them by dragging.</p>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {allColumns.map((column) => (
              <div key={column.key} className="flex items-center justify-between p-2 border border-gray-200 dark:border-gray-600 rounded">
                <div className="flex items-center space-x-3">
                  <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                  <input
                    type="checkbox"
                    checked={!hiddenColumns.includes(column.key)}
                    onChange={() => toggleColumnVisibility(column.key)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-900 dark:text-white font-medium">
                    {column.label}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {!hiddenColumns.includes(column.key) ? (
                    <Eye className="w-4 h-4 text-green-500" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </div>
            ))}
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

      <Modal isOpen={showAddColumnModal} onClose={() => setShowAddColumnModal(false)} title="Add Column" size="lg">
        <div className="space-y-4 sm:space-y-6 max-h-96 overflow-y-auto">
          {Object.entries(columnTypeCategories).map(([category, types]) => (
            <div key={category}>
              <h3 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 sm:mb-3">
                {category === 'planning' ? 'Planning/Status' : category.charAt(0).toUpperCase() + category.slice(1)}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {types.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => {
                      const newColumn = {
                        key: `column${nextColumnId}`,
                        label: `Column ${nextColumnId}`,
                        width: '150px',
                        type: type.value
                      };
                      
                      setAllColumns(prev => [...prev, newColumn]);
                      setColumnOrder(prev => [...prev, newColumn.key]);
                      setNextColumnId(prev => prev + 1);
                      setData(prev => prev.map(row => ({ ...row, [newColumn.key]: '' })));
                      setShowAddColumnModal(false);
                    }}
                    className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-left transition-colors w-full"
                  >
                    <span className="text-base sm:text-lg flex-shrink-0">{type.icon}</span>
                    <span className="text-xs sm:text-sm text-gray-900 dark:text-white truncate">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Modal>

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
                <div className="relative">
                  <select
                    value={column?.type || 'text'}
                    onChange={(e) => changeColumnType(editingColumnKey, e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none text-sm sm:text-base"
                  >
                    {Object.values(columnTypeCategories).flat().map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none" />
                </div>
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
    </motion.div>
  );
};

export default GridView;