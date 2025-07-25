const express = require('express');
const {
    getTags,
    getTag,
    createTag,
    updateTag,
    deleteTag
} = require('../controllers/tagController');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { validateTag } = require('../middleware/validation');

const router = express.Router();

// Public routes
router.get('/', getTags);
router.get('/:id', getTag);

// Private routes
router.use(authenticate); // All routes below require authentication

router.post('/', validateTag, createTag);

// Admin routes
router.put('/:id', requireAdmin, updateTag);

// Admin only routes
router.delete('/:id', requireAdmin, deleteTag);

module.exports = router;
