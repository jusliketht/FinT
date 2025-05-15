import React from 'react';
import { useTheme } from '../../theme/ThemeProvider';

const Topbar = () => {
  const { isDark, toggleTheme } = useTheme();
  return (
    <header className="h-16 bg-white shadow-sm flex items-center justify-between px-4">
      <div className="flex items-center">
         {/* Placeholder for logo or app name */}
         <h1 className="text-xl font-bold">FinT</h1>
      </div>
      <div className="flex items-center space-x-4">
         {/* Placeholder for account switcher */}
         <button className="px-3 py-1 rounded hover:bg-gray-100 text-gray-700">Account</button>
         {/* Placeholder for notifications */}
         <button className="px-3 py-1 rounded hover:bg-gray-100 text-gray-700">Notifications</button>
         {/* Theme toggle button (using useTheme) */}
         <button
            onClick={toggleTheme}
            className="px-3 py-1 rounded hover:bg-gray-100 text-gray-700"
         >
            {isDark ? 'Light' : 'Dark'}
         </button>
      </div>
    </header>
  );
};

export default Topbar; 