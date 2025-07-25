const Comment = require('../models/commentModel');
const Prompt = require('../models/promptModel');

// @desc    Get comments for a prompt
// @route   GET /api/comments/prompt/:promptId
// @access  Public
const getPromptComments = async (req, res) => {
    try {
        console.log('Fetching comments for prompt:', req.params.promptId);
        
        const comments = await Comment.getByPrompt(req.params.promptId);
        
        console.log('Found comments:', comments.length);
        console.log('Comments data:', comments.map(c => ({ id: c._id, content: c.content })));

        res.status(200).json({
            success: true,
            data: comments  // Return comments array directly, not wrapped in { comments }
        });

    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Create comment
// @route   POST /api/comments
// @access  Private
const createComment = async (req, res) => {
    try {
        const { prompt, content } = req.body;

        console.log('Creating comment:', { prompt, content, userId: req.user.id });

        // Verify prompt exists and is accessible
        const promptExists = await Prompt.findById(prompt);
        if (!promptExists) {
            return res.status(404).json({
                success: false,
                message: 'Prompt not found'
            });
        }

        // Additional validation
        if (!content || content.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Comment content is required'
            });
        }

        if (content.length > 1000) {
            return res.status(400).json({
                success: false,
                message: 'Comment content cannot exceed 1000 characters'
            });
        }

        // Create the comment
        const comment = await Comment.create({
            prompt,
            author: req.user.id,
            content: content.trim()
        });

        // Populate the comment with author details only
        const populatedComment = await Comment.findById(comment._id)
            .populate('author', 'username avatar fullName');

        console.log('Comment created successfully:', populatedComment._id);

        res.status(201).json({
            success: true,
            message: 'Comment posted successfully! 🎉',
            data: populatedComment
        });

    } catch (error) {
        console.error('Error creating comment:', error);

        // Handle validation errors
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validationErrors
            });
        }

        // Handle MongoDB errors
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid prompt ID format'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Internal server error while creating comment'
        });
    }
};

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private
const deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        // Check ownership
        if (comment.author.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this comment'
            });
        }

        await comment.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Comment deleted successfully'
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Like/Unlike comment
// @route   POST /api/comments/:id/like
// @access  Private
const toggleLike = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        const result = await comment.toggleLike(req.user.id);
        await comment.save();

        res.status(200).json({
            success: true,
            message: result.liked ? 'Comment liked' : 'Comment unliked',
            data: result
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getPromptComments,
    createComment,
    deleteComment,
    toggleLike
};
