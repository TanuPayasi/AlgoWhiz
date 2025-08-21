const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
  title: { type: String, required: true },
  link: String,
  platform: String,
  tags: [String],
  topic: { type: String, default: 'General' }, // NEW: topic
  difficulty: { type: String, enum: ['Easy','Medium','Hard'], default: 'Easy' },
  status: { type: String, enum: ['Not Started','In Progress','Solved','Skipped'], default: 'Not Started' },
  notes: String,
  solvedAt: { type: Date } // NEW: when it was solved (for streaks)
}, { timestamps: true });

module.exports = mongoose.model('Problem', problemSchema);