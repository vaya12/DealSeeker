const express = require('express');
const { createConnection } = require('../database/dbConfig');
const router = express.Router();

router.get('/products', async (req, res) => {
    try {
        const connection = await createConnection();
        
        let sql = `
            SELECT
                p.*,
                c.name as category_name,
                GROUP_CONCAT(DISTINCT col.hex_code) as available_colors,
                GROUP_CONCAT(DISTINCT s.name) as available_sizes,
                MIN(pp.current_price) as min_price,
                MAX(pp.current_price) as max_price

            FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN product_prices pp ON pp.product_id = p.id
                LEFT JOIN colors col ON pp.color_id = col.id
                LEFT JOIN sizes s ON pp.size_id = s.id  
        `;

        const [products] = await connection.execute(sql);

        for (const product of products) {
            const [product_prices] = await connection.execute(`
                SELECT * FROM product_prices pp

                WHERE pp.product_id = ?
            `, [product.id]);

            product.available_colors = product.available_colors ? 
                [...new Set(product.available_colors.split(','))] : [];
            product.available_sizes = product.available_sizes ? 
                [...new Set(product.available_sizes.split(','))] : [];
            product.prices = Object.values(product_prices);
        }

        await connection.end();
        console.log('Products:', products);
        res.json({ products });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/products/search', async (req, res) => {
    try {
        const connection = await createConnection();
        
        const { 
            minPrice, 
            maxPrice, 
            category,
            search,
            color,
            size,
            store,
            sort = 'price',    
            order = 'asc',     
            page = 1,
            limit = 10
        } = req.query;

        let sql = `
            SELECT DISTINCT
                p.*,
                c.name as category_name,
                st.name as store_name,
                st.website_url,
                st.catalog_url,
                GROUP_CONCAT(DISTINCT col.name) as available_colors,
                GROUP_CONCAT(DISTINCT s.name) as available_sizes,
                MIN(pp.current_price) as min_price,
                MAX(pp.current_price) as max_price
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN product_prices pp ON p.id = pp.product_store_id
            LEFT JOIN colors col ON pp.color_id = col.id
            LEFT JOIN sizes s ON pp.size_id = s.id
            LEFT JOIN stores st ON pp.product_store_id = st.id
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

        if (store) {
            sql += ` AND st.name = ?`;
            params.push(store);
        }

        if (search) {
            sql += ` AND (p.name LIKE ? OR p.description LIKE ? OR p.brand LIKE ?)`;
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        sql += ` GROUP BY p.id`;

        sql += ` ORDER BY `;
        switch(sort) {
            case 'price':
                sql += `min_price ${order}`;
                break;
            case 'name':
                sql += `p.name ${order}`;
                break;
            case 'date':
                sql += `p.created_at ${order}`;
                break;
            default:
                sql += `p.id ${order}`;
        }

        const offset = (page - 1) * limit;
        sql += ` LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), offset);

        const [rows] = await connection.execute(sql, params);
        
        const formattedProducts = rows.map(row => ({
            ...row,
            available_colors: row.available_colors ? [...new Set(row.available_colors.split(','))] : [],
            available_sizes: row.available_sizes ? [...new Set(row.available_sizes.split(','))] : []
        }));

        const [countResult] = await connection.execute(
            'SELECT COUNT(DISTINCT p.id) as total FROM products p'
        );
        const total = countResult[0].total;

        await connection.end();
        res.json({
            products: formattedProducts,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                total_pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/products/:id', async (req, res) => {
    try {
        const connection = await createConnection();
        const productId = req.params.id;

        const sql = `
            SELECT 
                p.*,
                c.name as category_name,
                st.name as store_name,
                st.website_url,
                st.catalog_url,
                pp.current_price,
                pp.original_price,
                pp.stock,
                col.name as color_name,
                col.hex_code as color_hex,
                s.name as size_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN product_prices pp ON p.id = pp.product_store_id
            LEFT JOIN colors col ON pp.color_id = col.id
            LEFT JOIN sizes s ON pp.size_id = s.id
            LEFT JOIN stores st ON pp.product_store_id = st.id
            WHERE p.id = ?
        `;

        const [rows] = await connection.execute(sql, [productId]);

        if (rows.length === 0) {
            res.status(404).json({ error: 'Product not found' });
            return;
        }

        const product = {
            ...rows[0],
            stores: rows.reduce((stores, row) => {
                if (!stores[row.store_name]) {
                    stores[row.store_name] = {
                        name: row.store_name,
                        website_url: row.website_url,
                        catalog_url: row.catalog_url,
                        variants: []
                    };
                }
                stores[row.store_name].variants.push({
                    color: row.color_name,
                    color_hex: row.color_hex,
                    size: row.size_name,
                    current_price: row.current_price,
                    original_price: row.original_price,
                    stock: row.stock
                });
                return stores;
            }, {})
        };

        product.prices = Object.values(product.prices);

        await connection.end();
        res.json(product);

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
