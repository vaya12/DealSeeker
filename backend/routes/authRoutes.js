const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateAdmin } = require('../middleware/authMiddleware');

router.post('/login', authController.login);
router.get('/verify', authenticateAdmin, authController.verifyToken);

router.get('/check-admin', authenticateAdmin, (req, res) => {
    res.json({ message: 'You are authenticated as admin' });
});

module.exports = router; 