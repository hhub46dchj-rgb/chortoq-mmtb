const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const statsRoutes = require('./routes/stats');

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/stats', statsRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

let cached = null;

async function connectDB() {
    if (cached) return cached;
    
    if (!process.env.MONGODB_URI) {
        throw new Error('MONGODB_URI topilmadi');
    }

    cached = await mongoose.connect(process.env.MONGODB_URI);
    return cached;
}

async function handler(req, res) {
    try {
        await connectDB();
        
        if (req.url.startsWith('/api/')) {
            return app(req, res);
        }
        
        const indexPath = path.join(__dirname, '../public/index.html');
        return res.sendFile(indexPath);
    } catch (error) {
        console.error('Xatolik:', error.message);
        return res.status(500).json({ message: 'Server xatosi', error: error.message });
    }
}

if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    
    connectDB().then(() => {
        console.log('MongoDB ulandi!');
        app.listen(PORT, () => {
            console.log(`Server ${PORT}-portda ishga tushdi!`);
            console.log(`http://localhost:${PORT}`);
        });
    }).catch(err => {
        console.error('MongoDB xatosi:', err.message);
        process.exit(1);
    });
}

module.exports = handler;
