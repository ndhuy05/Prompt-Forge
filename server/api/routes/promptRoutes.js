const express = require('express');
const {
    getPrompts,
    getPrompt,
    createPrompt,
    updatePrompt,
    deletePrompt,
    toggleLike,
    getMyPrompts,
    getSimilarPrompts,
    generateDescription
} = require('../controllers/promptController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { createPromptLimiter } = require('../middleware/rateLimiter');
const { validatePrompt } = require('../middleware/validation');

const router = express.Router();

// Public routes
router.get('/', optionalAuth, getPrompts);

// Private routes need to be defined before parameterized routes
router.get('/my-prompts', authenticate, getMyPrompts);

// Public parameterized routes (must come after specific routes)
router.get('/:id', optionalAuth, getPrompt);
router.get('/:id/similar', getSimilarPrompts);

// Other private routes
router.use(authenticate); // All routes below require authentication
router.post('/', createPromptLimiter, validatePrompt, createPrompt);
router.post('/generate-description', generateDescription);
router.put('/:id', validatePrompt, updatePrompt);
router.delete('/:id', deletePrompt);
router.post('/:id/like', toggleLike);

module.exports = router;
