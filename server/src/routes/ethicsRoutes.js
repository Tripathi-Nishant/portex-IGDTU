const express = require('express');
const { submitVote, getLeaderboard } = require('../controllers/ethicsController');
const { authMiddleware, restrictTo } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.post('/vote/:complaintId', restrictTo('ETHICS_MEMBER'), submitVote);
router.get('/leaderboard', restrictTo('ETHICS_MEMBER', 'ADMIN'), getLeaderboard);

module.exports = router;
