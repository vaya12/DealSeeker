const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

router.get('/merchants', auth, isAdmin, adminController.getMerchants);
router.post('/merchants', auth, isAdmin, adminController.addMerchant);
router.put('/merchants/:id', auth, isAdmin, adminController.updateMerchant);
router.delete('/merchants/:id', auth, isAdmin, adminController.deleteMerchant);

router.get('/sync-logs', auth, isAdmin, adminController.getSyncLogs);
router.post('/merchants/:id/sync', auth, isAdmin, adminController.startMerchantSync);

module.exports = router; 