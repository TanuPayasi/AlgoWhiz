import React, { useState, useEffect } from "react";
import api from "../services/api";
import "../TrackProblem.css";

export default function TrackProblems() {
  const [problems, setProblems] = useState([]);
  const [form, setForm] = useState({
    title: "",
    link: "",
    platform: "",
    topic: "General",
    difficulty: "Easy",
    status: "Not Started",
    notes: "",
  });

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const res = await api.get("/problems", { params: { page: 1 } });
        // server may return { items: [...], page, totalPages } OR an array directly
        const items = res.data?.items ?? res.data ?? [];
        setProblems(Array.isArray(items) ? items : []);
      } catch (err) {
        console.error("Fetch problems failed:", err);
        setProblems([]);
      }
    };

    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      const res = await api.get("/problems", { params: { page: 1 } });
      const items = res.data?.items ?? res.data ?? [];
      setProblems(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error("Fetch problems failed:", err);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post("/problems", {
        ...form,
        tags: form.tags ? form.tags.split(",").map(t => t.trim()) : [],
      });
      setForm({
        title: "",
        link: "",
        platform: "",
        topic: "General",
        difficulty: "Easy",
        status: "Not Started",
        notes: "",
      });
      await fetchProblems();
    } catch (err) {
      console.error("Add failed:", err);
      alert(err.response?.data?.message || "Failed to add problem");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this problem?")) return;
    try {
      await api.delete(`/problems/${id}`);
      await fetchProblems();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Delete failed");
    }
  };

  const handleEdit = async (id, field, value) => {
    try {
      await api.put(`/problems/${id}`, { [field]: value });
      await fetchProblems();
    } catch (err) {
      console.error("Update failed:", err);
      alert("Update failed");
    }
  };

  return (
    <div className="track-container">
      <h2>Track Problems</h2>

      {/* Add Problem Form */}
      <form className="add-form" onSubmit={handleAdd}>
        <input
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
        <input
          placeholder="Link"
          value={form.link}
          onChange={(e) => setForm({ ...form, link: e.target.value })}
        />
        <input
          placeholder="Platform"
          value={form.platform}
          onChange={(e) => setForm({ ...form, platform: e.target.value })}
        />
        <input
          placeholder="Topic"
          value={form.topic}
          onChange={(e) => setForm({ ...form, topic: e.target.value })}
        />
        <select
          value={form.difficulty}
          onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
        >
          <option>Easy</option>
          <option>Medium</option>
          <option>Hard</option>
        </select>
        <select
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
        >
          <option>Not Started</option>
          <option>In Progress</option>
          <option>Solved</option>
          <option>Skipped</option>
        </select>
        <input
          placeholder="Notes"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
        <button type="submit" className="btn">Add</button>
      </form>

      {/* Problems Table */}
      <div className="table-wrapper">
        <table className="problems-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Platform</th>
              <th>Difficulty</th>
              <th>Topic</th>
              <th>Status</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {(!problems || problems.length === 0) ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center" }}>
                  No problems added yet
                </td>
              </tr>
            ) : (
              problems.map((p) => (
                <tr key={p._id}>
                  <td>
                    {p.link ? (
                      <a href={p.link} target="_blank" rel="noreferrer">
                        {p.title}
                      </a>
                    ) : (
                      p.title
                    )}
                  </td>
                  <td>{p.platform || '-'}</td>

                  {/* FIXED className syntax: use template literal inside braces */}
                  <td className={`diff ${(p.difficulty || '').toLowerCase()}`}>
                    {p.difficulty || '-'}
                  </td>

                  <td>{p.topic || '-'}</td>
                  <td>{p.status || '-'}</td>
                  <td style={{ maxWidth: 300, whiteSpace: 'pre-wrap' }}>{p.notes || '-'}</td>
                  <td>
                    <button
                      className="btn small"
                      onClick={() => handleEdit(p._id, "status", "Solved")}
                    >
                      Mark Solved
                    </button>
                    <button
                      className="btn small danger"
                      onClick={() => handleDelete(p._id)}
                      style={{ marginLeft: 8 }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}