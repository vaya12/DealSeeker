const express = require('express');
const { createConnection } = require('../database/dbConfig');
const router = express.Router();

router.get('/api/products', async (req, res) => {
    try {
        const connection = await createConnection();
        
        const [products] = await connection.execute(`
            SELECT 
                p.*,
                c.name as category_name,
                col.name as color_name,
                s.name as size_name,
                st.name as store_name,
                pp.current_price,
                pp.original_price,
                pp.is_on_sale,
                ps.store_url
            FROM products p
            JOIN product_variants pv ON p.id = pv.product_id
            JOIN colors col ON pv.color_id = col.id
            JOIN sizes s ON pv.size_id = s.id
            JOIN product_stores ps ON pv.id = ps.product_variant_id
            JOIN stores st ON ps.store_id = st.id
            JOIN product_prices pp ON ps.id = pp.product_store_id
            JOIN categories c ON p.category_id = c.id
            ORDER BY p.id, pp.current_price ASC
        `);
        
        await connection.end();
        
        const groupedProducts = products.reduce((acc, curr) => {
            if (!acc[curr.id]) {
                acc[curr.id] = {
                    ...curr,
                    sizes: new Set(),
                    colors: new Set(),
                    stores: []
                };
            }
            acc[curr.id].sizes.add(curr.size_name);
            acc[curr.id].colors.add(curr.color_name);
            acc[curr.id].stores.push({
                name: curr.store_name,
                price: curr.current_price,
                originalPrice: curr.original_price,
                isOnSale: curr.is_on_sale,
                url: curr.store_url
            });
            return acc;
        }, {});
        
        res.json(Object.values(groupedProducts));
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
