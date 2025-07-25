const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters'],
        maxlength: [20, 'Username cannot exceed 20 characters'],
        match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false // Không trả về password khi query
    },
    fullName: {
        type: String,
        trim: true,
        maxlength: [50, 'Full name cannot exceed 50 characters']
    },
    avatar: {
        type: String,
        default: '/images/default-avatar.svg'
    },
    bio: {
        type: String,
        maxlength: [200, 'Bio cannot exceed 200 characters'],
        default: ''
    },
    // Simple role system
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    // Simple status
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });

// Virtual fields
userSchema.virtual('promptsCount', {
    ref: 'Prompt',
    localField: '_id',
    foreignField: 'author',
    count: true
});

userSchema.virtual('commentsCount', {
    ref: 'Comment',
    localField: '_id',
    foreignField: 'author',
    count: true
});

// Pre-save middleware
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Instance methods
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.toJSON = function() {
    const userObject = this.toObject();
    delete userObject.password;
    return userObject;
};

// Static methods
userSchema.statics.findByEmailOrUsername = function(identifier) {
    return this.findOne({
        $or: [
            { email: identifier.toLowerCase() },
            { username: identifier }
        ]
    });
};

const User = mongoose.model('User', userSchema);

module.exports = User;
