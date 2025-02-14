const { createConnection } = require('../database/dbConfig');

exports.getFavorites = async (req, res) => {
    const connection = await createConnection();
    try {
        const userId = req.user.userId;

        const [favorites] = await connection.execute(`
            SELECT p.*, f.created_at as favorited_at
            FROM favorites f
            JOIN products p ON f.product_id = p.id
            WHERE f.user_id = ?
            ORDER BY f.created_at DESC
        `, [userId]);

        res.json(favorites);
    } catch (error) {
        console.error('Error fetching favorites:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        await connection.end();
    }
};

exports.addFavorite = async (req, res) => {
    const connection = await createConnection();
    try {
        const { productId } = req.body;
        const userId = req.user.userId;

        const [existing] = await connection.execute(
            'SELECT id FROM favorites WHERE user_id = ? AND product_id = ?',
            [userId, productId]
        );

        if (existing.length > 0) {
            return res.status(400).json({ error: 'Product already in favorites' });
        }

        await connection.execute(
            'INSERT INTO favorites (user_id, product_id) VALUES (?, ?)',
            [userId, productId]
        );

        res.status(201).json({ message: 'Added to favorites' });
    } catch (error) {
        console.error('Error adding to favorites:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        await connection.end();
    }
};

exports.removeFavorite = async (req, res) => {
    const connection = await createConnection();
    try {
        const { productId } = req.params;
        const userId = req.user.userId;

        await connection.execute(
            'DELETE FROM favorites WHERE user_id = ? AND product_id = ?',
            [userId, productId]
        );

        res.json({ message: 'Removed from favorites' });
    } catch (error) {
        console.error('Error removing from favorites:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        await connection.end();
    }
};

exports.getSearchHistory = async (req, res) => {
    const connection = await createConnection();
    try {
        const userId = req.user.userId;

        const [searches] = await connection.execute(
            'SELECT * FROM search_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 10',
            [userId]
        );

        const searchHistory = searches.map(search => ({
            ...search,
            filters: JSON.parse(search.filters)
        }));

        res.json(searchHistory);
    } catch (error) {
        console.error('Error fetching search history:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        await connection.end();
    }
};

exports.addSearchHistory = async (req, res) => {
    const connection = await createConnection();
    try {
        const { searchQuery, filters } = req.body;
        const userId = req.user.userId;

        await connection.execute(
            'INSERT INTO search_history (user_id, search_query, filters) VALUES (?, ?, ?)',
            [userId, searchQuery, JSON.stringify(filters)]
        );

        res.status(201).json({ message: 'Search saved' });
    } catch (error) {
        console.error('Error saving search:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        await connection.end();
    }
};

exports.updateProfile = async (req, res) => {
    const connection = await createConnection();
    try {
        const { name, phone, address } = req.body;
        const userId = req.user.userId;

        await connection.execute(
            'UPDATE users SET name = ?, phone = ?, address = ? WHERE id = ?',
            [name, phone, address, userId]
        );

        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        await connection.end();
    }
};

exports.getProfile = async (req, res) => {
    const connection = await createConnection();
    try {
        const userId = req.user.userId;

        const [users] = await connection.execute(
            'SELECT id, email, name, phone, address, created_at FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(users[0]);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        await connection.end();
    }
};

exports.getNotificationPreferences = async (req, res) => {
    const connection = await createConnection();
    try {
        const userId = req.user.userId;

        const [prefs] = await connection.execute(
            'SELECT * FROM notification_preferences WHERE user_id = ?',
            [userId]
        );

        res.json(prefs[0] || { email_notifications: true, push_notifications: true });
    } catch (error) {
        console.error('Error fetching notification preferences:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        await connection.end();
    }
};

exports.updateNotificationPreferences = async (req, res) => {
    const connection = await createConnection();
    try {
        const { email_notifications, push_notifications } = req.body;
        const userId = req.user.userId;

        await connection.execute(
            `INSERT INTO notification_preferences (user_id, email_notifications, push_notifications) 
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE 
             email_notifications = VALUES(email_notifications),
             push_notifications = VALUES(push_notifications)`,
            [userId, email_notifications, push_notifications]
        );

        res.json({ message: 'Notification preferences updated' });
    } catch (error) {
        console.error('Error updating notification preferences:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        await connection.end();
    }
}; 