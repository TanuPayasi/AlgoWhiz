const Problem = require('../models/Problem');

exports.createProblem = async (req, res) => {
  try {
    const { title, link, platform, tags = [], difficulty, status, notes, topic } = req.body;
    const solvedAt = status === 'Solved' ? new Date() : undefined;
    const problem = await Problem.create({
      user: req.user.id,
      title,
      link,
      platform,
      tags,
      difficulty,
      status,
      notes,
      topic,
      solvedAt
    });
    res.status(201).json(problem);
  } catch (error) {
    console.error('createProblem error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getProblems = async (req, res) => {
  try {
    const { page = 1, status, difficulty, topic, q } = req.query;
    const filter = { user: req.user.id };

    if (status) filter.status = status;
    if (difficulty) filter.difficulty = difficulty;
    if (topic) filter.topic = topic;
    if (q) {
      const re = new RegExp(q, 'i');
      filter.$or = [{ title: re }, { platform: re }, { tags: re }, { notes: re }, { topic: re }];
    }

    const limit = 10;
    const skip = (page - 1) * limit;

    const items = await Problem.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(limit);
    const total = await Problem.countDocuments(filter);

    res.json({
      items,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    console.error('getProblems error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateProblem = async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem || problem.user.toString() !== req.user.id) return res.status(404).json({ message: 'Not found' });

    const oldStatus = problem.status;
    Object.assign(problem, req.body);

    // If status changed to Solved set solvedAt; if moved away from Solved, clear solvedAt
    if (oldStatus !== 'Solved' && problem.status === 'Solved') {
      problem.solvedAt = new Date();
    } else if (oldStatus === 'Solved' && problem.status !== 'Solved') {
      problem.solvedAt = undefined;
    }

    await problem.save();
    res.json(problem);
  } catch (error) {
    console.error('updateProblem error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteProblem = async (req, res) => {
  try {
    const deleted = await Problem.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Problem not found" });
    }
    res.json({ message: "Problem deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete problem" });
  }
};