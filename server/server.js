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

app.all('/api/*', (req, res) => {
    res.status(404).json({ message: 'API topilmadi' });
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        };

        cached.promise = mongoose.connect(process.env.MONGODB_URI, opts).then((mongoose) => {
            return mongoose;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}

async function handler(req, res) {
    try {
        await connectDB();
        
        return app(req, res);
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
