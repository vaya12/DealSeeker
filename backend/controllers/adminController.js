const { createConnection } = require('../database/dbConfig');
const { importMerchantProducts } = require('../scripts/importDemoData');

exports.getMerchants = async (req, res) => {
    const connection = await createConnection();
    try {
        const [merchants] = await connection.execute(`
            SELECT m.*, s.name as store_name, s.website_url, s.catalog_url
            FROM merchants m
            JOIN stores s ON m.store_id = s.id
            ORDER BY m.created_at DESC
        `);
        
        res.json(merchants);
    } catch (error) {
        console.error('Error fetching merchants:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        await connection.end();
    }
};

exports.addMerchant = async (req, res) => {
    const connection = await createConnection();
    try {
        const { store_id, api_key, api_url, sync_frequency } = req.body;

        const [existing] = await connection.execute(
            'SELECT id FROM merchants WHERE store_id = ?',
            [store_id]
        );

        if (existing.length > 0) {
            return res.status(400).json({ error: 'Merchant already exists for this store' });
        }

        await connection.execute(
            'INSERT INTO merchants (store_id, api_key, api_url, sync_frequency) VALUES (?, ?, ?, ?)',
            [store_id, api_key, api_url, sync_frequency]
        );

        res.status(201).json({ message: 'Merchant added successfully' });
    } catch (error) {
        console.error('Error adding merchant:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        await connection.end();
    }
};

exports.updateMerchant = async (req, res) => {
    const connection = await createConnection();
    try {
        const { id } = req.params;
        const { api_key, api_url, sync_frequency } = req.body;

        await connection.execute(
            'UPDATE merchants SET api_key = ?, api_url = ?, sync_frequency = ? WHERE id = ?',
            [api_key, api_url, sync_frequency, id]
        );

        res.json({ message: 'Merchant updated successfully' });
    } catch (error) {
        console.error('Error updating merchant:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        await connection.end();
    }
};

exports.deleteMerchant = async (req, res) => {
    const connection = await createConnection();
    try {
        const { id } = req.params;
        await connection.execute('DELETE FROM merchants WHERE id = ?', [id]);
        res.json({ message: 'Merchant deleted successfully' });
    } catch (error) {
        console.error('Error deleting merchant:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        await connection.end();
    }
};

exports.getStats = async (req, res) => {
    let connection;
    try {
        connection = await db.createConnection();
        
        const [merchantsResult] = await connection.execute('SELECT COUNT(*) as count FROM merchants');
        
        const [productsResult] = await connection.execute('SELECT COUNT(*) as count FROM products');
        
        const [syncResult] = await connection.execute(
            'SELECT sync_date FROM sync_logs ORDER BY sync_date DESC LIMIT 1'
        );

        const stats = {
            totalMerchants: merchantsResult[0].count,
            totalProducts: productsResult[0].count,
            lastSync: syncResult[0]?.sync_date || null
        };

        res.json(stats);
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
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

exports.getSyncLogs = async (req, res) => {
    const connection = await createConnection();
    try {
        const [logs] = await connection.execute(`
            SELECT sl.*, m.api_url, s.name as store_name
            FROM sync_logs sl
            JOIN merchants m ON sl.merchant_id = m.id
            JOIN stores s ON m.store_id = s.id
            ORDER BY sl.started_at DESC
            LIMIT 100
        `);
        
        res.json(logs);
    } catch (error) {
        console.error('Error fetching sync logs:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        await connection.end();
    }
};

exports.startMerchantSync = async (req, res) => {
    const connection = await createConnection();
    try {
        const { id } = req.params;
        
        await connection.execute(
            'INSERT INTO sync_logs (merchant_id, status, started_at) VALUES (?, ?, NOW())',
            [id, 'success']
        );

        res.json({ message: 'Sync started successfully' });
    } catch (error) {
        console.error('Error starting sync:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        await connection.end();
    }
};

exports.syncCatalog = async (req, res) => {
    let connection;
    try {
        const { merchant_id, catalog_url } = req.body;
        
        if (!merchant_id || !catalog_url) {
            return res.status(400).json({ 
                error: 'Missing required parameters' 
            });
        }

        connection = await createConnection();
        
        const importedProducts = await importMerchantProducts(
            merchant_id, 
            catalog_url, 
            connection
        );

        await connection.execute(
            `INSERT INTO sync_logs 
            (merchant_id, products_count, status) 
            VALUES (?, ?, ?)`,
            [merchant_id, importedProducts.length, 'success']
        );

        res.json({ 
            success: true, 
            imported: importedProducts.length,
            message: `Successfully synced ${importedProducts.length} products`
        });

    } catch (error) {
        console.error('Sync error:', error);
        

        if (connection) {
            await connection.execute(
                `INSERT INTO sync_logs 
                (merchant_id, status, error_message) 
                VALUES (?, ?, ?)`,
                [req.body.merchant_id, 'error', error.message]
            );
        }

        res.status(500).json({ 
            error: 'Failed to sync catalog',
            details: error.message 
        });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}; 