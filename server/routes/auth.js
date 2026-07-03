const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

router.post('/register', async (req, res) => {
    try {
        const { username, password, fullName, email } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Login va parol shart!' });
        }

        if (username.toLowerCase() === 'admin') {
            return res.status(400).json({ message: 'Bu foydalanuvchi nomi band!' });
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Bu foydalanuvchi nomi band!' });
        }

        const user = new User({ 
            username, 
            password, 
            fullName: fullName || '',
            email: email || ''
        });
        await user.save();

        const token = generateToken(user._id);

        res.status(201).json({
            message: 'Muvaffaqiyatli ro\'yxatdan o\'tdingiz!',
            token,
            user: {
                id: user._id,
                username: user.username,
                role: user.role,
                fullName: user.fullName
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server xatosi', error: error.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Login va parolni kiriting!' });
        }

        if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
            let adminUser = await User.findOne({ username: process.env.ADMIN_USERNAME });
            
            if (!adminUser) {
                adminUser = new User({
                    username: process.env.ADMIN_USERNAME,
                    password: process.env.ADMIN_PASSWORD,
                    role: 'admin',
                    fullName: ' Administrator'
                });
                await adminUser.save();
            }

            const token = generateToken(adminUser._id);
            return res.json({
                message: 'Admin paneliga xush kelibsiz!',
                token,
                user: {
                    id: adminUser._id,
                    username: adminUser.username,
                    role: adminUser.role,
                    fullName: adminUser.fullName
                }
            });
        }

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'Login yoki parol noto\'g\'ri!' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Login yoki parol noto\'g\'ri!' });
        }

        const token = generateToken(user._id);

        res.json({
            message: 'Tizimga kirdingiz!',
            token,
            user: {
                id: user._id,
                username: user.username,
                role: user.role,
                fullName: user.fullName
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server xatosi', error: error.message });
    }
});

router.get('/me', auth, async (req, res) => {
    try {
        res.json({
            user: {
                id: req.user._id,
                username: req.user.username,
                role: req.user.role,
                fullName: req.user.fullName,
                email: req.user.email
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server xatosi' });
    }
});

router.put('/profile', auth, async (req, res) => {
    try {
        const { fullName, email } = req.body;
        
        req.user.fullName = fullName || req.user.fullName;
        req.user.email = email || req.user.email;
        await req.user.save();

        res.json({
            message: 'Profil yangilandi!',
            user: {
                id: req.user._id,
                username: req.user.username,
                role: req.user.role,
                fullName: req.user.fullName,
                email: req.user.email
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server xatosi' });
    }
});

module.exports = router;
