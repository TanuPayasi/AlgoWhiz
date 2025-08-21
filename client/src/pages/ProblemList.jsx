import React, { useEffect, useState } from 'react';
import api from '../services/api';
import ProblemCard from '../components/ProblemCard';
import { difficulties, statuses, topics } from '../utils/constants';

export default function ProblemList() {
  const [problems, setProblems] = useState({ items: [], totalPages: 1 });
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState({ status: '', difficulty: '', topic: '' });
  const [q, setQ] = useState('');
  const [editingProblem, setEditingProblem] = useState(null); // State for the problem being edited
  const [editForm, setEditForm] = useState({}); // State for edit form data

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const res = await api.get('/problems', { params: { page, q, ...filter } });
        setProblems(res.data);
      } catch (err) {
        console.error('fetch problems err', err);
        setProblems({ items: [], totalPages: 1 });
      }
    };
    fetchProblems();
  }, [page, filter, q]);

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this problem?')) {
      try {
        await api.delete(`/problems/${id}`);
        // Refetch problems to update the list
        const res = await api.get('/problems', { params: { page, q, ...filter } });
        setProblems(res.data);
      } catch (err) {
        console.error('delete error', err);
        alert('Failed to delete problem');
      }
    }
  };

  // Handle edit start
  const handleEdit = (problem) => {
    setEditingProblem(problem);
    setEditForm({
      title: problem.title,
      link: problem.link,
      platform: problem.platform,
      tags: problem.tags.join(', '), // Convert array to string for input
      difficulty: problem.difficulty,
      status: problem.status,
      notes: problem.notes,
      topic: problem.topic,
    });
  };

  // Handle edit form change
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle edit submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedData = {
        ...editForm,
        tags: editForm.tags.split(',').map(tag => tag.trim()), // Convert string back to array
      };
      await api.put(`/problems/${editingProblem._id}`, updatedData);
      setEditingProblem(null);
      setEditForm({});
      // Refetch problems to update the list
      const res = await api.get('/problems', { params: { page, q, ...filter } });
      setProblems(res.data);
    } catch (err) {
      console.error('update error', err);
      alert('Failed to update problem');
    }
  };

  return (
    <div>
      <h2 className="text-2xl mb-4">All Problems</h2>
      <div className="flex space-x-4 mb-4">
        <input className="border p-2" placeholder="Search title/platform/tags" value={q} onChange={e=>setQ(e.target.value)} />
        <select onChange={e => setFilter(f=>({...f,status:e.target.value}))} value={filter.status}>
          <option value="">All Status</option>
          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select onChange={e => setFilter(f=>({...f,difficulty:e.target.value}))} value={filter.difficulty}>
          <option value="">All Difficulty</option>
          {difficulties.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select onChange={e => setFilter(f=>({...f,topic:e.target.value}))} value={filter.topic}>
          <option value="">All Topics</option>
          {topics.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div>
        {problems.items && problems.items.length > 0 ? (
          problems.items.map(p => (
            <ProblemCard key={p._id} problem={p} onEdit={() => handleEdit(p)} onDelete={() => handleDelete(p._id)} />
          ))
        ) : (
          <p className="text-gray-500">No problems found.</p>
        )}
      </div>
      {/* Edit Form (inline, shown when editing */}
      {editingProblem && (
        <div className="mt-4 p-4 border rounded">
          <h3 className="text-xl mb-2">Edit Problem: {editingProblem.title}</h3>
          <form onSubmit={handleEditSubmit}>
            <div className="mb-2">
              <label>Title:</label>
              <input className="border p-2 w-full" name="title" value={editForm.title} onChange={handleEditChange} required />
            </div>
            <div className="mb-2">
              <label>Link:</label>
              <input className="border p-2 w-full" name="link" value={editForm.link} onChange={handleEditChange} />
            </div>
            <div className="mb-2">
              <label>Platform:</label>
              <input className="border p-2 w-full" name="platform" value={editForm.platform} onChange={handleEditChange} />
            </div>
            <div className="mb-2">
              <label>Tags (comma-separated):</label>
              <input className="border p-2 w-full" name="tags" value={editForm.tags} onChange={handleEditChange} />
            </div>
            <div className="mb-2">
              <label>Difficulty:</label>
              <select name="difficulty" value={editForm.difficulty} onChange={handleEditChange} className="border p-2 w-full">
                {difficulties.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="mb-2">
              <label>Status:</label>
              <select name="status" value={editForm.status} onChange={handleEditChange} className="border p-2 w-full">
                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="mb-2">
              <label>Topic:</label>
              <select name="topic" value={editForm.topic} onChange={handleEditChange} className="border p-2 w-full">
                {topics.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="mb-2">
              <label>Notes:</label>
              <textarea className="border p-2 w-full" name="notes" value={editForm.notes} onChange={handleEditChange} />
            </div>
            <button type="submit" className="bg-blue-500 text-white p-2">Save Changes</button>
            <button type="button" className="bg-gray-500 text-white p-2 ml-2" onClick={() => setEditingProblem(null)}>Cancel</button>
          </form>
        </div>
      )}
      <div className="mt-4 flex justify-center space-x-2">
        <button onClick={()=>setPage(p=>Math.max(p-1,1))} disabled={page===1}>Prev</button>
        <span>Page {page}</span>
        <button onClick={()=>setPage(p=>p+1)} disabled={page===problems.totalPages}>Next</button>
      </div>
    </div>
  );
}