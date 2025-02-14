const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const userController = require('../controllers/userController');

router.get('/favorites', auth, userController.getFavorites);
router.post('/favorites', auth, userController.addFavorite);
router.delete('/favorites/:productId', auth, userController.removeFavorite);

router.get('/search-history', auth, userController.getSearchHistory);
router.post('/search-history', auth, userController.addSearchHistory);

router.get('/profile', auth, userController.getProfile);
router.put('/profile', auth, userController.updateProfile);

router.get('/notification-preferences', auth, userController.getNotificationPreferences);
router.put('/notification-preferences', auth, userController.updateNotificationPreferences);

module.exports = router; 