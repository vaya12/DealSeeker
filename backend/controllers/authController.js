const jwt = require('jsonwebtoken');

const ADMIN_USER = {
    username: 'admin',
    password: 'admin123'
};

const JWT_SECRET = 'super-secret-key-123';

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        console.log('Received login attempt:', { username, password });
        console.log('Comparing with:', ADMIN_USER);

        if (username === ADMIN_USER.username && password === ADMIN_USER.password) {
            const token = jwt.sign(
                { username: ADMIN_USER.username, role: 'admin' },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            console.log('Login successful, sending token');
            
            return res.json({
                success: true,
                token,
                user: {
                    username: ADMIN_USER.username,
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