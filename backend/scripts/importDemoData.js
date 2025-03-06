const { createConnection } = require('../database/dbConfig');
const fs = require('fs').promises;
const path = require('path');
const fetch = require('node-fetch');

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
                store_url VARCHAR(255),
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
                store_url VARCHAR(255),
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
                store_url: 'https://www2.hm.com',
                status: 'active'
            },
            { 
                name: 'Zara', 
                description: 'Fashion brand',
                logo: 'https://example.com/zara-logo.png',
                catalog_url: 'http://localhost:3002/api/catalog/2',
                store_url: 'https://www.zara.com',
                status: 'active'
            },
            {
                name: 'Nike',
                description: 'Sports brand',
                logo: 'https://example.com/nike-logo.png',
                catalog_url: 'http://localhost:3002/api/catalog/3',
                store_url: 'https://www.nike.com',
                status: 'active'
            },
            {
                name: 'Adidas',
                description: 'Sports brand',
                logo: 'https://example.com/adidas-logo.png',
                catalog_url: 'http://localhost:3002/api/catalog/4',
                store_url: 'https://www.adidas.com',
                status: 'active'
            },
            {
                name: 'Puma',
                description: 'Sports brand',
                logo: 'https://example.com/puma-logo.png',
                catalog_url: 'http://localhost:3002/api/catalog/5',
                store_url: 'https://www.puma.com',
                status: 'active'
            }
        ];
        
        for (const merchant of merchants) {
            await connection.execute(
                'INSERT IGNORE INTO merchants (name, description, logo, catalog_url, store_url, status) VALUES (?, ?, ?, ?, ?, ?)',
                [merchant.name, merchant.description, merchant.logo, merchant.catalog_url, merchant.store_url, merchant.status]
            );
        }
        
        console.log('Merchants imported successfully');
    } catch (error) {
        console.error('Error importing merchants:', error);
        throw error;
    }
}

async function importCategories(connection) {
    try {
        await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
        
        await connection.execute('TRUNCATE TABLE categories');
        
        const categories = [
            { id: 1, name: 'clothes' },
            { id: 2, name: 'shoes' },
            { id: 3, name: 'accessories' },
            { id: 4, name: 'bags' }
        ];

        for (const category of categories) {
            await connection.execute(
                'INSERT INTO categories (id, name) VALUES (?, ?)',
                [category.id, category.name]
            );
        }

        await connection.execute('SET FOREIGN_KEY_CHECKS = 1');

        console.log('Categories imported successfully');
    } catch (error) {
        console.error('Error importing categories:', error);
        throw error;
    }
}

async function importColorsAndSizes(connection) {
    try {
        const colors = [
            { id: 1, name: 'Black', hex_code: '#000000' },
            { id: 2, name: 'White', hex_code: '#FFFFFF' },
            { id: 3, name: 'Gray', hex_code: '#808080' },
            { id: 4, name: 'Navy', hex_code: '#000080' },
            { id: 5, name: 'Gold', hex_code: '#FFD700' },
            { id: 6, name: 'Silver', hex_code: '#C0C0C0' },
            { id: 7, name: 'Red', hex_code: '#D2042D' },
            { id: 8, name: 'Blue', hex_code: '#89CFF0' },
            { id: 9, name: 'Green', hex_code: '#008000' },
            { id: 10, name: 'Yellow', hex_code: '#FFFF00' },
            { id: 11, name: 'Orange', hex_code: '#FFA500' },
            { id: 12, name: 'Purple', hex_code: '#800080' },
            { id: 13, name: 'Pink', hex_code: '#FFC0CB' },
            { id: 14, name: 'Brown', hex_code: '#A52A2A' },
            { id: 15, name: 'Beige', hex_code: '#F5F5DC' },
            { id: 16, name: 'Turquoise', hex_code: '#40E0D0' },
            { id: 17, name: 'Olive', hex_code: '#808000' },
            { id: 18, name: 'Teal', hex_code: '#008080' }
        ];
        
        const sizes = [
            { id: 1, name: 'XS' },
            { id: 2, name: 'S' },
            { id: 3, name: 'M' },
            { id: 4, name: 'L' },
            { id: 5, name: 'XL' },
            { id: 6, name: '40' },
            { id: 7, name: '41' },
            { id: 8, name: '42' },
            { id: 9, name: '43' },
            { id: 10, name: 'One Size' }
        ];

        await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
        await connection.execute('TRUNCATE TABLE colors');
        await connection.execute('TRUNCATE TABLE sizes');
        await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
        
        for (const color of colors) {
            await connection.execute(
                'INSERT INTO colors (id, name, hex_code) VALUES (?, ?, ?)',
                [color.id, color.name, color.hex_code]
            );
        }
        
        for (const size of sizes) {
            await connection.execute(
                'INSERT INTO sizes (id, name) VALUES (?, ?)',
                [size.id, size.name]
            );
        }

        console.log('Colors and sizes imported successfully');
    } catch (error) {
        console.error('Error importing colors and sizes:', error);
        throw error;
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
                    
                    let [existingProduct] = await connection.execute(
                        'SELECT id FROM products WHERE name = ? AND brand = ? AND merchant_id = ?',
                        [product.name, product.brand, catalog.merchant_id]
                    );

                    let productId;
                    if (existingProduct.length === 0) {

                        const [result] = await connection.execute(
                            `INSERT INTO products 
                            (name, description, brand, category_id, image, merchant_id, store_url) 
                            VALUES (?, ?, ?, ?, ?, ?, ?)`,
                            [
                                product.name,
                                product.description || null,
                                product.brand,
                                product.category_id,
                                product.image,
                                catalog.merchant_id,
                                product.store_url || null
                            ]
                        );
                        productId = result.insertId;
                    } else {
                        productId = existingProduct[0].id;
                    }

                    for (const price of product.prices) {
                        await connection.execute(
                            `INSERT INTO product_prices 
                            (product_id, size_id, color_id, current_price, original_price, stock) 
                            VALUES (?, ?, ?, ?, ?, ?)`,
                            [
                                productId,
                                price.size_id || null,
                                price.color_id || null,
                                price.current_price || null,
                                price.original_price || null,
                                price.stock || 'in_stock'
                            ]
                        );
                    }
                }
                
            } catch (error) {
                console.error(`Error processing ${merchantFile}.json:`, error);
                throw error;
            }
        }
        console.log('All products imported successfully');
    } catch (error) {
        console.error('Error importing products:', error);
        throw error;
    }
}

async function importMerchantProducts(merchant_id, catalog_url, connection) {
    try {
        
        const response = await fetch(catalog_url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const catalog = await response.json();

        for (const product of catalog.products) {
            console.log('Processing product:', product.name);

            const [existingProducts] = await connection.execute(
                'SELECT id FROM products WHERE name = ? AND brand = ? AND description = ?',
                [product.name, product.brand, product.description]
            );

            let productId;

            if (existingProducts.length > 0) {
                productId = existingProducts[0].id;
                console.log(`Product "${product.name}" already exists with ID ${productId}`);
            } else {
                const [result] = await connection.execute(
                    `INSERT INTO products 
                    (name, description, brand, category_id, image, merchant_id) 
                    VALUES (?, ?, ?, ?, ?, ?)`,
                    [
                        product.name,
                        product.description,
                        product.brand,
                        product.category_id,
                        product.image,
                        merchant_id 
                    ]
                );
                productId = result.insertId;
                console.log(`Created new product "${product.name}" with ID ${productId}`);
            }

            for (const price of product.prices) {
                await connection.execute(
                    `INSERT INTO product_prices 
                    (product_id, product_store_id, size_id, color_id, current_price, original_price, stock) 
                    VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [
                        productId,
                        merchant_id,
                        price.size_id,
                        price.color_id,
                        price.current_price,
                        price.original_price,
                        price.stock || 'in_stock'
                    ]
                );
            }
        }

        console.log(`Successfully imported products for merchant ${merchant_id}`);
        return catalog.products;

    } catch (error) {
        console.error('Error importing products:', error);
        throw error;
    }
}

async function resetDatabase() {
    const connection = await createConnection();
    try {
        await deleteDbTables(connection);
        await createDbTables(connection);
        await importInitialData();
        console.log('Database reset completed successfully!');
    } catch (error) {
        console.error('Error resetting database:', error);
    } finally {
        await connection.end();
    }
}

resetDatabase().catch(console.error);

module.exports = {
    importMerchantProducts
};