const { createConnection } = require('../database/dbConfig');

exports.getAllProducts = async (req, res) => {
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
            GROUP BY 
                p.id,
                p.name,
                p.description,
                p.brand,
                p.category_id,
                p.image,
                p.created_at,
                p.updated_at,
                c.name
        `;

        const [products] = await connection.execute(sql);

        for (const product of products) {
            const [product_prices] = await connection.execute(`
                SELECT * FROM product_prices pp
                LEFT JOIN stores s ON pp.product_store_id = s.id
                WHERE pp.product_id = ?
            `, [product.id]);

            product.available_colors = product.available_colors ? 
                [...new Set(product.available_colors.split(','))] : [];
            product.available_sizes = product.available_sizes ? 
                [...new Set(product.available_sizes.split(','))] : [];
            product.prices = product_prices;
        }

        res.json({ products });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.searchProducts = async (req, res) => {
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
            LEFT JOIN product_prices pp ON pp.product_id = p.id
            LEFT JOIN colors col ON pp.color_id = col.id
            LEFT JOIN sizes s ON pp.size_id = s.id
            LEFT JOIN stores st ON pp.product_store_id = st.id
            WHERE 1=1
        `;

        const params = [];

        if (search) {
            sql += ` AND (p.name LIKE ? OR p.description LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`);
        }

        if (category) {
            sql += ` AND c.id = ?`;
            params.push(category);
        }

        if (color) {
            sql += ` AND col.hex_code = ?`;
            params.push(color);
        }

        if (size) {
            sql += ` AND s.name = ?`;
            params.push(size);
        }

        if (store) {
            sql += ` AND st.id = ?`;
            params.push(store);
        }

        if (minPrice) {
            sql += ` AND pp.current_price >= ?`;
            params.push(minPrice);
        }

        if (maxPrice) {
            sql += ` AND pp.current_price <= ?`;
            params.push(maxPrice);
        }

        sql += ` GROUP BY p.id `;

        if (sort === 'price') {
            sql += ` ORDER BY min_price ${order}`;
        } else if (sort === 'name') {
            sql += ` ORDER BY p.name ${order}`;
        }

        const offset = (page - 1) * limit;
        sql += ` LIMIT ? OFFSET ?`;
        params.push(Number(limit), Number(offset));

        const [products] = await connection.execute(sql, params);

        for (const product of products) {
            product.available_colors = product.available_colors ? 
                [...new Set(product.available_colors.split(','))] : [];
            product.available_sizes = product.available_sizes ? 
                [...new Set(product.available_sizes.split(','))] : [];
        }

        res.json(products);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getColors = async (req, res) => {
    try {
        const connection = await createConnection();
        const [colors] = await connection.execute(`
            SELECT DISTINCT c.name, c.hex_code
            FROM colors c
            INNER JOIN product_prices pp ON c.id = pp.color_id
            WHERE c.hex_code IS NOT NULL
            ORDER BY c.name
        `);
        res.json(colors);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getSizes = async (req, res) => {
    try {
        const connection = await createConnection();
        const [sizes] = await connection.execute(`
            SELECT DISTINCT s.name
            FROM sizes s
            INNER JOIN product_prices pp ON s.id = pp.size_id
            WHERE s.name IS NOT NULL
            ORDER BY s.name
        `);
        res.json(sizes.map(s => s.name));
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getAvailableFilters = async (req, res) => {
    try {
        const connection = await createConnection();
        const { size, color, brand } = req.query;
        
        let sql = `
            SELECT DISTINCT
                c.name as color_name,
                c.hex_code,
                s.name as size_name,
                p.brand
            FROM products p
            LEFT JOIN product_prices pp ON p.id = pp.product_id
            LEFT JOIN colors c ON pp.color_id = c.id
            LEFT JOIN sizes s ON pp.size_id = s.id
            WHERE 1=1
        `;
        
        const params = [];

        if (size) {
            sql += ` AND s.name = ?`;
            params.push(size);
        }

        if (color) {
            sql += ` AND c.hex_code = ?`;
            params.push(color);
        }

        if (brand) {
            sql += ` AND p.brand = ?`;
            params.push(brand);
        }

        sql += ` GROUP BY c.hex_code, c.name, s.name, p.brand`;

        const [results] = await connection.execute(sql, params);

        const availableFilters = {
            colors: [...new Set(results
                .filter(r => r.hex_code)
                .map(r => ({
                    name: r.color_name,
                    hex_code: r.hex_code
                })))],
            sizes: [...new Set(results
                .filter(r => r.size_name)
                .map(r => r.size_name))],
            brands: [...new Set(results
                .filter(r => r.brand)
                .map(r => r.brand))]
        };

        res.json(availableFilters);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}; 