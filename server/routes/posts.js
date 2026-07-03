const express = require('express');
const multer = require('multer');
const Post = require('../models/Post');
const { auth, adminAuth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(file.originalname.split('.').pop().toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error('Faqat rasm fayllar qabul qilinadi!'), false);
    }
};

const upload = multer({ 
    storage, 
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});

function toBase64(file) {
    return `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
}

router.get('/', optionalAuth, async (req, res) => {
    try {
        const { category, search, page = 1, limit = 20 } = req.query;
        
        let query = { isPublished: true };
        
        if (category) {
            query.category = category;
        }
        
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } }
            ];
        }

        const posts = await Post.find(query)
            .populate('author', 'username fullName')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Post.countDocuments(query);

        res.json({
            posts,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server xatosi', error: error.message });
    }
});

router.get('/:id', optionalAuth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('author', 'username fullName');
        
        if (!post) {
            return res.status(404).json({ message: 'Ma\'lumot topilmadi' });
        }

        post.views += 1;
        await post.save();

        res.json(post);
    } catch (error) {
        res.status(500).json({ message: 'Server xatosi', error: error.message });
    }
});

router.post('/', adminAuth, upload.single('image'), async (req, res) => {
    try {
        const { title, content, category, tags } = req.body;

        if (!title || !content || !category) {
            return res.status(400).json({ message: 'Sarlavha, matn va kategoriya shart!' });
        }

        const image = req.file ? toBase64(req.file) : '';

        const post = new Post({
            title,
            content,
            category,
            image,
            author: req.user._id,
            tags: tags ? JSON.parse(tags) : []
        });

        await post.save();
        await post.populate('author', 'username fullName');

        res.status(201).json({
            message: 'Ma\'lumot muvaffaqiyatli joylandi!',
            post
        });
    } catch (error) {
        res.status(500).json({ message: 'Server xatosi', error: error.message });
    }
});

router.put('/:id', adminAuth, upload.single('image'), async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        
        if (!post) {
            return res.status(404).json({ message: 'Ma\'lumot topilmadi' });
        }

        const { title, content, category, tags, isPublished } = req.body;

        if (title) post.title = title;
        if (content) post.content = content;
        if (category) post.category = category;
        if (tags) post.tags = JSON.parse(tags);
        if (isPublished !== undefined) post.isPublished = isPublished;

        if (req.file) {
            post.image = toBase64(req.file);
        }

        await post.save();
        await post.populate('author', 'username fullName');

        res.json({
            message: 'Ma\'lumot yangilandi!',
            post
        });
    } catch (error) {
        res.status(500).json({ message: 'Server xatosi', error: error.message });
    }
});

router.delete('/:id', adminAuth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        
        if (!post) {
            return res.status(404).json({ message: 'Ma\'lumot topilmadi' });
        }

        await Post.findByIdAndDelete(req.params.id);

        res.json({ message: 'Ma\'lumot o\'chirib yuborildi!' });
    } catch (error) {
        res.status(500).json({ message: 'Server xatosi', error: error.message });
    }
});

module.exports = router;
