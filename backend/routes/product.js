const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/products', productController.getAllProducts);
router.get('/products/search', productController.searchProducts);
router.get('/products/:id', productController.getProductById);
router.get('/brands', productController.getBrands);
router.get('/colors', productController.getColors);
router.get('/sizes', productController.getSizes);
router.get('/available-filters', productController.getAvailableFilters);

module.exports = router;
