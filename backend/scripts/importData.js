const { createConnection } = require('../database/dbConfig');
const fs = require('fs').promises;

async function importInitialData() {
    const connection = await createConnection();
    
    try {
        await importStores(connection);
        
        await importCategories(connection);
        
        await importColorsAndSizes(connection);
        
        await importProducts(connection);
        
        console.log('Data import completed successfully!');
    } catch (error) {
        console.error('Error importing data:', error);
    } finally {
        await connection.end();
    }
}

async function importStores(connection) {
    const stores = [
        { name: 'H&M Online', website_url: 'https://www.hm.com', catalog_url: 'https://www.hm.com/catalog' },
        { name: 'Emag', website_url: 'https://www.emag.bg', catalog_url: 'https://www.emag.bg/catalog' }
    ];
    
    for (const store of stores) {
        await connection.execute(
            'INSERT IGNORE INTO stores (name, website_url, catalog_url) VALUES (?, ?, ?)',
            [store.name, store.website_url, store.catalog_url]
        );
    }
}

async function importCategories(connection) {
    const categories = ['clothes', 'shoes', 'accessories'];
    
    for (const category of categories) {
        const [existing] = await connection.execute(
            'SELECT id FROM categories WHERE name = ?',
            [category]
        );
        
        if (existing.length === 0) {
            await connection.execute(
                'INSERT INTO categories (name) VALUES (?)',
                [category]
            );
        }
    }
}

async function importColorsAndSizes(connection) {
    const colors = [
        { name: 'Black', hex_code: '#000000' },
        { name: 'White', hex_code: '#FFFFFF' },
        { name: 'Gray', hex_code: '#808080' }
    ];
    
    const sizes = ['XS', 'S', 'M', 'L', 'XL'];
    
    for (const color of colors) {
        await connection.execute(
            'INSERT IGNORE INTO colors (name, hex_code) VALUES (?, ?)',
            [color.name, color.hex_code]
        );
    }
    
    for (const size of sizes) {
        await connection.execute(
            'INSERT IGNORE INTO sizes (name) VALUES (?)',
            [size]
        );
    }
}

async function importProducts(connection) {
    const jsonData = await fs.readFile(__dirname + '/../data/products_catalogue.json', 'utf8');
    const products = JSON.parse(jsonData);
    
    for (const product of products) {
        const [categoryResult] = await connection.execute(
            'SELECT id FROM categories WHERE name = ? LIMIT 1',
            [product.category]
        );
        
        if (categoryResult.length === 0) {
            throw new Error(`Category not found: ${product.category}`);
        }
        
        const [productResult] = await connection.execute(
            'INSERT INTO products (name, description, brand, image, category_id) VALUES (?, ?, ?, ?, ?)',
            [product.name, product.description, product.brand, product.image, categoryResult[0].id]
        );
        const productId = productResult.insertId;
        
        for (const size of product.size) {
            const [colorResult] = await connection.execute(
                'SELECT id FROM colors WHERE name = ?',
                [product.color]
            );
            const [sizeResult] = await connection.execute(
                'SELECT id FROM sizes WHERE name = ?',
                [size]
            );
            
            const [variantResult] = await connection.execute(
                'INSERT INTO product_variants (product_id, color_id, size_id) VALUES (?, ?, ?)',
                [productId, colorResult[0].id, sizeResult[0].id]
            );
            const variantId = variantResult.insertId;
            
            for (const link of product.link) {
                const [storeResult] = await connection.execute(
                    'SELECT id FROM stores WHERE name = ?',
                    [link.store]
                );
                
                const [productStoreResult] = await connection.execute(
                    'INSERT INTO product_stores (product_variant_id, store_id, store_url) VALUES (?, ?, ?)',
                    [variantId, storeResult[0].id, link.url]
                );
                
                const price = product.price.find(p => p.store === link.store);
                if (price) {
                    await connection.execute(
                        'INSERT INTO product_prices (product_store_id, current_price) VALUES (?, ?)',
                        [productStoreResult.insertId, parseFloat(price.price)]
                    );
                }
            }
        }
    }
}

importInitialData().catch(console.error);
