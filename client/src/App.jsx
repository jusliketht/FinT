import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Journal from './pages/journal';
import NewJournalEntry from './pages/journal/new';
import ViewJournalEntry from './pages/journal/view';
import Ledgers from './pages/ledgers';
import Banking from './pages/banking';
import Finance from './pages/finance';
import Reports from './pages/reports';
import AI from './pages/AI';
import Settings from './pages/Settings';
import AccountTypes from './pages/account-types';
import AccountCategories from './pages/account-categories';
import Accounts from './pages/accounts';
import Debug from './pages/debug';
import NotFound from './components/common/NotFound';

const App = () => {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/journal" element={<Journal />} />
        <Route path="/journal/new" element={<NewJournalEntry />} />
        <Route path="/journal/:id" element={<ViewJournalEntry />} />
        <Route path="/ledgers" element={<Ledgers />} />
        <Route path="/banking" element={<Banking />} />
        <Route path="/finance" element={<Finance />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/ai" element={<AI />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/account-types" element={<AccountTypes />} />
        <Route path="/account-categories" element={<AccountCategories />} />
        <Route path="/accounts" element={<Accounts />} />
        <Route path="/debug" element={<Debug />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </MainLayout>
  );
};

export default App; 