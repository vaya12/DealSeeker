const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

const isMerchant = async (req, res, next) => {
    try {
        if (req.user.role !== 'merchant') {
            return res.status(403).json({ message: 'Merchant access required' });
        }
        next();
    } catch (error) {
        res.status(403).json({ message: 'Access denied' });
    }
};

const isAdmin = async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }
        next();
    } catch (error) {
        res.status(403).json({ message: 'Access denied' });
    }
};

module.exports = { auth, isMerchant, isAdmin }; 