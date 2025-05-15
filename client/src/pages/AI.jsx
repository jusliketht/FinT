import React from 'react';
import { Link } from 'react-router-dom';

const AI = () => (
  <div className="p-8">
    <h1 className="text-2xl font-bold mb-4">AI Assistant</h1>
    <p className="mb-4">This is the AI Assistant page. (Feature coming soon!)</p>
    <Link to="/" className="text-blue-600 hover:underline">Back to Dashboard</Link>
  </div>
);

export default AI; 