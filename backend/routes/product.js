const express = require('express');
const { createConnection } = require('../database/dbConfig');
const router = express.Router();

// GET /api/products
router.get('/products', async (req, res) => {
    try {
        const connection = await createConnection();
        
        // Извличане на query параметрите
        const { 
            minPrice, 
            maxPrice, 
            category,
            search,
            color,
            size
        } = req.query;

        // Базова SQL заявка
        let sql = `
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
            WHERE 1=1
        `;

        const params = [];

        if (minPrice) {
            sql += ` AND pp.current_price >= ?`;
            params.push(minPrice);
        }

        if (maxPrice) {
            sql += ` AND pp.current_price <= ?`;
            params.push(maxPrice);
        }

        if (category) {
            sql += ` AND c.name = ?`;
            params.push(category);
        }

        if (color) {
            sql += ` AND col.name = ?`;
            params.push(color);
        }

        if (size) {
            sql += ` AND s.name = ?`;
            params.push(size);
        }

        if (search) {
            sql += ` AND (p.name LIKE ? OR p.description LIKE ? OR p.brand LIKE ?)`;
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        sql += ` ORDER BY p.id, pp.current_price ASC`;

        const [rows] = await connection.execute(sql, params);

        // Групиране на данните по продукт
        const groupedProducts = rows.reduce((acc, row) => {
            if (!acc[row.id]) {
                acc[row.id] = {
                    id: row.id,
                    name: row.name,
                    description: row.description,
                    brand: row.brand,
                    category: row.category_name,
                    image: row.image,
                    colors: new Set(),
                    sizes: new Set(),
                    stores: [],
                    created_at: row.created_at,
                    updated_at: row.updated_at
                };
            }

            acc[row.id].colors.add(row.color_name);
            acc[row.id].sizes.add(row.size_name);

            // Добавяме магазина само ако вече не съществува
            const storeExists = acc[row.id].stores.find(s => s.name === row.store_name);
            if (!storeExists) {
                acc[row.id].stores.push({
                    name: row.store_name,
                    url: row.store_url,
                    current_price: row.current_price,
                    original_price: row.original_price,
                    is_on_sale: row.is_on_sale
                });
            }

            return acc;
        }, {});

        // Преобразуване на Set обектите в масиви
        const products = Object.values(groupedProducts).map(product => ({
            ...product,
            colors: Array.from(product.colors),
            sizes: Array.from(product.sizes)
        }));
        
        await connection.end();
        res.json(products);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/products/:id
router.get('/products/:id', async (req, res) => {
    try {
        const connection = await createConnection();
        
        const [rows] = await connection.execute(`
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
            WHERE p.id = ?
            ORDER BY pp.current_price ASC
        `, [req.params.id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Използваме същата логика за групиране
        const groupedProducts = rows.reduce((acc, row) => {
            if (!acc[row.id]) {
                acc[row.id] = {
                    id: row.id,
                    name: row.name,
                    description: row.description,
                    brand: row.brand,
                    category: row.category_name,
                    image: row.image,
                    colors: new Set(),
                    sizes: new Set(),
                    stores: [],
                    created_at: row.created_at,
                    updated_at: row.updated_at
                };
            }

            acc[row.id].colors.add(row.color_name);
            acc[row.id].sizes.add(row.size_name);

            const storeExists = acc[row.id].stores.find(s => s.name === row.store_name);
            if (!storeExists) {
                acc[row.id].stores.push({
                    name: row.store_name,
                    url: row.store_url,
                    current_price: row.current_price,
                    original_price: row.original_price,
                    is_on_sale: row.is_on_sale
                });
            }

            return acc;
        }, {});

        const product = Object.values(groupedProducts).map(product => ({
            ...product,
            colors: Array.from(product.colors),
            sizes: Array.from(product.sizes)
        }))[0];

        await connection.end();
        res.json(product);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
