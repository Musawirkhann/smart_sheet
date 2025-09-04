import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import GridView from './views/GridView';
import GanttView from './views/GanttView';
import CalendarView from './views/CalendarView';

function App() {
  const [activeView, setActiveView] = useState('grid');

  const renderView = () => {
    switch (activeView) {
      case 'grid':
        return <GridView />;
      case 'gantt':
        return <GanttView />;
      case 'calendar':
        return <CalendarView />;
      default:
        return <GridView />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar activeView={activeView} setActiveView={setActiveView} />
      
      <AnimatePresence mode="wait">
        <motion.div
          key={activeView}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {renderView()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default App;