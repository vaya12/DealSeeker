const express = require('express');
const router = express.Router();
const merchantController = require('../controllers/merchantController');

if (!merchantController.getAllMerchants || 
    !merchantController.getMerchant || 
    !merchantController.createMerchant || 
    !merchantController.updateMerchant || 
    !merchantController.deleteMerchant || 
    !merchantController.syncMerchantProducts) {
    console.error('Missing controller methods:', merchantController);
}

router.get('/', merchantController.getAllMerchants);
router.get('/:id', merchantController.getMerchant);
router.post('/', merchantController.createMerchant);
router.put('/:id', merchantController.updateMerchant);
router.delete('/:id', merchantController.deleteMerchant);
router.post('/:id/sync', merchantController.syncMerchantProducts);

module.exports = router; 