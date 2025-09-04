# SmartSheet UI - Professional React Dashboard

A modern, professional UI replicating Smartsheet's interface with Grid, Gantt, and Calendar views built with React, TailwindCSS, and Framer Motion.

## ✨ Features

- **Grid View**: Editable spreadsheet-like interface with inline editing, sorting, and filtering
- **Gantt View**: Timeline visualization with task bars, progress tracking, and zoom controls
- **Calendar View**: Monthly calendar with drag-and-drop events and professional styling
- **Dark/Light Mode**: Toggle between themes with smooth transitions
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Professional Animations**: Smooth micro-interactions and page transitions
- **Modern UI Components**: Glassmorphism effects and consistent design system

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to `http://localhost:5173`

### Build for Production
```bash
npm run build
npm run preview
```

## 🎨 Design System

### Color Palette
- **Primary**: Blue tones (#0ea5e9, #0284c7, #0369a1)
- **Secondary**: Gray tones (#64748b, #475569, #334155)
- **Accent**: Green (#10b981, #059669)

### Typography
- **Font**: Inter (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700

### Components
- **Button**: Multiple variants (primary, secondary, ghost) with hover animations
- **Theme Toggle**: Smooth dark/light mode switching
- **Navigation**: Clean tab-based view switching

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Button.jsx      # Animated button component
│   └── Navbar.jsx      # Navigation with theme toggle
├── views/              # Main view components
│   ├── GridView.jsx    # Spreadsheet interface
│   ├── GanttView.jsx   # Timeline visualization
│   └── CalendarView.jsx # Calendar interface
├── hooks/              # Custom React hooks
│   └── useTheme.js     # Theme management
└── utils/              # Utility functions
```

## 🛠️ Tech Stack

- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Lucide React** - Modern icon library
- **date-fns** - Date manipulation utilities
- **clsx** - Conditional className utility

## 🎯 Key Features Implemented

### Grid View
- ✅ Editable cells with inline editing
- ✅ Status and priority badges with color coding
- ✅ Search and filter functionality
- ✅ Hover effects and smooth animations
- ✅ Responsive table design

### Gantt View
- ✅ Timeline visualization with task bars
- ✅ Progress indicators on task bars
- ✅ Zoom controls (Day/Week/Month)
- ✅ Color-coded tasks
- ✅ Smooth task bar animations

### Calendar View
- ✅ Monthly calendar grid
- ✅ Event display with color coding
- ✅ Month navigation
- ✅ Today highlighting
- ✅ Responsive calendar layout

### Theme System
- ✅ Dark/Light mode toggle
- ✅ Persistent theme storage
- ✅ Smooth theme transitions
- ✅ Consistent color system

## 🎨 Customization

### Adding New Themes
Edit `tailwind.config.js` to add custom color schemes:

```javascript
theme: {
  extend: {
    colors: {
      brand: {
        50: '#your-color',
        // ... more shades
      }
    }
  }
}
```

### Custom Components
All components follow the same pattern:
- TailwindCSS for styling
- Framer Motion for animations
- Consistent prop interfaces
- Dark mode support

## 📱 Responsive Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: > 1024px

## 🚀 Performance

- **Lazy Loading**: Views are rendered on demand
- **Optimized Animations**: 60fps smooth transitions
- **Minimal Bundle**: Tree-shaking enabled
- **Fast Refresh**: Instant development updates

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

---

Built with ❤️ using React + Vite + TailwindCSS