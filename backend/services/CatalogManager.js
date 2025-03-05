const { createConnection } = require('../database/dbConfig');

class CatalogManager {
    static async validateCatalog(catalogData) {
        const errors = [];

        if (!Array.isArray(catalogData.products)) {
            errors.push('Products array is required');
            return { isValid: false, errors };
        }

        catalogData.products.forEach((product, index) => {
            if (!product.name) errors.push(`Product ${index + 1}: Name is required`);
            if (!product.description) errors.push(`Product ${index + 1}: Description is required`);
            if (!product.brand) errors.push(`Product ${index + 1}: Brand is required`);
            if (!product.image) errors.push(`Product ${index + 1}: Image is required`);
            if (!Array.isArray(product.prices)) errors.push(`Product ${index + 1}: Prices array is required`);
            
            if (product.prices) {
                product.prices.forEach((price, priceIndex) => {
                    if (!price.current_price) {
                        errors.push(`Product ${index + 1}, Price ${priceIndex + 1}: Current price is required`);
                    }
                });
            }
        });

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    static async processCatalog(catalogData, merchantId) {
        const connection = await createConnection();
        try {
            await connection.beginTransaction();
            console.log('Processing catalog for merchant:', merchantId);

            const validation = await this.validateCatalog(catalogData);
            if (!validation.isValid) {
                throw new Error(`Invalid catalog: ${validation.errors.join(', ')}`);
            }

            const [existingProducts] = await connection.execute(
                'SELECT id, name FROM products WHERE merchant_id = ?',
                [merchantId]
            );

            const newProductNames = new Set(catalogData.products.map(p => p.name));
            
            const productsToDelete = existingProducts.filter(p => !newProductNames.has(p.name));
            
            for (const product of productsToDelete) {
                await connection.execute(
                    'DELETE FROM product_prices WHERE product_id = ?',
                    [product.id]
                );
                
                await connection.execute(
                    'DELETE FROM products WHERE id = ?',
                    [product.id]
                );
                
                console.log(`Deleted product: ${product.name}`);
            }

            let importedCount = 0;

            for (const product of catalogData.products) {
                console.log('Processing product:', product.name);

                const [existingProduct] = await connection.execute(
                    'SELECT id FROM products WHERE name = ? AND brand = ? AND merchant_id = ?',
                    [product.name, product.brand, merchantId]
                );

                let productId;

                if (existingProduct.length > 0) {
                    productId = existingProduct[0].id;
                    await connection.execute(`
                        UPDATE products 
                        SET description = ?, 
                            image = ?,
                            category_id = ?
                        WHERE id = ?
                    `, [
                        product.description,
                        product.image,
                        product.category_id,
                        productId
                    ]);
                    
                    await connection.execute(
                        'DELETE FROM product_prices WHERE product_id = ? AND product_store_id = ?',
                        [productId, merchantId]
                    );
                } else {
                    const [result] = await connection.execute(`
                        INSERT INTO products 
                        (name, description, brand, category_id, image, merchant_id)
                        VALUES (?, ?, ?, ?, ?, ?)
                    `, [
                        product.name,
                        product.description,
                        product.brand,
                        product.category_id,
                        product.image,
                        merchantId
                    ]);
                    productId = result.insertId;
                }

                for (const price of product.prices) {
                    await connection.execute(`
                        INSERT INTO product_prices 
                        (product_id, product_store_id, size_id, color_id, current_price, original_price, stock)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                    `, [
                        productId,
                        merchantId,
                        price.size_id,
                        price.color_id,
                        price.current_price,
                        price.original_price || price.current_price,
                        price.stock || 'in_stock'
                    ]);
                }

                importedCount++;
            }

            await connection.execute(`
                INSERT INTO sync_logs 
                (merchant_id, status, products_updated, started_at, completed_at)
                VALUES (?, 'success', ?, NOW(), NOW())
            `, [merchantId, importedCount]);

            await connection.execute(
                'UPDATE merchants SET last_sync = NOW() WHERE id = ?',
                [merchantId]
            );

            await connection.commit();
            console.log(`Successfully processed ${importedCount} products, deleted ${productsToDelete.length} products`);
            
            return { 
                success: true, 
                imported: importedCount,
                deleted: productsToDelete.length,
                message: `Successfully synchronized ${importedCount} products (${productsToDelete.length} deleted)`
            };

        } catch (error) {
            await connection.rollback();
            console.error('Error processing catalog:', error);
            
            await connection.execute(`
                INSERT INTO sync_logs 
                (merchant_id, status, error_message, started_at, completed_at)
                VALUES (?, 'failed', ?, NOW(), NOW())
            `, [merchantId, error.message]);
            
            throw error;
        } finally {
            await connection.end();
        }
    }

    static async getOrCreateCategory(connection, categoryName) {
        if (!categoryName) return null;

        const [categories] = await connection.execute(
            'SELECT id FROM categories WHERE name = ?',
            [categoryName]
        );

        if (categories.length > 0) {
            return categories[0].id;
        }

        const [result] = await connection.execute(
            'INSERT INTO categories (name) VALUES (?)',
            [categoryName]
        );

        return result.insertId;
    }
}

module.exports = CatalogManager; 