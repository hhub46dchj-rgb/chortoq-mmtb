const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true, 
        trim: true 
    },
    content: { 
        type: String, 
        required: true 
    },
    category: { 
        type: String, 
        required: true,
        enum: [
            'yangiliklar', 
            'rahbariyat', 
            'muassasalar', 
            'statistika', 
            'vakansiyalar', 
            'virtual-qabulxona', 
            'galereya'
        ] 
    },
    image: { 
        type: String, 
        default: '' 
    },
    author: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true 
    },
    views: { 
        type: Number, 
        default: 0 
    },
    isPublished: { 
        type: Boolean, 
        default: true 
    },
    tags: [{ 
        type: String 
    }]
}, { timestamps: true });

postSchema.index({ title: 'text', content: 'text' });
postSchema.index({ category: 1 });
postSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);
