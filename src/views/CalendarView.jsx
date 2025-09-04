import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, Calendar, Clock, Users, Filter, Settings, Download, Share2, Grid, List, MoreHorizontal, Edit, Trash2, Copy } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, startOfWeek, endOfWeek, addDays, isSameDay, startOfDay, addHours } from 'date-fns';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Dropdown from '../components/Dropdown';
import ContextMenu from '../components/ContextMenu';

const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // month, week, day, agenda
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [contextMenu, setContextMenu] = useState({ isOpen: false, position: { x: 0, y: 0 }, event: null });
  const [draggedEvent, setDraggedEvent] = useState(null);
  const [events, setEvents] = useState([
    { 
      id: 1, 
      title: 'Project Kickoff', 
      date: '2024-02-05', 
      time: '09:00',
      duration: 2,
      color: 'bg-blue-500',
      assignee: 'John Doe',
      type: 'meeting',
      description: 'Initial project planning meeting',
      location: 'Conference Room A'
    },
    { 
      id: 2, 
      title: 'Design Review', 
      date: '2024-02-12', 
      time: '14:00',
      duration: 1.5,
      color: 'bg-green-500',
      assignee: 'Jane Smith',
      type: 'review',
      description: 'Review design mockups and prototypes',
      location: 'Design Studio'
    },
    { 
      id: 3, 
      title: 'Development Sprint', 
      date: '2024-02-15', 
      time: '10:00',
      duration: 8,
      color: 'bg-purple-500',
      assignee: 'Mike Johnson',
      type: 'work',
      description: 'Sprint planning and development work',
      location: 'Dev Team Room'
    },
    { 
      id: 4, 
      title: 'Testing Phase', 
      date: '2024-02-22', 
      time: '13:00',
      duration: 4,
      color: 'bg-orange-500',
      assignee: 'Sarah Wilson',
      type: 'testing',
      description: 'QA testing and bug fixes',
      location: 'Testing Lab'
    },
  ]);

  const getCalendarDays = () => {
    if (viewMode === 'month') {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      const calendarStart = startOfWeek(monthStart);
      const calendarEnd = endOfWeek(monthEnd);
      return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    } else if (viewMode === 'week') {
      const weekStart = startOfWeek(currentDate);
      const weekEnd = endOfWeek(currentDate);
      return eachDayOfInterval({ start: weekStart, end: weekEnd });
    } else {
      return [currentDate];
    }
  };

  const calendarDays = getCalendarDays();

  const navigateCalendar = (direction) => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(currentDate.getMonth() + direction);
    } else if (viewMode === 'week') {
      newDate.setDate(currentDate.getDate() + (direction * 7));
    } else {
      newDate.setDate(currentDate.getDate() + direction);
    }
    setCurrentDate(newDate);
  };

  const getEventsForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return events.filter(event => event.date === dateStr);
  };

  const addNewEvent = (eventData) => {
    const newEvent = {
      id: Date.now(),
      title: eventData.title || 'New Event',
      date: eventData.date || format(currentDate, 'yyyy-MM-dd'),
      time: eventData.time || '09:00',
      duration: eventData.duration || 1,
      color: eventData.color || 'bg-blue-500',
      assignee: eventData.assignee || '',
      type: eventData.type || 'meeting',
      description: eventData.description || '',
      location: eventData.location || ''
    };
    setEvents(prev => [...prev, newEvent]);
    setShowAddEventModal(false);
  };

  const updateEvent = (eventId, updates) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId ? { ...event, ...updates } : event
    ));
  };

  const deleteEvent = (eventId) => {
    setEvents(prev => prev.filter(event => event.id !== eventId));
  };

  const duplicateEvent = (eventId) => {
    const eventToDuplicate = events.find(event => event.id === eventId);
    if (eventToDuplicate) {
      const newEvent = { 
        ...eventToDuplicate, 
        id: Date.now(), 
        title: `${eventToDuplicate.title} (Copy)` 
      };
      setEvents(prev => [...prev, newEvent]);
    }
  };

  const handleEventDrop = (eventId, newDate) => {
    updateEvent(eventId, { date: format(newDate, 'yyyy-MM-dd') });
    setDraggedEvent(null);
  };

  const handleContextMenu = (e, event) => {
    e.preventDefault();
    setContextMenu({
      isOpen: true,
      position: { x: e.clientX, y: e.clientY },
      event
    });
  };

  const getTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      slots.push({
        time: `${hour.toString().padStart(2, '0')}:00`,
        label: format(addHours(startOfDay(new Date()), hour), 'h:mm a')
      });
    }
    return slots;
  };

  const contextMenuItems = [
    { label: 'Edit Event', icon: Edit, onClick: () => setSelectedEvent(contextMenu.event) },
    { label: 'Duplicate Event', icon: Copy, onClick: () => duplicateEvent(contextMenu.event.id) },
    { label: 'Delete Event', icon: Trash2, onClick: () => deleteEvent(contextMenu.event.id) },
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {viewMode === 'month' && format(currentDate, 'MMMM yyyy')}
                {viewMode === 'week' && `Week of ${format(startOfWeek(currentDate), 'MMM d, yyyy')}`}
                {viewMode === 'day' && format(currentDate, 'EEEE, MMMM d, yyyy')}
                {viewMode === 'agenda' && 'Agenda View'}
              </h2>
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateCalendar(-1)}
                  className="p-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentDate(new Date())}
                >
                  Today
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateCalendar(1)}
                  className="p-2"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="primary" size="sm" onClick={() => setShowAddEventModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Event
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button variant="ghost" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="ghost" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button 
                variant={viewMode === 'month' ? 'primary' : 'ghost'} 
                size="sm" 
                onClick={() => setViewMode('month')}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Month
              </Button>
              <Button 
                variant={viewMode === 'week' ? 'primary' : 'ghost'} 
                size="sm" 
                onClick={() => setViewMode('week')}
              >
                <Grid className="w-4 h-4 mr-2" />
                Week
              </Button>
              <Button 
                variant={viewMode === 'day' ? 'primary' : 'ghost'} 
                size="sm" 
                onClick={() => setViewMode('day')}
              >
                <Clock className="w-4 h-4 mr-2" />
                Day
              </Button>
              <Button 
                variant={viewMode === 'agenda' ? 'primary' : 'ghost'} 
                size="sm" 
                onClick={() => setViewMode('agenda')}
              >
                <List className="w-4 h-4 mr-2" />
                Agenda
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button variant="ghost" size="sm">
                <Users className="w-4 h-4 mr-2" />
                Resources
              </Button>
            </div>
          </div>
        </div>

        <div className="p-4">
          {viewMode === 'month' && (
            <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-600 rounded-lg overflow-hidden">
              {/* Week Day Headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="bg-gray-50 dark:bg-gray-700 p-3 text-center">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{day}</span>
                </div>
              ))}
              {/* Calendar Days */}
              {calendarDays.map((date, index) => {
                const dayEvents = getEventsForDate(date);
                const isCurrentMonth = isSameMonth(date, currentDate);
                const isTodayDate = isToday(date);
                return (
                  <motion.div
                    key={date.toISOString()}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.01 }}
                    className={`bg-white dark:bg-gray-800 p-2 min-h-24 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      !isCurrentMonth ? 'opacity-50' : ''
                    } ${isTodayDate ? 'ring-2 ring-primary-500' : ''}`}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (draggedEvent) handleEventDrop(draggedEvent.id, date);
                    }}
                    onDragOver={(e) => e.preventDefault()}
                  >
                    <div className="flex flex-col h-full">
                      <span className={`text-sm font-medium mb-1 ${
                        isTodayDate ? 'text-primary-600 dark:text-primary-400' : 'text-gray-900 dark:text-white'
                      }`}>
                        {format(date, 'd')}
                      </span>
                      <div className="flex-1 space-y-1">
                        {dayEvents.slice(0, 3).map((event) => (
                          <motion.div
                            key={event.id}
                            whileHover={{ scale: 1.02 }}
                            className={`${event.color} text-white text-xs px-2 py-1 rounded truncate cursor-pointer hover:shadow-sm transition-shadow`}
                            title={`${event.title} - ${event.time}`}
                            draggable
                            onDragStart={() => setDraggedEvent(event)}
                            onContextMenu={(e) => handleContextMenu(e, event)}
                            onClick={() => setSelectedEvent(event)}
                          >
                            {event.title}
                          </motion.div>
                        ))}
                        {dayEvents.length > 3 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 px-2">
                            +{dayEvents.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {viewMode === 'week' && (
            <div className="grid grid-cols-8 gap-px bg-gray-200 dark:bg-gray-600 rounded-lg overflow-hidden">
              <div className="bg-gray-50 dark:bg-gray-700 p-3"></div>
              {calendarDays.map((date) => (
                <div key={date.toISOString()} className="bg-gray-50 dark:bg-gray-700 p-3 text-center">
                  <div className={`text-sm font-medium ${isToday(date) ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'}`}>
                    {format(date, 'EEE')}
                  </div>
                  <div className={`text-lg ${isToday(date) ? 'text-primary-600 dark:text-primary-400' : 'text-gray-900 dark:text-white'}`}>
                    {format(date, 'd')}
                  </div>
                </div>
              ))}
              {getTimeSlots().map((slot) => (
                <React.Fragment key={slot.time}>
                  <div className="bg-gray-50 dark:bg-gray-700 p-2 text-xs text-gray-600 dark:text-gray-400 border-r border-gray-200 dark:border-gray-600">
                    {slot.label}
                  </div>
                  {calendarDays.map((date) => {
                    const dayEvents = getEventsForDate(date).filter(event => event.time === slot.time);
                    return (
                      <div key={`${date.toISOString()}-${slot.time}`} className="bg-white dark:bg-gray-800 p-1 min-h-12 border-r border-gray-200 dark:border-gray-600">
                        {dayEvents.map((event) => (
                          <div
                            key={event.id}
                            className={`${event.color} text-white text-xs px-2 py-1 rounded mb-1 cursor-pointer`}
                            style={{ height: `${event.duration * 20}px` }}
                            onClick={() => setSelectedEvent(event)}
                          >
                            {event.title}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          )}

          {viewMode === 'day' && (
            <div className="space-y-2">
              {getTimeSlots().map((slot) => {
                const slotEvents = getEventsForDate(currentDate).filter(event => event.time === slot.time);
                return (
                  <div key={slot.time} className="flex items-start space-x-4 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
                    <div className="w-20 text-sm text-gray-600 dark:text-gray-400 pt-1">
                      {slot.label}
                    </div>
                    <div className="flex-1 min-h-12">
                      {slotEvents.map((event) => (
                        <div
                          key={event.id}
                          className={`${event.color} text-white p-3 rounded mb-2 cursor-pointer`}
                          onClick={() => setSelectedEvent(event)}
                        >
                          <div className="font-medium">{event.title}</div>
                          <div className="text-xs opacity-75">{event.location}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {viewMode === 'agenda' && (
            <div className="space-y-4">
              {events.map((event) => (
                <div key={event.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 ${event.color} rounded-full`}></div>
                        <h3 className="font-medium text-gray-900 dark:text-white">{event.title}</h3>
                      </div>
                      <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        <div>{format(new Date(event.date), 'EEEE, MMMM d, yyyy')} at {event.time}</div>
                        <div>{event.location}</div>
                        <div className="mt-1">{event.description}</div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="p-1">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Modal isOpen={showAddEventModal} onClose={() => setShowAddEventModal(false)} title="Add New Event" size="lg">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Event Title</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter event title"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time</label>
                <input
                  type="time"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration (hours)</label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assignee</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter assignee name"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter location"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter event description"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="ghost" onClick={() => setShowAddEventModal(false)}>Cancel</Button>
              <Button variant="primary" onClick={() => addNewEvent({})}>Add Event</Button>
            </div>
          </div>
        </Modal>

        <ContextMenu
          isOpen={contextMenu.isOpen}
          position={contextMenu.position}
          onClose={() => setContextMenu({ ...contextMenu, isOpen: false })}
          items={contextMenuItems}
        />
      </div>
    </motion.div>
  );
};

export default CalendarView;