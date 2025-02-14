const express = require('express');
const router = express.Router();
const multer = require('multer');
const { auth, isMerchant, isAdmin } = require('../middleware/auth');
const catalogController = require('../controllers/catalogController');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/catalogs')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix + '.json')
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/json') {
            cb(null, true);
        } else {
            cb(new Error('Only JSON files are allowed!'));
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024 
    }
});

router.post('/upload', auth, isMerchant, upload.single('catalog'), catalogController.uploadCatalog);
router.get('/status/:uploadId', auth, isMerchant, catalogController.getCatalogStatus);
router.get('/pending', auth, isAdmin, catalogController.getPendingCatalogs);
router.post('/:uploadId/review', auth, isAdmin, catalogController.reviewCatalog);
router.get('/merchant', auth, isMerchant, catalogController.getMerchantCatalogs);

module.exports = router; 