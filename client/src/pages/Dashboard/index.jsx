import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useBusiness } from '../../contexts/BusinessContext';
import journalEntryService from '../../services/journalEntryService';
import accountService from '../../services/accountService';
import { useToast } from '../../contexts/ToastContext';

const Dashboard = () => {
  const [mode, setMode] = useState('Business');
  const [stats, setStats] = useState({
    totalAccounts: 0,
    totalEntries: 0,
    bankBalance: 0,
    pendingReconciliations: 0,
  });
  const [recentEntries, setRecentEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { selectedBusiness } = useBusiness();
  const { showToast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, [selectedBusiness]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [accounts, entries] = await Promise.all([
        accountService.getAll(),
        journalEntryService.getAll({ limit: 5 }),
      ]);

      setStats({
        totalAccounts: accounts.length,
        totalEntries: entries.length,
        bankBalance: calculateBankBalance(accounts),
        pendingReconciliations: 0,
      });

      setRecentEntries(entries.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showToast('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const calculateBankBalance = (accounts) => {
    return accounts
      .filter(account => account.type === 'ASSET' && account.category?.includes('Bank'))
      .reduce((total, account) => total + (account.balance || 0), 0);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'posted': return 'green';
      case 'draft': return 'orange';
      case 'void': return 'red';
      default: return 'gray';
    }
  };

  const quickActions = [
    {
      name: 'New Journal Entry',
      description: 'Create a new journal entry',
      to: '/journal/new',
      color: 'blue',
    },
    {
      name: 'Upload Statement',
      description: 'Import bank/credit card statements',
      to: '/bank-statements',
      color: 'green',
    },
    {
      name: 'Chart of Accounts',
      description: 'Manage your accounts',
      to: '/accounts',
      color: 'purple',
    },
    {
      name: 'General Ledger',
      description: 'View account ledgers',
      to: '/ledgers',
      color: 'teal',
    },
    {
      name: 'Reconciliation',
      description: 'Reconcile bank accounts',
      to: '/bank-statements',
      color: 'orange',
    },
    {
      name: 'Financial Reports',
      description: 'Generate reports',
      to: '/reports',
      color: 'cyan',
    },
  ];

  const features = [
    {
      name: 'Journal Entries',
      description: 'Create, view, and manage journal entries',
      to: '/journal',
      stats: `${stats.totalEntries} entries`,
    },
    {
      name: 'Chart of Accounts',
      description: 'Manage your chart of accounts structure',
      to: '/accounts',
      stats: `${stats.totalAccounts} accounts`,
    },
    {
      name: 'Ledgers',
      description: 'General Ledger, Trial Balance, and account details',
      to: '/ledgers',
      stats: 'Real-time balances',
    },
    {
      name: 'Bank Reconciliation',
      description: 'Import statements and reconcile accounts',
      to: '/bank-statements',
      stats: `${stats.pendingReconciliations} pending`,
    },
    {
      name: 'Financial Reports',
      description: 'P&L, Balance Sheet, Cash Flow statements',
      to: '/reports',
      stats: 'Multiple formats',
    },
    {
      name: 'Settings',
      description: 'Configure your accounting system',
      to: '/settings',
      stats: 'System preferences',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, {user?.name}! {selectedBusiness && `Managing: ${selectedBusiness.name}`}
          </p>
        </div>
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <span className="font-medium">Mode:</span>
          <button
            className={`px-3 py-1 rounded-l border ${mode === 'Personal' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
            onClick={() => setMode('Personal')}
          >
            Personal
          </button>
          <button
            className={`px-3 py-1 rounded-r border-l-0 border ${mode === 'Business' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
            onClick={() => setMode('Business')}
          >
            Business
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center border border-gray-100">
          <span className="text-gray-500 text-sm mb-1">Total Accounts</span>
          <span className="text-2xl font-semibold text-blue-600">{stats.totalAccounts}</span>
          <span className="text-xs text-gray-500">Chart of Accounts</span>
        </div>
        <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center border border-gray-100">
          <span className="text-gray-500 text-sm mb-1">Journal Entries</span>
          <span className="text-2xl font-semibold text-blue-600">{stats.totalEntries}</span>
          <span className="text-xs text-gray-500">Total entries</span>
        </div>
        <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center border border-gray-100">
          <span className="text-gray-500 text-sm mb-1">Bank Balance</span>
          <span className="text-2xl font-semibold text-blue-600">₹{stats.bankBalance.toLocaleString()}</span>
          <span className="text-xs text-gray-500">Total bank accounts</span>
        </div>
        <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center border border-gray-100">
          <span className="text-gray-500 text-sm mb-1">Pending Reconciliation</span>
          <span className="text-2xl font-semibold text-blue-600">{stats.pendingReconciliations}</span>
          <span className="text-xs text-gray-500">Requires attention</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6 mb-8 border border-gray-100">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.name}
              to={action.to}
              className="block p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
            >
              <div className="flex flex-col h-full">
                <h3 className="font-semibold text-gray-900 mb-1">{action.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{action.description}</p>
                <span className="text-blue-600 text-sm font-medium mt-auto">Go to {action.name} →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Main Features Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Features */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
            <h2 className="text-xl font-semibold mb-4">Accounting Features</h2>
            <div className="space-y-4">
              {features.map((feature) => (
                <div key={feature.name} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">{feature.name.charAt(0)}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{feature.name}</h3>
                        <p className="text-sm text-gray-600">{feature.description}</p>
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mt-1">
                          {feature.stats}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Link
                        to={feature.to}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View
                      </Link>
                      {feature.name === 'Journal Entries' && (
                        <Link
                          to="/journal/new"
                          className="text-green-600 hover:text-green-800 text-sm font-medium"
                        >
                          New Entry
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Recent Journal Entries</h2>
              <button
                onClick={fetchDashboardData}
                className="text-gray-500 hover:text-gray-700"
              >
                ↻
              </button>
            </div>
            <div className="space-y-3">
              {recentEntries.length > 0 ? (
                recentEntries.map((entry) => (
                  <div key={entry.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-sm">#{entry.entryNumber}</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        getStatusColor(entry.status) === 'green' ? 'bg-green-100 text-green-800' :
                        getStatusColor(entry.status) === 'orange' ? 'bg-orange-100 text-orange-800' :
                        getStatusColor(entry.status) === 'red' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {entry.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{entry.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        {new Date(entry.date).toLocaleDateString()}
                      </span>
                      <span className="text-sm font-medium">
                        ₹{entry.total?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No recent entries</p>
              )}
              <Link
                to="/journal"
                className="block w-full text-center py-2 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
              >
                View All Entries
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
