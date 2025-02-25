const express = require('express');
const router = express.Router();
const filterController = require('../controllers/filterController');

router.get('/available-filters', filterController.getAvailableFilters);

module.exports = router; 