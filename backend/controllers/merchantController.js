const { createConnection } = require('../database/dbConfig');
const { importMerchantProducts } = require('../scripts/importDemoData');
const fetch = require('node-fetch');

exports.getAllMerchants = async (req, res) => {
    const connection = await createConnection();
    try {
        const [merchants] = await connection.execute(
            'SELECT * FROM merchants WHERE status = "active"'
        );
        res.json(merchants);
    } catch (error) {
        console.error('Error fetching merchants:', error);
        res.status(500).json({ error: 'Failed to fetch merchants' });
    } finally {
        await connection.end();
    }
};

exports.createMerchant = async (req, res) => {
    const connection = await createConnection();
    try {
        const { name, description, logo, catalog_url } = req.body;
        
        const [existingMerchantName] = await connection.execute(
            'SELECT id FROM merchants WHERE name = ?',
            [name]
        );
        
        if (existingMerchantName.length > 0) {
            return res.status(400).json({
                error: 'A merchant with this name already exists'
            });
        }

        const [existingCatalogUrl] = await connection.execute(
            'SELECT id FROM merchants WHERE catalog_url = ?',
            [catalog_url]
        );
        
        if (existingCatalogUrl.length > 0) {
            return res.status(400).json({
                error: 'This catalog URL is already in use'
            });
        }

        const [result] = await connection.execute(
            'INSERT INTO merchants (name, description, logo, catalog_url) VALUES (?, ?, ?, ?)',
            [name, description, logo, catalog_url]
        );
        
        res.status(201).json({
            id: result.insertId,
            name,
            description,
            logo,
            catalog_url
        });
    } catch (error) {
        console.error('Error creating merchant:', error);
        res.status(500).json({ error: 'Failed to create merchant' });
    } finally {
        await connection.end();
    }
};

exports.syncMerchantProducts = async (req, res) => {
    let connection;
    const { id } = req.params;

    try {
        connection = await createConnection();

        const [merchant] = await connection.execute(
            'SELECT * FROM merchants WHERE id = ?',
            [id]
        );

        if (merchant.length === 0) {
            return res.status(404).json({
                error: 'Merchant not found'
            });
        }

        try {
            await connection.beginTransaction();

            await connection.execute(
                'DELETE FROM product_prices WHERE product_id IN (SELECT id FROM products WHERE merchant_id = ?)',
                [id]
            );
            
            await connection.execute(
                'DELETE FROM products WHERE merchant_id = ?',
                [id]
            );

            const products = await importMerchantProducts(id, merchant[0].catalog_url, connection);

            await connection.execute(
                'INSERT INTO sync_logs (merchant_id, status, products_updated, started_at, completed_at) VALUES (?, ?, ?, NOW(), NOW())',
                [id, 'success', products.length]
            );

            await connection.commit();
            
            res.json({ 
                message: `Successfully synchronized ${products.length} products`,
                productsCount: products.length
            });

        } catch (error) {
            await connection.rollback();
            throw error;
        }
    } catch (error) {
        console.error('Error syncing products:', error);
        
        let errorMessage = 'Error synchronizing products. ';
        
        if (error.code === 'ER_LOCK_WAIT_TIMEOUT') {
            errorMessage = 'Database is busy. Please try again in a few moments.';
        } else if (error.code === 'ECONNREFUSED') {
            errorMessage = 'Cannot connect to the catalog. Please check if the URL is accessible.';
        } else if (error.message.includes('404')) {
            errorMessage = 'Catalog not found (404). Please check if the URL is correct.';
        } else if (error.message.includes('fetch failed')) {
            errorMessage = 'Failed to fetch catalog data. Please check if the catalog URL is accessible.';
        }

        if (connection) {
            try {
                await connection.execute(
                    'INSERT INTO sync_logs (merchant_id, status, error_message, started_at, completed_at) VALUES (?, ?, ?, NOW(), NOW())',
                    [id, 'error', errorMessage]
                );
            } catch (logError) {
                console.error('Error logging sync error:', logError);
            }
        }

        res.status(500).json({ error: errorMessage });
    } finally {
        if (connection) {
            try {
                await connection.end();
            } catch (err) {
                console.error('Error closing connection:', err);
            }
        }
    }
};

exports.deleteMerchant = async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        connection = await createConnection();

        await connection.beginTransaction();

        try {
            await connection.execute(
                'DELETE FROM product_prices WHERE product_id IN (SELECT id FROM products WHERE merchant_id = ?)',
                [id]
            );

            await connection.execute(
                'DELETE FROM products WHERE merchant_id = ?',
                [id]
            );

            await connection.execute(
                'DELETE FROM sync_logs WHERE merchant_id = ?',
                [id]
            );

            await connection.execute(
                'DELETE FROM merchants WHERE id = ?',
                [id]
            );

            await connection.commit();
            res.json({ message: 'Merchant and all related data successfully deleted' });

        } catch (error) {
            await connection.rollback();
            throw error;
        }
    } catch (error) {
        console.error('Error deleting merchant:', error);
        res.status(500).json({ 
            error: 'Failed to delete merchant. Please try again.' 
        });
    } finally {
        if (connection) {
            try {
                await connection.end();
            } catch (err) {
                console.error('Error closing connection:', err);
            }
        }
    }
};

exports.getMerchant = async (req, res) => {
    const connection = await createConnection();
    try {
        const [merchants] = await connection.execute(
            'SELECT * FROM merchants WHERE id = ?',
            [req.params.id]
        );
        
        if (merchants.length === 0) {
            return res.status(404).json({ error: 'Merchant not found' });
        }
        
        res.json(merchants[0]);
    } catch (error) {
        console.error('Error fetching merchant:', error);
        res.status(500).json({ error: 'Failed to fetch merchant' });
    } finally {
        await connection.end();
    }
};

exports.updateMerchant = async (req, res) => {
    const connection = await createConnection();
    try {
        const { name, description, logo, catalog_url } = req.body;
        const merchantId = req.params.id;

        const [merchants] = await connection.execute(
            'SELECT * FROM merchants WHERE id = ?',
            [merchantId]
        );

        if (merchants.length === 0) {
            return res.status(404).json({ error: 'Merchant not found' });
        }
        
        await connection.execute(
            'UPDATE merchants SET name = ?, description = ?, logo = ?, catalog_url = ? WHERE id = ?',
            [name, description, logo, catalog_url, merchantId]
        );
        
        res.json({
            id: merchantId,
            name,
            description,
            logo,
            catalog_url
        });
    } catch (error) {
        console.error('Error updating merchant:', error);
        res.status(500).json({ error: 'Failed to update merchant' });
    } finally {
        await connection.end();
    }
}; 