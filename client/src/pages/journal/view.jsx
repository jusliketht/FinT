import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import journalEntryService from '../../services/journalEntryService';

const ViewJournalEntry = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch entry data from API
  useEffect(() => {
    const fetchJournalEntry = async () => {
      try {
        setLoading(true);
        const data = await journalEntryService.getById(id);
        setEntry(data);
        setError(null);
      } catch (error) {
        console.error('Failed to load journal entry:', error);
        setError('Failed to load journal entry. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchJournalEntry();
  }, [id]);
  
  // Calculate totals
  const getTotals = () => {
    if (!entry) return { debit: 0, credit: 0 };
    
    let totalDebit = 0;
    let totalCredit = 0;
    
    entry.lines.forEach(line => {
      if (line.debit) totalDebit += parseFloat(line.debit);
      if (line.credit) totalCredit += parseFloat(line.credit);
    });
    
    return {
      debit: totalDebit.toFixed(2),
      credit: totalCredit.toFixed(2)
    };
  };
  
  const { debit: totalDebit, credit: totalCredit } = getTotals();
  
  // Handle journal entry actions
  const handleDeleteEntry = async () => {
    if (!window.confirm('Are you sure you want to delete this journal entry?')) {
      return;
    }
    
    try {
      await journalEntryService.delete(id);
      navigate('/journal');
    } catch (error) {
      console.error('Failed to delete journal entry:', error);
      alert('Failed to delete the journal entry. Please try again.');
    }
  };
  
  const handlePostEntry = async () => {
    if (!window.confirm('Are you sure you want to post this journal entry? This action cannot be undone.')) {
      return;
    }
    
    try {
      await journalEntryService.post(id);
      // Refresh entry data
      const updatedEntry = await journalEntryService.getById(id);
      setEntry(updatedEntry);
    } catch (error) {
      console.error('Failed to post journal entry:', error);
      alert('Failed to post the journal entry. Please try again.');
    }
  };
  
  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">Loading journal entry...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          <h1 className="text-xl font-bold text-red-700 dark:text-red-400">Error</h1>
          <p className="text-red-600 dark:text-red-300">{error}</p>
          <button 
            onClick={() => navigate('/journal')} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Return to Journal Entries
          </button>
        </div>
      </div>
    );
  }
  
  if (!entry) {
    return (
      <div className="p-8">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
          <h1 className="text-xl font-bold text-yellow-700 dark:text-yellow-400">Not Found</h1>
          <p className="text-yellow-600 dark:text-yellow-300">Journal entry not found.</p>
          <button 
            onClick={() => navigate('/journal')} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Return to Journal Entries
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">Journal Entry: {entry.id}</h1>
        <div className="flex space-x-4">
          <Link 
            to="/journal"
            className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
          >
            Back to List
          </Link>
          {(entry.status === 'Draft' || entry.status === 'Pending') && (
            <Link 
              to={`/journal/${entry.id}/edit`}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Edit Entry
            </Link>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Entry ID</h3>
            <p className="mt-1 text-md font-semibold">{entry.id}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Date</h3>
            <p className="mt-1 text-md font-semibold">{new Date(entry.date).toLocaleDateString()}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</h3>
            <p className="mt-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                entry.status === 'Posted' ? 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400' : 
                entry.status === 'Draft' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400' : 
                'bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-400'
              }`}>
                {entry.status}
              </span>
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Created By</h3>
            <p className="mt-1 text-md">{entry.createdBy || 'System'}</p>
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</h3>
          <p className="mt-1 text-md">{entry.description}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Line Items</h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Account
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Debit
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Credit
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {entry.lines.map((line) => (
                  <tr key={line.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-medium">{line.accountName}</div>
                        <div className="text-gray-500 dark:text-gray-400">{line.accountId}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {line.description || '-'}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap text-sm font-medium">
                      {line.debit ? `$${line.debit}` : '-'}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap text-sm font-medium">
                      {line.credit ? `$${line.credit}` : '-'}
                    </td>
                  </tr>
                ))}
                
                {/* Totals row */}
                <tr className="bg-gray-50 dark:bg-gray-700 font-medium">
                  <td colSpan={2} className="px-6 py-4 text-right text-sm">
                    Totals
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap text-sm font-medium">
                    ${totalDebit}
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap text-sm font-medium">
                    ${totalCredit}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {entry.status === 'Draft' && (
        <div className="flex justify-end space-x-4">
          <button
            onClick={handleDeleteEntry}
            className="px-4 py-2 border border-red-300 text-red-700 rounded hover:bg-red-50"
          >
            Delete Entry
          </button>
          <button
            onClick={handlePostEntry}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Post Entry
          </button>
        </div>
      )}
    </div>
  );
};

export default ViewJournalEntry; 