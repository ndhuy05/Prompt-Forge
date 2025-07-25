const Tag = require('../models/tagModel');
const Prompt = require('../models/promptModel');

// @desc    Get all tags
// @route   GET /api/tags
// @access  Public
const getTags = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        let filter = {};
        
        // Search by name
        if (req.query.search) {
            filter.name = { $regex: req.query.search, $options: 'i' };
        }

        // Simple sorting
        let sort = { usageCount: -1 }; // Default to most popular
        if (req.query.sort === 'name') {
            sort = { name: 1 };
        }

        const tags = await Tag.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limit);

        const total = await Tag.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: {
                tags,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get single tag
// @route   GET /api/tags/:id
// @access  Public
const getTag = async (req, res) => {
    try {
        const tag = await Tag.findById(req.params.id);
        
        if (!tag) {
            return res.status(404).json({
                success: false,
                message: 'Tag not found'
            });
        }

        res.status(200).json({
            success: true,
            data: tag
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Create tag
// @route   POST /api/tags
// @access  Private
const createTag = async (req, res) => {
    try {
        const { name, description, color } = req.body;

        const tag = await Tag.create({
            name: name.toLowerCase(),
            description: description || '',
            color: color || '#007bff'
        });

        res.status(201).json({
            success: true,
            data: tag
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Tag already exists'
            });
        }
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update tag
// @route   PUT /api/tags/:id
// @access  Private/Admin
const updateTag = async (req, res) => {
    try {
        const { description, color } = req.body;

        const tag = await Tag.findById(req.params.id);

        if (!tag) {
            return res.status(404).json({
                success: false,
                message: 'Tag not found'
            });
        }

        // Update fields
        if (description !== undefined) tag.description = description;
        if (color !== undefined) tag.color = color;

        await tag.save();

        res.status(200).json({
            success: true,
            data: tag
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete tag
// @route   DELETE /api/tags/:id
// @access  Private/Admin
const deleteTag = async (req, res) => {
    try {
        const tag = await Tag.findById(req.params.id);

        if (!tag) {
            return res.status(404).json({
                success: false,
                message: 'Tag not found'
            });
        }

        await tag.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Tag deleted successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getTags,
    getTag,
    createTag,
    updateTag,
    deleteTag
};
