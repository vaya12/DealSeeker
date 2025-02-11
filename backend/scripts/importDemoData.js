const { createConnection } = require('../database/dbConfig');
const fs = require('fs').promises;

async function deleteDbTables(connection) {
    try {
        await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
        
        await connection.execute('DROP TABLE IF EXISTS catalog_uploads');
        await connection.execute('DROP TABLE IF EXISTS catalog_sync_logs');
        await connection.execute('DROP TABLE IF EXISTS price_history');
        await connection.execute('DROP TABLE IF EXISTS product_categories');
        await connection.execute('DROP TABLE IF EXISTS product_images');
        await connection.execute('DROP TABLE IF EXISTS products');
        await connection.execute('DROP TABLE IF EXISTS stores');
        await connection.execute('DROP TABLE IF EXISTS merchants');
        await connection.execute('DROP TABLE IF EXISTS users');
        await connection.execute('DROP TABLE IF EXISTS categories');
        
        await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
        
        console.log('Tables deleted successfully');
    } catch (error) {
        console.error('Error deleting tables:', error);
        throw error;
    }
}


async function createDbTables() {
    const connection = await createConnection();
    try {
        const sqlQueries = [
            `
            CREATE TABLE IF NOT EXISTS stores (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                logo VARCHAR(255),
                website_url VARCHAR(255) NOT NULL,
                catalog_url VARCHAR(255) NOT NULL,
                status ENUM('active', 'inactive') DEFAULT 'active'
            );
            `,
            `
            CREATE TABLE IF NOT EXISTS categories (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                parent_id INT DEFAULT 0
            );
            `,
            `
            CREATE TABLE IF NOT EXISTS product_prices (
                product_id INT,
                product_store_id INT,
                size_id INT DEFAULT 0,
                color_id INT DEFAULT 0,
                current_price DECIMAL(10, 2) NOT NULL,
                original_price DECIMAL(10, 2),
                stock ENUM('in_stock', 'out_of_stock', 'limited') DEFAULT 'in_stock',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            );
            `,
            `
            CREATE TABLE IF NOT EXISTS colors (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(50) NOT NULL,
                hex_code VARCHAR(7)
            );
            `,
            `
            CREATE TABLE IF NOT EXISTS sizes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(50) NOT NULL
            );
            `,
            `
            CREATE TABLE IF NOT EXISTS products (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                brand VARCHAR(100),
                category_id INT,
                image VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            );
            `,
            `
            CREATE TABLE IF NOT EXISTS product_views (
                id INT AUTO_INCREMENT PRIMARY KEY,
                product_id INT,
                ip_address VARCHAR(45),
                viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            `,
        ];

        for (const query of sqlQueries) {
            await connection.execute(query);
        }
    } catch (error) {
        console.error('Error creating tables:', error);
    } finally {
        await connection.end();
    }
}


async function importInitialData() {
    const connection = await createConnection();
    
    try {
        await importStores(connection);
        await importCategories(connection);
        await importColorsAndSizes(connection);
        await importProducts(connection);
        
        console.log('Demo data import completed successfully!');
    } catch (error) {
        console.error('Error importing demo data:', error);
    } finally {
        await connection.end();
    }
}

async function importStores(connection) {
    const stores = [
        { 
            name: 'H&M Online', 
            website_url: 'https://www.hm.com',
            catalog_url: 'https://www.hm.com/catalog',
            status: 'active'
        },
        { 
            name: 'Zara', 
            website_url: 'https://www.zara.com',
            catalog_url: 'https://www.zara.com/catalog',
            status: 'active'
        },
        {
            name: 'Nike',
            website_url: 'https://www.nike.com',
            catalog_url: 'https://www.nike.com/catalog',
            status: 'active'
        },
        
    ];
    
    for (const store of stores) {
        await connection.execute(
            'INSERT IGNORE INTO stores (name, website_url, catalog_url, status) VALUES (?, ?, ?, ?)',
            [store.name, store.website_url, store.catalog_url, store.status]
        );
    }
}

async function importCategories(connection) {
    const categories = [
        { name: 'clothes', parent_id: 0 },
        { name: 'shoes', parent_id: 0 },
        { name: 'accessories', parent_id: 0 }
    ];
    
    for (const category of categories) {
        await connection.execute(
            'INSERT IGNORE INTO categories (name, parent_id) VALUES (?, ?)',
            [category.name, category.parent_id]
        );
    }
}

async function importColorsAndSizes(connection) {
    const colors = [
        { name: 'Black', hex_code: '#000000' },
        { name: 'White', hex_code: '#FFFFFF' },
        { name: 'Gray', hex_code: '#808080' },
        { name: 'Navy', hex_code: '#000080' },
        { name: 'Gold', hex_code: '#FFD700' },
        { name: 'Silver', hex_code: '#C0C0C0' }
    ];
    
    const sizes = ['XS', 'S', 'M', 'L', 'XL', '40', '41', '42', '43', 'One Size'];
    
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
    try {
        const jsonData = await fs.readFile(__dirname + '/../data/demo_products_catalogue.json', 'utf8');
        const products = JSON.parse(jsonData);

        for (const product of products) {
            const createdAt = product.created_at ? 
                new Date(product.created_at).toISOString().slice(0, 19).replace('T', ' ') : 
                new Date().toISOString().slice(0, 19).replace('T', ' ');
            
            const updatedAt = product.updated_at ? 
                new Date(product.updated_at).toISOString().slice(0, 19).replace('T', ' ') : 
                new Date().toISOString().slice(0, 19).replace('T', ' ');

            const [productResult] = await connection.execute(
                `INSERT INTO products 
                (name, description, brand, category_id, image, created_at, updated_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    product.name,
                    product.description || null,
                    product.brand || null,
                    product.category_id || null,
                    product.image || null,
                    createdAt,
                    updatedAt
                ]
            );
            const productId = productResult.insertId;

            for (const price of product.prices) {                       
                    await connection.execute(
                        `INSERT INTO product_prices 
                        (product_id, product_store_id, size_id, color_id, current_price, original_price, stock) 
                        VALUES (?, ?, ?, ?, ?, ?, ?)`,
                        [
                            productId,
                            price.product_store_id || null,
                            price.size_id || null,
                            price.color_id || null,
                            price.current_price,
                            price.original_price || null,
                            price.stock || 'in_stock'
                        ]
                    );
                
            }
        }
        console.log('Products imported successfully!');
    } catch (error) {
        console.error('Error importing products:', error);
        throw error;
    }
}

async function main() {
    const connection = await createConnection();
    await deleteDbTables(connection);
    await createDbTables();
    await importInitialData();
}

main().catch(console.error);
