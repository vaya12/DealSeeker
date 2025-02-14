const { createConnection } = require('../database/dbConfig');
const CatalogManager = require('../services/CatalogManager');

exports.uploadCatalog = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const connection = await createConnection();
        const catalogData = JSON.parse(req.file.buffer.toString());
        
        const validation = await CatalogManager.validateCatalog(catalogData);
        if (!validation.isValid) {
            return res.status(400).json({ 
                error: 'Invalid catalog format', 
                details: validation.errors 
            });
        }

        const [result] = await connection.execute(`
            INSERT INTO catalog_uploads 
            (merchant_id, file_path, status, created_at)
            VALUES (?, ?, 'pending', NOW())
        `, [req.user.merchantId, req.file.path]);

        res.json({ 
            message: 'Catalog uploaded successfully, waiting for approval',
            uploadId: result.insertId
        });
    } catch (error) {
        console.error('Error uploading catalog:', error);
        res.status(500).json({ message: 'Error uploading catalog' });
    }
};

exports.getCatalogStatus = async (req, res) => {
    try {
        const { uploadId } = req.params;
        const connection = await createConnection();
        
        const [uploads] = await connection.execute(`
            SELECT status, admin_notes, created_at, processed_at
            FROM catalog_uploads
            WHERE id = ? AND merchant_id = ?
        `, [uploadId, req.user.merchantId]);

        if (uploads.length === 0) {
            return res.status(404).json({ error: 'Upload not found' });
        }

        res.json(uploads[0]);
    } catch (error) {
        console.error('Error checking status:', error);
        res.status(500).json({ message: 'Error checking status' });
    }
};

exports.getPendingCatalogs = async (req, res) => {
    try {
        const connection = await createConnection();
        const [uploads] = await connection.execute(`
            SELECT cu.*, m.name as merchant_name, s.name as store_name
            FROM catalog_uploads cu
            JOIN merchants m ON cu.merchant_id = m.id
            JOIN stores s ON m.store_id = s.id
            WHERE cu.status = 'pending'
            ORDER BY cu.created_at ASC
        `);

        res.json(uploads);
    } catch (error) {
        console.error('Error fetching pending catalogs:', error);
        res.status(500).json({ message: 'Error fetching pending catalogs' });
    }
};

exports.reviewCatalog = async (req, res) => {
    try {
        const { uploadId } = req.params;
        const { status, notes } = req.body;
        const connection = await createConnection();

        await connection.beginTransaction();

        try {
            await connection.execute(`
                UPDATE catalog_uploads 
                SET status = ?, admin_notes = ?, processed_at = NOW()
                WHERE id = ?
            `, [status, notes, uploadId]);

            if (status === 'approved') {
                const [uploads] = await connection.execute(
                    'SELECT * FROM catalog_uploads WHERE id = ?',
                    [uploadId]
                );

                if (uploads.length > 0) {
                    const catalogData = require(uploads[0].file_path);
                    await CatalogManager.processCatalog(catalogData, uploads[0].merchant_id);
                }
            }

            await connection.commit();
            res.json({ message: `Catalog ${status}` });
        } catch (error) {
            await connection.rollback();
            throw error;
        }
    } catch (error) {
        console.error('Error submitting review:', error);
        res.status(500).json({ message: 'Error submitting review' });
    }
};

exports.getMerchantCatalogs = async (req, res) => {
    try {
        const connection = await createConnection();
        const merchantId = req.user.merchantId;

        const [catalogs] = await connection.execute(`
            SELECT id, status, created_at, processed_at, admin_notes
            FROM catalog_uploads
            WHERE merchant_id = ?
            ORDER BY created_at DESC
            LIMIT 10
        `, [merchantId]);

        res.json(catalogs);
    } catch (error) {
        console.error('Error fetching merchant catalogs:', error);
        res.status(500).json({ message: 'Error fetching catalogs' });
    }
}; 