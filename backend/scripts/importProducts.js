const { createConnection } = require('../database/dbConfig');
const fs = require('fs').promises;
const path = require('path');

async function importProductsFromMerchant(filePath) {
    const connection = await createConnection();
    
    try {
        const jsonData = await fs.readFile(filePath, 'utf8');
        const data = JSON.parse(jsonData);
        const { merchant, products } = data;

        const [merchantResult] = await connection.execute(
            'SELECT id FROM stores WHERE name = ?',
            [merchant]
        );

        if (merchantResult.length === 0) {
            throw new Error(`Merchant not found: ${merchant}`);
        }
        const merchantId = merchantResult[0].id;

        await connection.execute(
            `DELETE pp FROM product_prices pp
             JOIN product_stores ps ON pp.product_store_id = ps.id
             WHERE ps.store_id = ?`,
            [merchantId]
        );
        await connection.execute(
            'DELETE FROM product_stores WHERE store_id = ?',
            [merchantId]
        );

        for (const product of products) {
            let [existingProduct] = await connection.execute(
                'SELECT id FROM products WHERE name = ? AND brand = ?',
                [product.name, product.brand]
            );

            let productId;
            if (existingProduct.length === 0) {
                const [categoryResult] = await connection.execute(
                    'SELECT id FROM categories WHERE name = ?',
                    [product.category]
                );

                const [productResult] = await connection.execute(
                    'INSERT INTO products (name, description, brand, image, category_id) VALUES (?, ?, ?, ?, ?)',
                    [product.name, product.description, product.brand, product.image, categoryResult[0].id]
                );
                productId = productResult.insertId;
            } else {
                productId = existingProduct[0].id;
            }

            for (const variant of product.variants) {
                const [colorResult] = await connection.execute(
                    'SELECT id FROM colors WHERE name = ?',
                    [variant.color]
                );

                for (const size of variant.sizes) {
                    const [sizeResult] = await connection.execute(
                        'SELECT id FROM sizes WHERE name = ?',
                        [size]
                    );

                    const [variantResult] = await connection.execute(
                        'INSERT INTO product_variants (product_id, color_id, size_id) VALUES (?, ?, ?)',
                        [productId, colorResult[0].id, sizeResult[0].id]
                    );

                    const [storeResult] = await connection.execute(
                        'INSERT INTO product_stores (product_variant_id, store_id, store_url) VALUES (?, ?, ?)',
                        [variantResult.insertId, merchantId, product.store_url]
                    );

                    await connection.execute(
                        'INSERT INTO product_prices (product_store_id, current_price, original_price, is_on_sale) VALUES (?, ?, ?, ?)',
                        [storeResult.insertId, product.current_price, product.original_price, product.is_on_sale]
                    );
                }
            }
        }

        console.log(`Successfully imported products from ${merchant}`);
    } catch (error) {
        console.error('Error importing products:', error);
        throw error;
    } finally {
        await connection.end();
    }
}

async function importAllMerchantProducts() {
    const dataDir = path.join(__dirname, '../data');
    const files = await fs.readdir(dataDir);
    
    for (const file of files) {
        if (file.endsWith('_products.json')) {
            console.log(`Importing products from ${file}...`);
            await importProductsFromMerchant(path.join(dataDir, file));
        }
    }
}

if (require.main === module) {
    importAllMerchantProducts().catch(console.error);
} 