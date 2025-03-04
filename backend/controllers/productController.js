const { createConnection } = require('../database/dbConfig');

exports.getAllProducts = async (req, res) => {
    const connection = await createConnection();
    try {
        const [products] = await connection.execute(`
            SELECT 
                p.id,
                p.name,
                p.description,
                p.brand,
                p.category_id,
                p.image,
                p.merchant_id,
                m.name as merchant_name,
                m.catalog_url as website_url,
                c.name as category_name
            FROM products p
            LEFT JOIN merchants m ON p.merchant_id = m.id
            LEFT JOIN categories c ON p.category_id = c.id
        `);

        const [prices] = await connection.execute(`
            SELECT 
                pp.*,
                s.name as size_name,
                c.name as color_name,
                c.hex_code,
                m.name as store_name,
                m.catalog_url as store_url
            FROM product_prices pp
            LEFT JOIN sizes s ON pp.size_id = s.id
            LEFT JOIN colors c ON pp.color_id = c.id
            LEFT JOIN merchants m ON pp.product_store_id = m.id
            WHERE pp.stock = 'in_stock'
        `);

        // Форматираме продуктите
        const formattedProducts = products.map(product => {
            const productPrices = prices.filter(p => p.product_id === product.id)
                .map(price => ({
                    id: price.id,
                    current_price: parseFloat(price.current_price),
                    original_price: parseFloat(price.original_price),
                    store_name: price.store_name,
                    website_url: price.store_url,
                    stock: price.stock,
                    size: price.size_name,
                    color: {
                        name: price.color_name,
                        hex_code: price.hex_code
                    }
                }));

            const uniqueColors = [...new Set(productPrices
                .filter(p => p.color && p.color.hex_code)
                .map(p => p.color.hex_code))];

            const uniqueSizes = [...new Set(productPrices
                .filter(p => p.size)
                .map(p => p.size))];

            return {
                id: product.id,
                name: product.name,
                description: product.description,
                brand: product.brand,
                category_id: product.category_id,
                category_name: product.category_name,
                image: product.image,
                merchant_id: product.merchant_id,
                merchant_name: product.merchant_name,
                prices: productPrices,
                colors: uniqueColors.map(hex => ({
                    hex_code: hex,
                    name: productPrices.find(p => p.color?.hex_code === hex)?.color?.name
                })),
                sizes: uniqueSizes,
                min_price: Math.min(...productPrices.map(p => p.current_price)),
                available_colors: uniqueColors,
                available_sizes: uniqueSizes
            };
        });

        res.json(formattedProducts);

    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    } finally {
        await connection.end();
    }
};

exports.getProduct = async (req, res) => {
    const connection = await createConnection();
    try {
        const [products] = await connection.execute(`
            SELECT 
                p.*,
                pp.current_price,
                pp.original_price,
                pp.stock,
                m.name as merchant_name,
                c.name as category_name
            FROM products p
            LEFT JOIN product_prices pp ON p.id = pp.product_id
            LEFT JOIN merchants m ON pp.product_store_id = m.id
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.id = ?
        `, [req.params.id]);

        if (products.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json(products[0]);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ error: 'Failed to fetch product' });
    } finally {
        await connection.end();
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
                m.name as merchant_name
            FROM product_prices pp
            LEFT JOIN merchants m ON pp.product_store_id = m.id
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

const getProducts = async (req, res) => {
  try {
    const query = `
      SELECT DISTINCT 
        p.id,
        p.name,
        p.description,
        p.brand,
        p.category_id,
        p.image,
        p.created_at,
        p.updated_at,
        pm.current_price,
        pm.original_price,
        pm.stock,
        m.name as merchant_name,
        c.name as category_name
      FROM products p
      LEFT JOIN product_merchants pm ON p.id = pm.product_id
      LEFT JOIN merchants m ON pm.merchant_id = m.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE m.name IS NOT NULL
      ORDER BY p.id, pm.current_price ASC
    `;

    const products = await db.query(query);

    const groupedProducts = products.rows.reduce((acc, product) => {
      if (!acc[product.id]) {
        acc[product.id] = {
          ...product,
          merchants: []
        };
      }
      
      acc[product.id].merchants.push({
        merchant_name: product.merchant_name,
        current_price: product.current_price,
        original_price: product.original_price,
        stock: product.stock
      });

      acc[product.id].merchants.sort((a, b) => 
        parseFloat(a.current_price) - parseFloat(b.current_price)
      );

      return acc;
    }, {});

    res.json(Object.values(groupedProducts));
  } catch (error) {
    console.error('Error getting products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 