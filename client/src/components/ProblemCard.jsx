import React, { useState } from 'react';
import api from '../services/api';

const ProblemCard = ({ problem, onEdit, onDelete }) => {
  const [hint, setHint] = useState(null);
  const [loadingHint, setLoadingHint] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const requestHint = async () => {
    setLoadingHint(true);
    try {
      const { data } = await api.post('/ai/hint', { problem });
      setHint(data.hint);
      setShowHint(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to get hint');
    } finally {
      setLoadingHint(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow mb-4">
      <h3 className="font-semibold">{problem.title}</h3>
      <p className="text-sm">{problem.platform} | {problem.difficulty} | Topic: {problem.topic || 'General'}</p>
      <p className="text-sm">Status: {problem.status}</p>
      <div className="mt-2">
        <button onClick={() => onEdit(problem)} className="mr-2 text-blue-500">Edit</button>
        <button onClick={() => onDelete(problem._id)} className="mr-2 text-red-500">Delete</button>
        <button onClick={requestHint} className="text-green-600" disabled={loadingHint}>
          {loadingHint ? 'Getting hint...' : 'Get Hint'}
        </button>
      </div>

      {showHint && (
        <div className="mt-3 p-3 bg-gray-50 border rounded">
          <strong>Hint:</strong>
          <div style={{ whiteSpace: 'pre-wrap' }}>{hint}</div>
          <button className="mt-2 text-sm text-blue-500" onClick={() => setShowHint(false)}>Close</button>
        </div>
      )}
    </div>
  );
};

export default ProblemCard;