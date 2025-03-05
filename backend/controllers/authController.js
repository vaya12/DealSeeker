const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const ADMIN_CREDENTIALS = {
    username: process.env.ADMIN_USERNAME,
    passwordHash: process.env.ADMIN_PASSWORD_HASH
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        console.log('Received login attempt:', { username, password });
        console.log('Comparing with:', ADMIN_CREDENTIALS);

        if (username === ADMIN_CREDENTIALS.username && await bcrypt.compare(password, ADMIN_CREDENTIALS.passwordHash)) {
            const token = jwt.sign(
                { username: ADMIN_CREDENTIALS.username, role: 'admin' },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            console.log('Login successful, sending token');
            
            return res.json({
                success: true,
                token,
                user: {
                    username: ADMIN_CREDENTIALS.username,
                    role: 'admin'
                }
            });
        }

        console.log('Invalid credentials');
        return res.status(401).json({ 
            success: false,
            error: 'Invalid credentials'
        });

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ 
            success: false,
            error: 'Server error'
        });
    }
};

exports.verifyToken = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        
        return res.json({
            success: true,
            user: {
                username: decoded.username,
                role: decoded.role
            }
        });
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

exports.validateLogin = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        if (!ADMIN_CREDENTIALS.username || !ADMIN_CREDENTIALS.passwordHash) {
            console.error('Admin credentials not properly configured');
            return res.status(500).json({ message: 'Server configuration error' });
        }

        if (username === ADMIN_CREDENTIALS.username && 
            await bcrypt.compare(password, ADMIN_CREDENTIALS.passwordHash)) {
            
            const token = jwt.sign(
                { username: username },
                JWT_SECRET,
                { expiresIn: '1h' }
            );
            
            return res.status(200).json({
                success: true,
                token: token
            });
        }

        return res.status(401).json({ message: 'Invalid credentials' });

    } catch (error) {
        console.error('Login error:', error.message);
        return res.status(500).json({ message: 'Internal server error' });
    }
}; 
