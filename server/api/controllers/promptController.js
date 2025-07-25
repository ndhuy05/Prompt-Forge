const Prompt = require('../models/promptModel');
const Comment = require('../models/commentModel');
const similarityService = require('../services/similarityService');
const summaryService = require('../services/summaryService');

// @desc    Get all prompts
// @route   GET /api/prompts
// @access  Public
const getPrompts = async (req, res) => {
    try {
        let filter = {};

        // Basic filtering
        if (req.query.category) {
            filter.category = req.query.category;
        }

        if (req.query.search) {
            filter.$or = [
                { title: { $regex: req.query.search, $options: 'i' } },
                { content: { $regex: req.query.search, $options: 'i' } }
            ];
        }

        // Use aggregation pipeline for proper sorting by likes count
        let pipeline = [
            { $match: filter },
            {
                $addFields: {
                    likesCount: { $size: { $ifNull: ["$likes", []] } }
                }
            }
        ];

        // Add sorting stage
        let sortStage = { createdAt: -1 }; // Default to newest first
        
        switch (req.query.sort) {
            case 'newest':
                sortStage = { createdAt: -1 };
                break;
            case 'likes':
                sortStage = { likesCount: -1, createdAt: -1 };
                break;
            default:
                sortStage = { createdAt: -1 };
        }
        
        pipeline.push({ $sort: sortStage });
        pipeline.push({ $limit: 20 });
        
        // Populate author after aggregation
        pipeline.push({
            $lookup: {
                from: 'users',
                localField: 'author',
                foreignField: '_id',
                as: 'author',
                pipeline: [{ $project: { username: 1, avatar: 1 } }]
            }
        });
        
        // Convert author array to object (since $lookup returns array)
        pipeline.push({
            $addFields: {
                author: { $arrayElemAt: ['$author', 0] }
            }
        });

        const prompts = await Prompt.aggregate(pipeline);
        
        // Add isLiked status for authenticated user
        if (req.user) {
            prompts.forEach(prompt => {
                prompt.isLiked = prompt.likes && prompt.likes.includes(req.user.id);
            });
        }

        res.status(200).json({
            success: true,
            data: prompts
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get single prompt
// @route   GET /api/prompts/:id
// @access  Public
const getPrompt = async (req, res) => {
    try {
        const prompt = await Prompt.findById(req.params.id)
            .populate('author', 'username avatar');

        if (!prompt) {
            return res.status(404).json({
                success: false,
                message: 'Prompt not found'
            });
        }

        // Get comments count for this prompt
        const commentsCount = await Comment.countDocuments({ prompt: prompt._id });
        
        // Convert to object so we can add properties
        const promptData = prompt.toObject();
        promptData.commentsCount = commentsCount;
        
        // Add canEdit flag if user is authenticated and is the author
        if (req.user && req.user.id === prompt.author._id.toString()) {
            promptData.canEdit = true;
        } else {
            promptData.canEdit = false;
        }
        
        // Add isLiked status for authenticated user
        if (req.user) {
            promptData.isLiked = prompt.likes && prompt.likes.includes(req.user.id);
        } else {
            promptData.isLiked = false;
        }

        res.status(200).json({
            success: true,
            data: promptData
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Create prompt
// @route   POST /api/prompts
// @access  Private
const createPrompt = async (req, res) => {
    try {
        const { title, content, category, description, tags } = req.body;
        
        console.log('Creating prompt with data:', { title, content, category, description, tags });

        const prompt = await Prompt.create({
            title,
            content,
            category,
            description: description || '',
            tags: tags || [],
            author: req.user.id
        });

        const populatedPrompt = await Prompt.findById(prompt._id)
            .populate('author', 'username avatar');

        res.status(201).json({
            success: true,
            data: populatedPrompt
        });
    } catch (error) {
        console.error('Create prompt error:', error);
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            console.log('Validation errors:', validationErrors);
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validationErrors
            });
        }
        
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update prompt
// @route   PUT /api/prompts/:id
// @access  Private
const updatePrompt = async (req, res) => {
    try {
        const prompt = await Prompt.findById(req.params.id);

        if (!prompt) {
            return res.status(404).json({
                success: false,
                message: 'Prompt not found'
            });
        }

        // Check if user is the author
        if (prompt.author.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this prompt'
            });
        }

        const { title, content, category, description, tags } = req.body;

        // Update fields
        if (title !== undefined) prompt.title = title;
        if (content !== undefined) prompt.content = content;
        if (category !== undefined) prompt.category = category;
        if (description !== undefined) prompt.description = description;
        if (tags !== undefined) prompt.tags = tags;

        await prompt.save();

        const updatedPrompt = await Prompt.findById(prompt._id)
            .populate('author', 'username avatar');

        res.status(200).json({
            success: true,
            data: updatedPrompt
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete prompt
// @route   DELETE /api/prompts/:id
// @access  Private
const deletePrompt = async (req, res) => {
    try {
        const prompt = await Prompt.findById(req.params.id);

        if (!prompt) {
            return res.status(404).json({
                success: false,
                message: 'Prompt not found'
            });
        }

        // Check if user is the author
        if (prompt.author.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this prompt'
            });
        }

        await prompt.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Prompt deleted successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get my prompts
// @route   GET /api/prompts/my-prompts
// @access  Private
const getMyPrompts = async (req, res) => {
    try {
        let filter = { author: req.user.id };

        // Category filtering
        if (req.query.category) {
            filter.category = req.query.category;
        }

        // Search filtering
        if (req.query.search) {
            filter.$or = [
                { title: { $regex: req.query.search, $options: 'i' } },
                { content: { $regex: req.query.search, $options: 'i' } },
                { description: { $regex: req.query.search, $options: 'i' } }
            ];
        }

        // Sorting
        let sort = { createdAt: -1 }; // Default to newest first
        switch (req.query.sort) {
            case 'oldest':
                sort = { createdAt: 1 };
                break;
            case 'likes':
                sort = { likesCount: -1 };
                break;
            case 'title':
                sort = { title: 1 };
                break;
            default:
                sort = { createdAt: -1 };
        }

        // Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const prompts = await Prompt.find(filter)
            .populate('author', 'username avatar')
            .populate('tags', 'name')
            .sort(sort)
            .skip(skip)
            .limit(limit);

        // Get total count for pagination
        const totalPrompts = await Prompt.countDocuments(filter);

        // Add comments count for each prompt
        const promptsWithStats = await Promise.all(
            prompts.map(async (prompt) => {
                const Comment = require('../models/commentModel');
                const commentsCount = await Comment.countDocuments({ prompt: prompt._id });
                
                return {
                    ...prompt.toObject(),
                    commentsCount,
                    likesCount: prompt.likes ? prompt.likes.length : 0,
                    isLiked: prompt.likes ? prompt.likes.includes(req.user.id) : false
                };
            })
        );

        res.status(200).json({
            success: true,
            data: promptsWithStats,
            pagination: {
                page,
                limit,
                total: totalPrompts,
                pages: Math.ceil(totalPrompts / limit)
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Like/Unlike prompt
// @route   POST /api/prompts/:id/like
// @access  Private
const toggleLike = async (req, res) => {
    try {
        const prompt = await Prompt.findById(req.params.id);

        if (!prompt) {
            return res.status(404).json({
                success: false,
                message: 'Prompt not found'
            });
        }

        const result = await prompt.toggleLike(req.user.id);

        res.status(200).json({
            success: true,
            data: {
                liked: result.liked,
                likesCount: result.likesCount
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get similar prompts
// @route   GET /api/prompts/:id/similar
// @access  Public
const getSimilarPrompts = async (req, res) => {
    try {
        const targetPrompt = await Prompt.findById(req.params.id);

        if (!targetPrompt) {
            return res.status(404).json({
                success: false,
                message: 'Prompt not found'
            });
        }

        const limit = parseInt(req.query.limit) || 5;
        let similarPrompts = await similarityService.findSimilarPrompts(targetPrompt, limit);

        // Populate author for each similar prompt
        similarPrompts = await Promise.all(
            similarPrompts.map(async (prompt) => {
                if (prompt.author && typeof prompt.author === 'object' && prompt.author.username) {
                    return prompt;
                }
                // Populate author if not already populated
                const populated = await (await require('../models/promptModel').findById(prompt._id).populate('author', 'username avatar')).toObject();
                // Preserve similarity and other calculated fields
                populated.similarity = prompt.similarity;
                populated.commentsCount = prompt.commentsCount;
                populated.likesCount = prompt.likesCount;
                return populated;
            })
        );

        res.status(200).json({
            success: true,
            data: similarPrompts
        });
    } catch (error) {
        console.error('Error getting similar prompts:', error);
        res.status(500).json({
            success: false,
            message: 'Error finding similar prompts',
            error: error.message
        });
    }
};

// @desc    Generate description for prompt content
// @route   POST /api/prompts/generate-description
// @access  Private
const generateDescription = async (req, res) => {
    try {
        const { content } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Prompt content is required'
            });
        }

        console.log('Generating description for content:', content.substring(0, 100) + '...');

        const result = await summaryService.generateDescription(content.trim());

        if (result.success) {
            res.status(200).json({
                success: true,
                data: {
                    description: result.description,
                    fallback: result.fallback || false
                }
            });
        } else {
            res.status(500).json({
                success: false,
                message: result.error || 'Failed to generate description'
            });
        }
    } catch (error) {
        console.error('Error generating description:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating description',
            error: error.message
        });
    }
};

module.exports = {
    getPrompts,
    getPrompt,
    getMyPrompts,
    createPrompt,
    updatePrompt,
    deletePrompt,
    toggleLike,
    getSimilarPrompts,
    generateDescription
};
