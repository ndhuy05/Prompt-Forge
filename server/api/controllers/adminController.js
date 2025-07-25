const User = require('../models/userModel');
const Prompt = require('../models/promptModel');
const Comment = require('../models/commentModel');

// Get all users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete user
const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        
        // Don't allow deleting yourself
        if (userId === req.user.id) {
            return res.status(400).json({ success: false, message: 'Cannot delete yourself' });
        }
        
        // Delete user's prompts and comments first
        await Prompt.deleteMany({ author: userId });
        await Comment.deleteMany({ author: userId });
        
        // Delete the user
        await User.findByIdAndDelete(userId);
        
        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all prompts
const getAllPrompts = async (req, res) => {
    try {
        const prompts = await Prompt.find()
            .populate('author', 'username email')
            .sort({ createdAt: -1 });
        
        res.json({ success: true, data: prompts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete prompt
const deletePrompt = async (req, res) => {
    try {
        const promptId = req.params.id;
        
        // Delete comments for this prompt
        await Comment.deleteMany({ prompt: promptId });
        
        // Delete the prompt
        await Prompt.findByIdAndDelete(promptId);
        
        res.json({ success: true, message: 'Prompt deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getAllUsers,
    deleteUser,
    getAllPrompts,
    deletePrompt
}; 