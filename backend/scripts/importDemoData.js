const { createConnection } = require('../database/dbConfig');
const fs = require('fs').promises;
const path = require('path');

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
                id INT AUTO_INCREMENT PRIMARY KEY,
                product_id INT,
                size_id INT,
                color_id INT,
                current_price DECIMAL(10,2),
                original_price DECIMAL(10,2),
                stock ENUM('in_stock', 'out_of_stock', 'coming_soon'),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (product_id) REFERENCES products(id),
                FOREIGN KEY (size_id) REFERENCES sizes(id),
                FOREIGN KEY (color_id) REFERENCES colors(id)
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
                merchant_id INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (merchant_id) REFERENCES merchants(id),
                FOREIGN KEY (category_id) REFERENCES categories(id)
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
                catalog_url: 'http://localhost:3002/api/catalog/1',
                status: 'active'
            },
            { 
                name: 'Zara', 
                description: 'Fashion brand',
                logo: 'https://example.com/zara-logo.png',
                catalog_url: 'http://localhost:3002/api/catalog/2',
                status: 'active'
            },
            {
                name: 'Nike',
                description: 'Sports brand',
                logo: 'https://example.com/nike-logo.png',
                catalog_url: 'http://localhost:3002/api/catalog/3',
                status: 'active'
            },
            {
                name: 'Adidas',
                description: 'Sports brand',
                logo: 'https://example.com/adidas-logo.png',
                catalog_url: 'http://localhost:3002/api/catalog/4',
                status: 'active'
            },
            {
                name: 'Puma',
                description: 'Sports brand',
                logo: 'https://example.com/puma-logo.png',
                catalog_url: 'http://localhost:3002/api/catalog/5',
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
        { name: 'accessories', parent_id: 0 },
        { name: 'bags', parent_id: 0 }
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
        const [merchants] = await connection.execute('SELECT id, name, catalog_url FROM merchants');
        const existingMerchants = new Set(merchants.map(m => m.catalog_url));
        
        const [categories] = await connection.execute('SELECT id, name FROM categories');
        
        await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
        await connection.execute('DELETE FROM product_prices');
        await connection.execute('DELETE FROM products');
        await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
        console.log('Existing products and prices cleared');

        const merchantFiles = ['hm', 'adidas', 'nike', 'puma', 'zara'];
        
        for (const merchantFile of merchantFiles) {
            const filePath = path.join(__dirname, `../data/merchants/${merchantFile}.json`);
            
            try {
                const catalogData = await fs.readFile(filePath, 'utf8');
                const catalog = JSON.parse(catalogData);
                
                for (const product of catalog.products) {
                    if (product.category_id < 1 || product.category_id > 4) {
                        console.warn(`Invalid category_id ${product.category_id} for product ${product.name}, skipping...`);
                        continue;
                    }

                    const [result] = await connection.execute(
                        `INSERT INTO products 
                        (name, description, brand, category_id, image, merchant_id) 
                        VALUES (?, ?, ?, ?, ?, ?)`,
                        [
                            product.name || '',
                            product.description || '',
                            product.brand || '',
                            product.category_id,
                            product.image || '',
                            catalog.merchant_id
                        ]
                    );

                    if (product.prices && product.prices.length > 0) {
                        for (const price of product.prices) {
                            await connection.execute(
                                `INSERT INTO product_prices 
                                (product_id, size_id, color_id, current_price, original_price, stock) 
                                VALUES (?, ?, ?, ?, ?, ?)`,
                                [
                                    result.insertId,
                                    price.size_id || 1,
                                    price.color_id || 1,
                                    price.current_price || 0,
                                    price.original_price || 0,
                                    price.stock || 'in_stock'
                                ]
                            );
                        }
                    }
                }
                console.log(`Imported products for ${merchantFile}`);
            } catch (error) {
                console.error(`Error processing ${merchantFile}.json:`, error);
            }
        }
        console.log('All products imported successfully!');
    } catch (error) {
        console.error('Error importing products:', error);
        throw error;
    }
}

async function importMerchantProducts(merchantId, catalogUrl, existingConnection = null) {
    const connection = existingConnection || await createConnection();
    const shouldCloseConnection = !existingConnection;
    
    try {
        const response = await fetch(catalogUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch catalog: ${response.status}`);
        }

        const catalogData = await response.json();
        
        for (const product of catalogData.products) {
            const [productResult] = await connection.execute(
                `INSERT INTO products 
                (name, description, brand, category_id, image, merchant_id, created_at, updated_at) 
                VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
                [
                    product.name,
                    product.description,
                    product.brand,
                    product.category_id,
                    product.image,
                    merchantId
                ]
            );
            
            if (product.prices && product.prices.length > 0) {
                for (const price of product.prices) {
                    await connection.execute(
                        `INSERT INTO product_prices 
                        (product_id, product_store_id, size_id, color_id, current_price, original_price, stock) 
                        VALUES (?, ?, ?, ?, ?, ?, ?)`,
                        [
                            productResult.insertId,
                            merchantId,
                            price.size_id || 1,
                            price.color_id || 1,
                            price.current_price || 0,
                            price.original_price || 0,
                            price.stock || 'in_stock'
                        ]
                    );
                }
            }
        }

        return catalogData.products;

    } catch (error) {
        throw error;
    } finally {
        if (shouldCloseConnection) {
            await connection.end();
        }
    }
}

module.exports = {
    importMerchantProducts,
    createDbTables,
    importInitialData,
    importProducts
};

async function main() {
    const connection = await createConnection();
    
    try {
        const [merchants] = await connection.execute('SELECT COUNT(*) as count FROM merchants');
        
        if (merchants[0].count === 0) {
            console.log('No merchants found, initializing database...');
            await createDbTables(connection);
            await importInitialData();
        } else {
            console.log('Database already initialized, skipping demo data import');
        }
    } catch (error) {
        console.error('Error checking database:', error);
    } finally {
        await connection.end();
    }
}

main().catch(console.error);
