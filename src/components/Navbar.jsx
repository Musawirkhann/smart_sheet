import { Moon, Sun, Grid3X3, Calendar, BarChart3 } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import Button from './Button';

const Navbar = ({ activeView, setActiveView }) => {
  const { theme, toggleTheme } = useTheme();

  const views = [
    { id: 'grid', label: 'Grid', icon: Grid3X3 },
    { id: 'gantt', label: 'Gantt', icon: BarChart3 },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
  ];

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
              <Grid3X3 className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">SmartSheet</h1>
          </div>
          
          <div className="flex items-center space-x-1">
            {views.map(({ id, label, icon: Icon }) => (
              <Button
                key={id}
                variant={activeView === id ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setActiveView(id)}
                className="flex items-center space-x-2"
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </Button>
            ))}
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className="p-2"
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;