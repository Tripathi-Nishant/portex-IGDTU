const express = require('express');
const { getAlerts, acknowledgeAlert, getKPIs } = require('../controllers/adminController');
const { authMiddleware, restrictTo } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);
router.use(restrictTo('ADMIN'));

router.get('/kpis', getKPIs);
router.get('/alerts', getAlerts);
router.patch('/alerts/:id/acknowledge', acknowledgeAlert);

module.exports = router;
