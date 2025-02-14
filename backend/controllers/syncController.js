const { createConnection } = require('../database/dbConfig');
const cron = require('node-cron');

exports.syncMerchantProducts = async (merchantId) => {
    const connection = await createConnection();
    try {
        const [merchant] = await connection.execute(`
            SELECT m.*, s.name as store_name, s.website_url 
            FROM merchants m
            JOIN stores s ON m.store_id = s.id
            WHERE m.id = ?
        `, [merchantId]);

        if (!merchant[0]) {
            throw new Error('Merchant not found');
        }

        const [logResult] = await connection.execute(
            'INSERT INTO sync_logs (merchant_id, status, started_at) VALUES (?, ?, NOW())',
            [merchantId, 'success']
        );
        const logId = logResult.insertId;

        try {
            await connection.execute(`
                UPDATE sync_logs 
                SET status = 'success',
                    products_updated = ?,
                    completed_at = NOW()
                WHERE id = ?
            `, [0, logId]);

            await connection.execute(
                'UPDATE merchants SET last_sync = NOW() WHERE id = ?',
                [merchantId]
            );

        } catch (error) {
            await connection.execute(`
                UPDATE sync_logs 
                SET status = 'failed',
                    error_message = ?,
                    completed_at = NOW()
                WHERE id = ?
            `, [error.message, logId]);

            throw error;
        }

    } catch (error) {
        console.error(`Error syncing merchant ${merchantId}:`, error);
        throw error;
    } finally {
        await connection.end();
    }
};

exports.checkMerchantsForSync = async () => {
    const connection = await createConnection();
    try {
        const [merchants] = await connection.execute(`
            SELECT id 
            FROM merchants 
            WHERE status = 'active'
            AND (
                last_sync IS NULL 
                OR TIMESTAMPDIFF(HOUR, last_sync, NOW()) >= sync_frequency
            )
        `);

        for (const merchant of merchants) {
            try {
                await this.syncMerchantProducts(merchant.id);
                console.log(`Successfully synced merchant ${merchant.id}`);
            } catch (error) {
                console.error(`Failed to sync merchant ${merchant.id}:`, error);
            }
        }
    } catch (error) {
        console.error('Error checking merchants for sync:', error);
    } finally {
        await connection.end();
    }
};

exports.startSyncCronJob = () => {
    cron.schedule('0 * * * *', async () => {
        console.log('Running merchant sync check...');
        await this.checkMerchantsForSync();
    });

    console.log('Merchant sync cron job scheduled');
}; 