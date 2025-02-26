const express = require('express');
const router = express.Router();
const { authenticateAdmin } = require('../middleware/authMiddleware');
const merchantController = require('../controllers/merchantController');

router.use(authenticateAdmin);

router.get('/merchants', merchantController.getAllMerchants);
router.get('/merchants/:id', merchantController.getMerchant);
router.post('/merchants', merchantController.createMerchant);
router.put('/merchants/:id', merchantController.updateMerchant);
router.delete('/merchants/:id', merchantController.deleteMerchant);

router.post('/merchants/:id/sync', merchantController.syncMerchantProducts);

module.exports = router; 