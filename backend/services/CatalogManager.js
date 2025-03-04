const { createConnection } = require('../database/dbConfig');

class CatalogManager {
    static async validateCatalog(catalogData) {
        const requiredFields = ['products', 'store_info'];
        const errors = [];

        for (const field of requiredFields) {
            if (!catalogData[field]) {
                errors.push(`Missing required field: ${field}`);
            }
        }

        if (catalogData.store_info) {
            if (!catalogData.store_info.name) errors.push('Store name is required');
            if (!catalogData.store_info.website_url) errors.push('Website URL is required');
        }

        if (catalogData.products && Array.isArray(catalogData.products)) {
            catalogData.products.forEach((product, index) => {
                if (!product.name) errors.push(`Product ${index + 1}: Name is required`);
                if (!product.price) errors.push(`Product ${index + 1}: Price is required`);
                if (!product.url) errors.push(`Product ${index + 1}: Product URL is required`);
            });
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    static async processCatalog(catalogData, merchantId) {
        const connection = await createConnection();
        try {
            await connection.beginTransaction();

            const [storeResult] = await connection.execute(`
                UPDATE stores 
                SET 
                    website_url = ?,
                    catalog_url = ?,
                    last_sync = NOW(),
                    status = 'active'
                WHERE id = (
                    SELECT store_id 
                    FROM merchants 
                    WHERE id = ?
                )
            `, [
                catalogData.store_info.website_url,
                catalogData.store_info.catalog_url,
                merchantId
            ]);

            for (const product of catalogData.products) {
                const [existing] = await connection.execute(
                    'SELECT id FROM products WHERE merchant_id = ? AND external_id = ?',
                    [merchantId, product.id]
                );

                if (existing.length > 0) {
                    await connection.execute(`
                        UPDATE products 
                        SET 
                            name = ?,
                            description = ?,
                            brand = ?,
                            category_id = ?,
                            image_url = ?,
                            url = ?,
                            last_updated = NOW()
                        WHERE id = ?
                    `, [
                        product.name,
                        product.description,
                        product.brand,
                        await this.getOrCreateCategory(connection, product.category),
                        product.image_url,
                        product.url,
                        existing[0].id
                    ]);

                    await connection.execute(`
                        INSERT INTO product_prices 
                        (product_id, current_price, original_price, stock_status, created_at)
                        VALUES (?, ?, ?, ?, NOW())
                    `, [
                        existing[0].id,
                        product.price,
                        product.original_price || product.price,
                        product.stock_status || 'in_stock'
                    ]);
                } else {
                    const [result] = await connection.execute(`
                        INSERT INTO products 
                        (merchant_id, external_id, name, description, brand, category_id, image_url, url, created_at)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
                    `, [
                        merchantId,
                        product.id,
                        product.name,
                        product.description,
                        product.brand,
                        await this.getOrCreateCategory(connection, product.category),
                        product.image_url,
                        product.url
                    ]);

                    await connection.execute(`
                        INSERT INTO product_prices 
                        (product_id, current_price, original_price, stock_status, created_at)
                        VALUES (?, ?, ?, ?, NOW())
                    `, [
                        result.insertId,
                        product.price,
                        product.original_price || product.price,
                        product.stock_status || 'in_stock'
                    ]);
                }
            }

            await connection.execute(`
                INSERT INTO sync_logs 
                (merchant_id, status, products_updated, started_at, completed_at)
                VALUES (?, 'success', ?, NOW(), NOW())
            `, [merchantId, catalogData.products.length]);

            await connection.commit();
            return { success: true, productsProcessed: catalogData.products.length };

        } catch (error) {
            await connection.rollback();
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