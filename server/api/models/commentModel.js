const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    content: {
        type: String,
        required: [true, 'Comment content is required'],
        trim: true,
        minlength: [1, 'Comment must have at least 1 character'],
        maxlength: [1000, 'Comment cannot exceed 1000 characters']
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Comment author is required']
    },
    prompt: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Prompt',
        required: [true, 'Prompt reference is required']
    },
    // Simple like system
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
commentSchema.index({ prompt: 1, createdAt: -1 });
commentSchema.index({ author: 1, createdAt: -1 });

// Virtual fields
commentSchema.virtual('likesCount').get(function() {
    return this.likes ? this.likes.length : 0;
});

// Instance methods
commentSchema.methods.toggleLike = async function(userId) {
    // Ensure likes array exists
    if (!this.likes) {
        this.likes = [];
    }
    
    const userLiked = this.likes.includes(userId);
    
    if (userLiked) {
        this.likes = this.likes.filter(id => id.toString() !== userId.toString());
        return { liked: false, likesCount: this.likes.length };
    } else {
        this.likes.push(userId);
        return { liked: true, likesCount: this.likes.length };
    }
};

// Static methods
commentSchema.statics.getByPrompt = function(promptId) {
    return this.find({ prompt: promptId })
        .populate('author', 'username avatar fullName')
        .sort({ createdAt: -1 });
};

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
