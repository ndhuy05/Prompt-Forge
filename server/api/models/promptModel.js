const mongoose = require('mongoose');

const promptSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Prompt title is required'],
        trim: true,
        minlength: [5, 'Title must be at least 5 characters'],
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    content: {
        type: String,
        required: [true, 'Prompt content is required'],
        minlength: [10, 'Content must be at least 10 characters'],
        maxlength: [5000, 'Content cannot exceed 5000 characters']
    },
    description: {
        type: String,
        maxlength: [500, 'Description cannot exceed 500 characters'],
        default: ''
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Author is required']
    },
    // Simple categorization
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: [
            'coding',
            'writing',
            'analysis',
            'creative',
            'learning',
            'other'
        ],
        default: 'other'
    },
    // Simple tags
    tags: [{
        type: String,
        trim: true,
        maxlength: [30, 'Tag cannot exceed 30 characters']
    }],
    // Simple engagement
    likes: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        default: []
    },

    // Status
    status: {
        type: String,
        enum: ['draft', 'published'],
        default: 'published'
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
promptSchema.index({ title: 'text', content: 'text' });
promptSchema.index({ category: 1 });
promptSchema.index({ tags: 1 });
promptSchema.index({ author: 1 });
promptSchema.index({ createdAt: -1 });

// Virtual fields
promptSchema.virtual('likesCount').get(function() {
    try {
        return (this.likes && Array.isArray(this.likes)) ? this.likes.length : 0;
    } catch (error) {
        console.error('Error in likesCount virtual:', error);
        return 0;
    }
});



// Comments count - populated by controllers when needed
promptSchema.virtual('commentsCount').get(function() {
    return this._commentsCount || 0;
});

promptSchema.virtual('commentsCount').set(function(count) {
    this._commentsCount = count;
});

// Instance methods
promptSchema.methods.toggleLike = async function(userId) {
    // Ensure likes array exists
    if (!this.likes) {
        this.likes = [];
    }
    
    const userLiked = this.likes.includes(userId);
    
    if (userLiked) {
        this.likes = this.likes.filter(id => id.toString() !== userId.toString());
    } else {
        this.likes.push(userId);
    }
    
    // Save changes to database
    await this.save();
    
    return { 
        liked: !userLiked, 
        likesCount: this.likes.length 
    };
};



// Static methods
promptSchema.statics.getPublished = function(options = {}) {
    const { category, tags, search, limit = 20, page = 1 } = options;
    const skip = (page - 1) * limit;
    
    let query = { status: 'published' };
    
    if (category) {
        query.category = category;
    }
    
    if (tags && tags.length > 0) {
        query.tags = { $in: tags };
    }
    
    if (search) {
        query.$text = { $search: search };
    }
    
    return this.find(query)
        .populate('author', 'username avatar fullName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
};

promptSchema.statics.getByAuthor = function(authorId) {
    return this.find({ author: authorId, status: 'published' })
        .populate('author', 'username avatar fullName')
        .sort({ createdAt: -1 });
};

promptSchema.statics.getPopular = function(limit = 10) {
    return this.find({ status: 'published' })
        .populate('author', 'username avatar fullName')
        .sort({ likesCount: -1, createdAt: -1 })
        .limit(limit);
};

const Prompt = mongoose.model('Prompt', promptSchema);

module.exports = Prompt;