const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { createConnection } = require('../database/dbConfig');

router.post('/favorites', auth, async (req, res) => {
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
});

router.delete('/favorites/:productId', auth, async (req, res) => {
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
});

router.get('/favorites', auth, async (req, res) => {
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
});

router.post('/search-history', auth, async (req, res) => {
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
});

router.get('/search-history', auth, async (req, res) => {
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
});

module.exports = router; 