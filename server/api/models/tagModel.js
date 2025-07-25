const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    description: {
        type: String,
        default: ''
    },
    color: {
        type: String,
        default: '#007bff'
    },
    usageCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Index for efficient lookups
tagSchema.index({ name: 1 });
tagSchema.index({ usageCount: -1 });

// Static methods
tagSchema.statics.getPopular = function(limit = 20) {
    return this.find()
        .sort({ usageCount: -1 })
        .limit(limit);
};

tagSchema.statics.search = function(query, limit = 10) {
    return this.find({
        $or: [
            { name: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } }
        ]
    })
        .sort({ usageCount: -1 })
        .limit(limit);
};

// Instance methods
tagSchema.methods.incrementUsage = async function() {
    this.usageCount += 1;
    return this.save();
};

const Tag = mongoose.model('Tag', tagSchema);

module.exports = Tag;
