const { createConnection } = require('../database/dbConfig');

exports.getAvailableFilters = async (req, res) => {
    const connection = await createConnection();
    try {
        const [categories] = await connection.execute('SELECT * FROM categories');
        
        const [merchants] = await connection.execute('SELECT id, name FROM merchants');
        
        const [priceRanges] = await connection.execute(`
            SELECT 
                MIN(current_price) as min_price,
                MAX(current_price) as max_price
            FROM product_prices
        `);

        res.json({
            categories: categories,
            merchants: merchants,
            priceRange: {
                min: priceRanges[0].min_price || 0,
                max: priceRanges[0].max_price || 1000
            }
        });
    } catch (error) {
        console.error('Error fetching filters:', error);
        res.status(500).json({ error: 'Failed to fetch filters' });
    } finally {
        await connection.end();
    }
}; 