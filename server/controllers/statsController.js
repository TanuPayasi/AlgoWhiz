const Problem = require('../models/Problem');
const mongoose = require('mongoose');

const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0,0,0,0);
  return x;
};

// calculate longest/current streak
function computeStreak(solvedDates = []) {
  if (!solvedDates || solvedDates.length === 0) return { current: 0, longest: 0 };

  // Set to data format (YYYY-MM-DD)
  const set = new Set(solvedDates.map(d => startOfDay(d).toISOString()));
  let current = 0;
  let longest = 0;

  let cursor = startOfDay(new Date());
  while (set.has(cursor.toISOString())) {
    current++;
    cursor = new Date(cursor.getTime() - 24*60*60*1000);
  }

  // compute longest streak
  const sorted = Array.from(set).map(s => new Date(s)).sort((a,b)=>a-b);
  let running = 1;
  for (let i=1;i<sorted.length;i++) {
    const diff = (sorted[i]-sorted[i-1])/(24*60*60*1000);
    if (diff === 1) {
      running++;
    } else running = 1;
    longest = Math.max(longest, running);
  }
  longest = Math.max(longest, running);

  return { current, longest };
}

exports.getStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const problems = await Problem.find({ user: userId });

    const total = problems.length;
    const solved = problems.filter(p => p.status === 'Solved').length;
    const percentCompleted = total === 0 ? 0 : Math.round((solved / total) * 100);

    // difficulty distribution
    const diffDist = problems.reduce((acc, p) => {
      acc[p.difficulty] = (acc[p.difficulty] || 0) + 1;
      return acc;
    }, {});

    // topic distribution
    const topicDist = problems.reduce((acc, p) => {
      const t = p.topic || 'General';
      acc[t] = (acc[t] || 0) + 1;
      return acc;
    }, {});

    // streaks
    const solvedDates = problems.filter(p => p.solvedAt).map(p => p.solvedAt);
    const streak = computeStreak(solvedDates);

    res.json({
      total,
      solved,
      percentCompleted,
      difficultyDistribution: diffDist,
      topicDistribution: topicDist,
      streak
    });
  } catch (error) {
    console.error('getStats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};