const express = require('express');
const router = express.Router();
const {
  getProblems,
  createProblem,
  updateProblem,
  deleteProblem,
} = require('../controllers/problemController');
const { protect } = require('../middleware/authMiddleware');

router
  .route('/')
  .get(protect, getProblems) // paginated and filtered
  .post(protect, createProblem);

router
  .route('/:id')
  .put(protect, updateProblem)
  .delete(protect, deleteProblem);

module.exports = router;