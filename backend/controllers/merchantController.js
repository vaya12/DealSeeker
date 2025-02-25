const { createConnection } = require('../database/dbConfig');
const { importMerchantProducts } = require('../scripts/importDemoData');

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
    const connection = await createConnection();
    try {
        const merchantId = req.params.id;
        
        const [merchants] = await connection.execute(
            'SELECT catalog_url FROM merchants WHERE id = ?',
            [merchantId]
        );
        
        if (merchants.length === 0) {
            return res.status(404).json({ error: 'Merchant not found' });
        }
        
        const { catalog_url } = merchants[0];
        
        await importMerchantProducts(merchantId, catalog_url);
        
        res.json({ message: 'Products synchronized successfully' });
    } catch (error) {
        console.error('Error syncing products:', error);
        res.status(500).json({ 
            error: 'Failed to sync products',
            details: error.message 
        });
    } finally {
        await connection.end();
    }
};

exports.deleteMerchant = async (req, res) => {
    const connection = await createConnection();
    try {
        const merchantId = req.params.id;
        
        await connection.execute(
            'DELETE products FROM products ' +
            'INNER JOIN product_prices ON products.id = product_prices.product_id ' +
            'WHERE product_prices.product_store_id = ?',
            [merchantId]
        );
        
        await connection.execute(
            'DELETE FROM merchants WHERE id = ?',
            [merchantId]
        );
        
        res.json({ message: 'Merchant deleted successfully' });
    } catch (error) {
        console.error('Error deleting merchant:', error);
        res.status(500).json({ error: 'Failed to delete merchant' });
    } finally {
        await connection.end();
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