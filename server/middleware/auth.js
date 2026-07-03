const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'Avtorizatsiya talab qilinadi' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({ message: 'Foydalanuvchi topilmadi' });
        }

        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Noto\'g\'ri token' });
    }
};

const adminAuth = (req, res, next) => {
    auth(req, res, () => {
        if (req.user && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin huquqi talab qilinadi' });
        }
        next();
    });
};

const optionalAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id);
            if (user) {
                req.user = user;
                req.token = token;
            }
        }
    } catch (error) {
        // ignore
    }
    next();
};

module.exports = { auth, adminAuth, optionalAuth };
