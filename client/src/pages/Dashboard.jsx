import React, { useEffect, useState } from 'react';
import api from '../services/api';
import '../Dashboard.css';
export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchStats = async () => {
      try {
        const res = await api.get('/stats');
        if (mounted) setStats(res.data);
      } catch (err) {
        console.error('Failed loading stats', err.response?.data || err.message);
        if (mounted) setStats(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchStats();
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="container p-6">
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ margin: 0 }}>Loading dashboard…</h2>
        </div>
      </div>
    );
  }

  const total = stats?.total ?? 0;
  const solved = stats?.solved ?? 0;
  const pct = stats?.percentCompleted ?? (total === 0 ? 0 : Math.round((solved / total) * 100));
  const difficultyDistribution = stats?.difficultyDistribution || {};
  const topicDistribution = stats?.topicDistribution || {};
  const streak = stats?.streak || { current: 0, longest: 0 };

  const strokeColor = pct >= 100 ? '#10B981' : 'var(--accent)';   // hex for green when done
  const progressBarBg = pct >= 100
  ? 'linear-gradient(90deg,#10B981,#059669)'   // green gradient for 100%
  : 'linear-gradient(90deg,var(--primary),var(--accent))';

  const entriesSorted = (obj) =>
    Object.entries(obj).sort((a,b) => b[1] - a[1]);

  return (
    <div className="container p-6">
      <div className="dashboard-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:16 }}>
        <div>
          <h1 style={{ margin: 0 }}>Progress Overview</h1>
          <p className="text-sm" style={{ marginTop:6, color:'var(--muted)' }}>
            Track your DSA progress — quick glance at completion, difficulty and topics.
          </p>
        </div>
      </div>

      <div className="stats" style={{ marginTop:20 }}>
        {/* Left column: main progress */}
        <div style={{ flex: '1 1 420px', minWidth:280 }}>
          <div className="card" style={{ padding:20 }}>
            <div style={{ display:'flex', alignItems:'center', gap:20 }}>
              <div style={{ width: 140, textAlign:'center' }}>
                <div className="progress-ring" aria-hidden>
                  <svg viewBox="0 0 36 36" className="circular-chart">
                    <path className="circle-bg"
                      d="M18 2.0845
                         a 15.9155 15.9155 0 0 1 0 31.831
                         a 15.9155 15.9155 0 0 1 0 -31.831"/>
                         <path className="circle" strokeDasharray={`${pct}, 100`}
                         d="M18 2.0845 
                         a 15.9155 15.9155 0 0 1 0 31.831
                         a 15.9155 15.9155 0 0 1 0 -31.831" style={{ stroke: strokeColor }}/>
                    <text x="18" y="20.3" className="percentage">{pct}%</text>
                  </svg>
                </div>
                <div className="text-sm" style={{ marginTop:8, color:'var(--muted)' }}>Completed</div>
              </div>

              <div style={{ flex:1 }}>
                <div style={{ fontSize: 20, fontWeight:700 }}>{solved}/{total} solved</div>
                <div style={{ marginTop:12 }}>
                  <div className="progress-bar-outer">
                    <div className="progress-bar-inner" style={{ width: `${pct}%`, background: progressBarBg }}/>
                  </div>
                  <div className="text-sm" style={{ marginTop:8, color:'var(--muted)' }}>{pct}% of your tracked problems completed</div>
                </div>
              </div>
            </div>
          </div>

          {/* Streak card */}
          <div className="card" style={{ marginTop:14, padding:18 }}>
            <h3 style={{ margin: 0 }}>Streaks</h3>
            <div style={{ display:'flex', gap:20, marginTop:12 }}>
              <div>
                <div className="stat-figure">{streak.current}</div>
                <div className="stat-label">Current (days)</div>
              </div>
              <div>
                <div className="stat-figure">{streak.longest}</div>
                <div className="stat-label">Longest</div>
              </div>
              <div style={{ marginLeft:'auto', alignSelf:'center' }}>
                <small className="text-sm" style={{ color:'var(--muted)' }}>Tip: Solve one problem a day to build a streak!</small>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: distributions */}
        <div style={{ flex: '1 1 420px', minWidth:280, display:'flex', flexDirection:'column', gap:12 }}>
          <div className="card" style={{ padding:18 }}>
            <h3 style={{ margin: 0 }}>Difficulty distribution</h3>
            <div style={{ marginTop:12 }}>
              {entriesSorted(difficultyDistribution).length === 0 && <div className="text-sm" style={{ color:'var(--muted)' }}>No data yet</div>}
              {entriesSorted(difficultyDistribution).map(([k,v]) => {
                const pctOfTotal = total === 0 ? 0 : Math.round((v / total) * 100);
                return (
                  <div key={k} style={{ marginBottom:10 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', fontWeight:600 }}>{k} <span style={{ fontWeight:700 }}>{v}</span></div>
                    <div className="mini-bar-outer">
                      <div className="mini-bar-inner" style={{ width: `${pctOfTotal}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card" style={{ padding:18 }}>
            <h3 style={{ margin: 0 }}>Topic distribution</h3>
            <div style={{ marginTop:12 }}>
              {entriesSorted(topicDistribution).length === 0 && <div className="text-sm" style={{ color:'var(--muted)' }}>No topics yet</div>}
              {entriesSorted(topicDistribution).map(([k,v]) => {
                const pctOfTotal = total === 0 ? 0 : Math.round((v / total) * 100);
                return (
                  <div key={k} style={{ marginBottom:10 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', fontWeight:600 }}>{k} <span style={{ fontWeight:700 }}>{v}</span></div>
                    <div className="mini-bar-outer">
                      <div className="mini-bar-inner" style={{ width: `${pctOfTotal}%`, background: 'linear-gradient(90deg,var(--accent),var(--primary))' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}