const { createConnection } = require('../database/dbConfig');

exports.getAllProducts = async (req, res) => {
    let connection;
    try {
        connection = await createConnection();
        
        const sql = `
            SELECT DISTINCT
                p.*,
                c.name as category_name,
                col.hex_code,
                col.name as color_name,
                s.name as size_name,
                pp.current_price,
                pp.original_price,
                pp.stock,
                st.name as store_name,
                st.website_url
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN product_prices pp ON p.id = pp.product_id
            LEFT JOIN colors col ON pp.color_id = col.id
            LEFT JOIN sizes s ON pp.size_id = s.id
            LEFT JOIN stores st ON pp.product_store_id = st.id
            WHERE pp.stock = 'in_stock'
            ORDER BY p.id
        `;

        const [rows] = await connection.execute(sql);

        const products = rows.reduce((acc, row) => {
            if (!acc[row.id]) {
                acc[row.id] = {
                    ...row,
                    available_colors: new Set(),
                    available_sizes: new Set(),
                    prices: [],
                    min_price: Infinity,
                    max_price: -Infinity
                };
            }

            const product = acc[row.id];

            if (row.hex_code) product.available_colors.add(row.hex_code);
            if (row.size_name) product.available_sizes.add(row.size_name);

            if (row.current_price) {
                product.prices.push({
                    current_price: row.current_price,
                    original_price: row.original_price,
                    color_code: row.hex_code,
                    color_name: row.color_name,
                    size_name: row.size_name,
                    store_name: row.store_name,
                    website_url: row.website_url
                });

                product.min_price = Math.min(product.min_price, row.current_price);
                product.max_price = Math.max(product.max_price, row.current_price);
            }

            return acc;
        }, {});

        const formattedProducts = Object.values(products).map(product => ({
            ...product,
            available_colors: Array.from(product.available_colors),
            available_sizes: Array.from(product.available_sizes),
            min_price: product.min_price === Infinity ? 0 : product.min_price,
            max_price: product.max_price === -Infinity ? 0 : product.max_price
        }));

        console.log('Formatted products:', formattedProducts[0]);
        res.json({ products: formattedProducts });

    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
};

exports.searchProducts = async (req, res) => {
    const connection = await createConnection();
    try {
        const { query } = req.query;
        const [products] = await connection.execute(`
            SELECT 
                p.*,
                c.name as category_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.name LIKE ? OR p.description LIKE ?
        `, [`%${query}%`, `%${query}%`]);
        
        res.json({ products });
    } catch (error) {
        console.error('Error searching products:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        await connection.end();
    }
};

exports.getProductById = async (req, res) => {
    const connection = await createConnection();
    try {
        const { id } = req.params;
        const [products] = await connection.execute(`
            SELECT 
                p.*,
                c.name as category_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.id = ?
        `, [id]);
        
        if (products.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        res.json(products[0]);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        await connection.end();
    }
};

exports.getBrands = async (req, res) => {
    const connection = await createConnection();
    try {
        const [brands] = await connection.execute('SELECT DISTINCT brand FROM products WHERE brand IS NOT NULL');
        res.json(brands.map(b => b.brand));
    } catch (error) {
        console.error('Error fetching brands:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        await connection.end();
    }
};

exports.getColors = async (req, res) => {
    const connection = await createConnection();
    try {
        const [colors] = await connection.execute('SELECT * FROM colors');
        res.json(colors);
    } catch (error) {
        console.error('Error fetching colors:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        await connection.end();
    }
};

exports.getSizes = async (req, res) => {
    const connection = await createConnection();
    try {
        const [sizes] = await connection.execute('SELECT * FROM sizes');
        res.json(sizes);
    } catch (error) {
        console.error('Error fetching sizes:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        await connection.end();
    }
};

exports.getAvailableFilters = async (req, res) => {
    let connection;
    try {
        connection = await createConnection();
        const { category, size, color, brand } = req.query;
        
        let query = `
            SELECT DISTINCT 
                c.id as color_id, 
                c.name as color_name, 
                c.hex_code,
                s.name as size_name,
                p.brand as brand_name,
                cat.name as category_name
            FROM products p
            JOIN product_prices pp ON p.id = pp.product_id
            JOIN colors c ON pp.color_id = c.id
            JOIN sizes s ON pp.size_id = s.id
            JOIN categories cat ON p.category_id = cat.id
            WHERE pp.stock > 0
        `;

        const params = [];

        if (category) {
            query += " AND cat.name = ?";
            params.push(category);
        }
        if (size) {
            query += " AND s.name = ?";
            params.push(size);
        }
        if (color) {
            query += " AND c.hex_code = ?";
            params.push(color);
        }
        if (brand) {
            query += " AND p.brand = ?";
            params.push(brand);
        }

        console.log('Executing filter query:', query);
        console.log('With params:', params);

        const [results] = await connection.execute(query, params);
        console.log('Filter query returned rows:', results.length);

        const colorMap = new Map();
        const sizes = new Set();
        const brands = new Set();

        results.forEach(row => {
            if (row.color_id && row.hex_code) {
                colorMap.set(row.hex_code, {
                    id: row.color_id,
                    name: row.color_name,
                    hex_code: row.hex_code
                });
            }
            if (row.size_name) sizes.add(row.size_name);
            if (row.brand_name) brands.add(row.brand_name);
        });

        const availableFilters = {
            colors: Array.from(colorMap.values()),
            sizes: Array.from(sizes),
            brands: Array.from(brands)
        };

        console.log('Sending filtered data:', availableFilters);
        res.json(availableFilters);

    } catch (error) {
        console.error('Error in getAvailableFilters:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            details: error.message 
        });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
};

exports.getCategories = async (req, res) => {
    const connection = await createConnection();
    try {
        const [categories] = await connection.execute('SELECT * FROM categories');
        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        await connection.end();
    }
};

exports.getProductsByCategory = async (req, res) => {
    const connection = await createConnection();
    try {
        const { categoryId } = req.params;
        const [products] = await connection.execute(`
            SELECT 
                p.*,
                c.name as category_name,
                GROUP_CONCAT(DISTINCT col.hex_code) as available_colors,
                GROUP_CONCAT(DISTINCT s.name) as available_sizes,
                MIN(pp.current_price) as min_price,
                MAX(pp.current_price) as max_price
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN product_prices pp ON p.id = pp.product_id
            LEFT JOIN colors col ON pp.color_id = col.id
            LEFT JOIN sizes s ON pp.size_id = s.id
            WHERE p.category_id = ?
            GROUP BY p.id
        `, [categoryId]);
        
        res.json({ products });
    } catch (error) {
        console.error('Error fetching products by category:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        await connection.end();
    }
};

exports.getPriceRange = async (req, res) => {
    const connection = await createConnection();
    try {
        const [result] = await connection.execute(`
            SELECT 
                MIN(current_price) as min_price,
                MAX(current_price) as max_price
            FROM product_prices
            WHERE current_price > 0
        `);
        
        res.json({
            min: result[0].min_price || 0,
            max: result[0].max_price || 0
        });
    } catch (error) {
        console.error('Error fetching price range:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        await connection.end();
    }
};

exports.getPriceHistory = async (req, res) => {
    const connection = await createConnection();
    try {
        const { id } = req.params;
        const [history] = await connection.execute(`
            SELECT 
                pp.current_price,
                pp.created_at,
                s.name as store_name
            FROM product_prices pp
            LEFT JOIN stores s ON pp.product_store_id = s.id
            WHERE pp.product_id = ?
            ORDER BY pp.created_at DESC
            LIMIT 30
        `, [id]);
        
        res.json(history);
    } catch (error) {
        console.error('Error fetching price history:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        await connection.end();
    }
}; 