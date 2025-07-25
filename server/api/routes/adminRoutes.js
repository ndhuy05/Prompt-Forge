const express = require('express');
const {
    getAllUsers,
    deleteUser,
    getAllPrompts,
    deletePrompt
} = require('../controllers/adminController');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// All routes require admin
router.use(authenticate);
router.use(requireAdmin);

// User routes
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);

// Prompt routes
router.get('/prompts', getAllPrompts);
router.delete('/prompts/:id', deletePrompt);

module.exports = router; 