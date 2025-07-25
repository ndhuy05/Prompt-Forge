const express = require('express');
const {
    getPromptComments,
    createComment,
    deleteComment,
    toggleLike
} = require('../controllers/commentController');
const { authenticate } = require('../middleware/auth');
const { validateComment } = require('../../middleware/validateComment');

const router = express.Router();

// Public routes
router.get('/prompt/:promptId', getPromptComments);

// Private routes
router.use(authenticate); // All routes below require authentication

router.post('/', validateComment, createComment);
router.delete('/:id', deleteComment);
router.post('/:id/like', toggleLike);

module.exports = router;
