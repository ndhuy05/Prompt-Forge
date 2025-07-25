const User = require('../models/userModel');
const Prompt = require('../models/promptModel');
const Comment = require('../models/commentModel');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Public
const getDashboardStats = async (req, res) => {
    try {
        // Get basic counts
        const totalUsers = await User.countDocuments();
        const totalPrompts = await Prompt.countDocuments();
        const totalComments = await Comment.countDocuments();

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                totalPrompts,
                totalComments
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get recent prompts
// @route   GET /api/dashboard/recent-prompts
// @access  Public
const getRecentPrompts = async (req, res) => {
    try {
        const prompts = await Prompt.find()
            .populate('author', 'username avatar')
            .sort({ createdAt: -1 })
            .limit(10);

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

// @desc    Get popular prompts
// @route   GET /api/dashboard/popular-prompts
// @access  Public
const getPopularPrompts = async (req, res) => {
    try {
        const prompts = await Prompt.find()
            .populate('author', 'username avatar')
            .sort({ likesCount: -1 })
            .limit(10);

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

module.exports = {
    getDashboardStats
};
