const express = require('express');
const {
    getDashboardStats
} = require('../controllers/dashboardController');

const router = express.Router();

// Public dashboard routes
router.get('/stats', getDashboardStats);

module.exports = router;
