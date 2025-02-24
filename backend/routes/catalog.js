const express = require('express');
const router = express.Router();
const catalogController = require('../controllers/catalogController');

router.get('/:merchantId', catalogController.getMerchantCatalog);

router.post('/:merchantId/sync', catalogController.syncMerchantProducts);

module.exports = router;