const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createConnection } = require('../database/dbConfig');

router.post('/register', async (req, res) => {
    const connection = await createConnection();
    try {
        const { email, password } = req.body;

        const [existingUsers] = await connection.execute(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await connection.execute(
            'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
            [email, hashedPassword, 'user']
        );

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        await connection.end();
    }
});

router.post('/login', async (req, res) => {
    const connection = await createConnection();
    try {
        const { email, password } = req.body;

        const [users] = await connection.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = users[0];

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        await connection.end();
    }
});

module.exports = router; 