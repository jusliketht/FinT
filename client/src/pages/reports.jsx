import React from 'react';
import { Link } from 'react-router-dom';

const Reports = () => (
  <div className="p-8">
    <h1 className="text-2xl font-bold mb-4">Reports</h1>
    <p className="mb-4">Financial statements and export features coming soon.</p>
    <Link to="/" className="text-blue-600 hover:underline">Back to Dashboard</Link>
  </div>
);

export default Reports; 