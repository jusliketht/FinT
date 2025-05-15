import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const navLinks = [
  { label: 'Dashboard', to: '/', icon: '📊' },
  { label: 'Journal', to: '/journal', icon: '📝' },
  { label: 'Ledgers', to: '/ledgers', icon: '📒' },
  { label: 'Accounts', to: '/accounts', icon: '📚' },
  { label: 'Banking', to: '/banking', icon: '🏦' },
  { label: 'Finance', to: '/finance', icon: '💰' },
  { label: 'Reports', to: '/reports', icon: '📈' },
  { label: 'AI Assistant', to: '/ai', icon: '🤖' },
  { label: 'Settings', to: '/settings', icon: '⚙️' },
  { label: 'Account Types', to: '/account-types', icon: '🏷️' },
  { label: 'Account Categories', to: '/account-categories', icon: '📂' },
  { label: 'Debug', to: '/debug', icon: '🔍' },
];

const Sidebar = () => {
  const location = useLocation();
  const isActive = (to) => (to === '/' ? location.pathname === '/' : location.pathname.startsWith(to));

  return (
    <aside className="w-64 h-full bg-white dark:bg-gray-900 shadow-md flex flex-col p-4 md:block hidden">
      <h1 className="text-xl font-bold mb-4">FinT</h1>
      <nav className="flex flex-col space-y-2">
         {navLinks.map((link) => (
           <Link
             key={link.to}
             to={link.to}
             className={`px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${isActive(link.to) ? 'bg-blue-100 dark:bg-blue-800 text-blue-600' : 'text-gray-700 dark:text-gray-200'}`}
           >
             <span className="inline-block w-6 mr-2">{link.icon}</span>
             {link.label}
           </Link>
         ))}
      </nav>
    </aside>
  );
};

export default Sidebar; 