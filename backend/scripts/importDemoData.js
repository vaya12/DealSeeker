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


async function createDbTables(connection) {
    try {
        const sqlQueries = [
            `
            CREATE TABLE IF NOT EXISTS merchants (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                logo VARCHAR(255),
                description TEXT,
                catalog_url VARCHAR(255) NOT NULL,
                last_sync TIMESTAMP NULL,
                status ENUM('active', 'inactive') DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            );
            `,
            `
            CREATE TABLE IF NOT EXISTS sync_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                merchant_id INT NOT NULL,
                status ENUM('success', 'error') NOT NULL,
                products_updated INT DEFAULT 0,
                error_message TEXT,
                started_at TIMESTAMP NOT NULL,
                completed_at TIMESTAMP NOT NULL,
                FOREIGN KEY (merchant_id) REFERENCES merchants(id)
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
                id INT PRIMARY KEY AUTO_INCREMENT,
                product_id INT,
                product_store_id INT,
                size_id INT,
                color_id INT,
                current_price DECIMAL(10,2),
                original_price DECIMAL(10,2),
                stock ENUM('in_stock', 'out_of_stock', 'limited'),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (product_id) REFERENCES products(id),
                FOREIGN KEY (product_store_id) REFERENCES merchants(id)
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
                id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                brand VARCHAR(100),
                category_id INT,
                image VARCHAR(500),
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
            `
        ];

        for (const query of sqlQueries) {
            await connection.execute(query);
        }
        
        console.log('Tables created successfully');
    } catch (error) {
        console.error('Error creating tables:', error);
        throw error;
    } finally {
        await connection.end();
    }
}


async function importInitialData() {
    const connection = await createConnection();
    
    try {
        await importMerchants(connection);
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

async function importMerchants(connection) {
    try {
        const merchants = [
            { 
                name: 'H&M Online', 
                description: 'Fashion retailer',
                logo: 'https://example.com/hm-logo.png',
                catalog_url: 'http://localhost:3001/api/catalog/1',
                status: 'active'
            },
            { 
                name: 'Zara', 
                description: 'Fashion brand',
                logo: 'https://example.com/zara-logo.png',
                catalog_url: 'http://localhost:3001/api/catalog/2',
                status: 'active'
            },
            {
                name: 'Nike',
                description: 'Sports brand',
                logo: 'https://example.com/nike-logo.png',
                catalog_url: 'http://localhost:3001/api/catalog/3',
                status: 'active'
            }
        ];
        
        for (const merchant of merchants) {
            await connection.execute(
                'INSERT IGNORE INTO merchants (name, description, logo, catalog_url, status) VALUES (?, ?, ?, ?, ?)',
                [merchant.name, merchant.description, merchant.logo, merchant.catalog_url, merchant.status]
            );
        }
        
        console.log('Merchants imported successfully');
    } catch (error) {
        console.error('Error importing merchants:', error);
        throw error;
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
                const [colorResult] = await connection.execute('SELECT id FROM colors ORDER BY RAND() LIMIT 1');
                const [sizeResult] = await connection.execute('SELECT id FROM sizes ORDER BY RAND() LIMIT 1');
                
                await connection.execute(
                    `INSERT INTO product_prices 
                    (product_id, product_store_id, color_id, size_id, current_price, original_price, stock) 
                    VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [
                        productId,
                        price.merchant_id || null,
                        colorResult[0].id,
                        sizeResult[0].id,
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

async function importMerchantProducts(merchantId, catalogUrl) {
    const connection = await createConnection();
    try {
        await connection.execute(
            'DELETE products FROM products ' +
            'INNER JOIN product_prices ON products.id = product_prices.product_id ' +
            'WHERE product_prices.product_store_id = ?',
            [merchantId]
        );

        const response = await fetch(catalogUrl);
        const catalogData = await response.json();
        
        for (const product of catalogData.products) {
            const [productResult] = await connection.execute(
                `INSERT INTO products 
                (name, description, brand, category_id, image, created_at, updated_at) 
                VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
                [
                    product.name,
                    product.description,
                    product.brand,
                    product.category_id,
                    product.image
                ]
            );
            
            const productId = productResult.insertId;

            for (const price of product.prices) {
                await connection.execute(
                    `INSERT INTO product_prices 
                    (product_id, product_store_id, current_price, original_price, stock) 
                    VALUES (?, ?, ?, ?, ?)`,
                    [
                        productId,
                        merchantId, 
                        price.current_price,
                        price.original_price,
                        price.stock
                    ]
                );
            }
        }

        await connection.execute(
            `INSERT INTO sync_logs 
            (merchant_id, status, products_updated, started_at, completed_at) 
            VALUES (?, 'success', ?, NOW(), NOW())`,
            [merchantId, catalogData.products.length]
        );

        await connection.execute(
            'UPDATE merchants SET last_sync = NOW() WHERE id = ?',
            [merchantId]
        );

        console.log(`Successfully imported ${catalogData.products.length} products for merchant ${merchantId}`);

    } catch (error) {
        console.error('Error importing merchant products:', error);
        
        await connection.execute(
            `INSERT INTO sync_logs 
            (merchant_id, status, error_message, started_at, completed_at) 
            VALUES (?, 'error', ?, NOW(), NOW())`,
            [merchantId, error.message]
        );
        
        throw error;
    } finally {
        await connection.end();
    }
}

module.exports = {
    importMerchantProducts,
    createDbTables,
    importInitialData
};

async function main() {
    const connection = await createConnection();
    await deleteDbTables(connection);
    await createDbTables(connection);
    await importInitialData();
}

main().catch(console.error);
