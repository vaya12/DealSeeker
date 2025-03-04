const { createConnection } = require('../database/dbConfig');

exports.getAvailableFilters = async (req, res) => {
    const connection = await createConnection();
    try {
        const [categories] = await connection.execute(`
            SELECT c.*, COUNT(p.id) as product_count 
            FROM categories c
            LEFT JOIN products p ON c.id = p.category_id
            GROUP BY c.id
        `);
        
        const [colors] = await connection.execute(`
            SELECT c.*, COUNT(DISTINCT pp.product_id) as product_count
            FROM colors c
            LEFT JOIN product_prices pp ON c.id = pp.color_id
            GROUP BY c.id
        `);
        
        const [sizes] = await connection.execute(`
            SELECT s.*, COUNT(DISTINCT pp.product_id) as product_count
            FROM sizes s
            LEFT JOIN product_prices pp ON s.id = pp.size_id
            GROUP BY s.id
        `);
        
        const [merchants] = await connection.execute(`
            SELECT m.id, m.name, COUNT(p.id) as product_count
            FROM merchants m
            LEFT JOIN products p ON m.id = p.merchant_id
            GROUP BY m.id
        `);
        
        const [priceRanges] = await connection.execute(`
            SELECT 
                MIN(current_price) as min_price,
                MAX(current_price) as max_price,
                AVG(current_price) as avg_price
            FROM product_prices
            WHERE stock = 'in_stock'
        `);

        res.json({
            categories: categories.map(c => ({
                ...c,
                product_count: parseInt(c.product_count)
            })),
            colors: colors.map(c => ({
                ...c,
                product_count: parseInt(c.product_count)
            })),
            sizes: sizes.map(s => ({
                ...s,
                product_count: parseInt(s.product_count)
            })),
            merchants: merchants.map(m => ({
                ...m,
                product_count: parseInt(m.product_count)
            })),
            priceRange: {
                min: Math.floor(priceRanges[0].min_price || 0),
                max: Math.ceil(priceRanges[0].max_price || 1000),
                avg: Math.round(priceRanges[0].avg_price || 0)
            }
        });
    } catch (error) {
        console.error('Error fetching filters:', error);
        res.status(500).json({ error: 'Failed to fetch filters' });
    } finally {
        await connection.end();
    }
};