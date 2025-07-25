const { body, validationResult } = require('express-validator');

// Validation rules for comment creation
const validateComment = [
    body('prompt')
        .notEmpty()
        .withMessage('Prompt ID is required')
        .isMongoId()
        .withMessage('Invalid prompt ID format'),
    
    body('content')
        .notEmpty()
        .withMessage('Comment content is required')
        .trim()
        .isLength({ min: 1, max: 1000 })
        .withMessage('Comment content must be between 1 and 1000 characters')
        .custom((value) => {
            // Check for only whitespace
            if (!value.trim()) {
                throw new Error('Comment cannot be empty or contain only whitespace');
            }
            return true;
        }),

    // Handle validation errors
    (req, res, next) => {
        const errors = validationResult(req);
        
        if (!errors.isEmpty()) {
            console.log('Validation errors:', errors.array());
            
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array().map(error => error.msg)
            });
        }
        
        next();
    }
];

// Validation rules for comment updates (if needed)
const validateCommentUpdate = [
    body('content')
        .optional()
        .trim()
        .isLength({ min: 1, max: 1000 })
        .withMessage('Comment content must be between 1 and 1000 characters')
        .custom((value) => {
            if (value && !value.trim()) {
                throw new Error('Comment cannot be empty or contain only whitespace');
            }
            return true;
        }),

    // Handle validation errors
    (req, res, next) => {
        const errors = validationResult(req);
        
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array().map(error => error.msg)
            });
        }
        
        next();
    }
];

module.exports = {
    validateComment,
    validateCommentUpdate
};
