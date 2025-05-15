import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const features = [
  { name: 'Journal', desc: 'Create and view journal entries', to: '/journal' },
  { name: 'Ledgers', desc: 'Chart of Accounts, General Ledger, Trial Balance', to: '/ledgers' },
  { name: 'Banking', desc: 'Import statements, reconcile accounts', to: '/banking' },
  { name: 'Finance', desc: 'Budgeting, Forecasting, Goals', to: '/finance' },
  { name: 'Reports', desc: 'Financial statements and exports', to: '/reports' },
  { name: 'AI Assistant', desc: 'Smart insights and help', to: '/ai' },
  { name: 'Settings', desc: 'User and account settings', to: '/settings' },
];

const stats = [
  { label: 'Accounts', value: 12 },
  { label: 'Last Entry', value: '2024-05-13' },
  { label: 'Bank Balance', value: '$24,500' },
  { label: 'Budget Progress', value: '68%' },
];

const Dashboard = () => {
  const [mode, setMode] = useState('Personal');
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Dashboard</h1>
        <div className="flex items-center space-x-2">
          <span className="font-medium">Mode:</span>
          <button
            className={`px-3 py-1 rounded-l border ${mode==='Personal' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
            onClick={() => setMode('Personal')}
          >Personal</button>
          <button
            className={`px-3 py-1 rounded-r border-l-0 border ${mode==='Business' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
            onClick={() => setMode('Business')}
          >Business</button>
        </div>
      </div>
      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 flex flex-col items-center border border-gray-100 dark:border-gray-800">
            <span className="text-gray-500 text-sm mb-1">{stat.label}</span>
            <span className="text-2xl font-semibold text-blue-600">{stat.value}</span>
          </div>
        ))}
      </div>
      {/* Feature Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f) => (
          <Link
            key={f.name}
            to={f.to}
            className="block rounded-xl shadow hover:shadow-lg transition bg-white dark:bg-gray-900 p-6 border border-gray-100 dark:border-gray-800 hover:bg-blue-50 dark:hover:bg-blue-950"
          >
            <div className="flex flex-col h-full justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-2">{f.name}</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{f.desc}</p>
              </div>
              <span className="text-blue-600 font-medium hover:underline">Go to {f.name} &rarr;</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Dashboard; 