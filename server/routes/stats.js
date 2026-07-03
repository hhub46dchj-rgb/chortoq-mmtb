const express = require('express');
const Post = require('../models/Post');
const User = require('../models/User');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', adminAuth, async (req, res) => {
    try {
        const totalPosts = await Post.countDocuments();
        const totalUsers = await User.countDocuments();
        const totalViews = await Post.aggregate([
            { $group: { _id: null, total: { $sum: '$views' } } }
        ]);

        const postsByCategory = await Post.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        const recentPosts = await Post.find()
            .populate('author', 'username')
            .sort({ createdAt: -1 })
            .limit(5);

        const monthlyPosts = await Post.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': -1, '_id.month': -1 } },
            { $limit: 6 }
        ]);

        const topViewedPosts = await Post.find()
            .sort({ views: -1 })
            .limit(5)
            .select('title views category');

        res.json({
            totalPosts,
            totalUsers,
            totalViews: totalViews[0]?.total || 0,
            postsByCategory,
            recentPosts,
            monthlyPosts,
            topViewedPosts
        });
    } catch (error) {
        res.status(500).json({ message: 'Server xatosi', error: error.message });
    }
});

module.exports = router;
