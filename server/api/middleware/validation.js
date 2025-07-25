const { body, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => error.msg);
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errorMessages
        });
    }
    next();
};

// User registration validation
const validateRegister = [
    body('username')
        .isLength({ min: 3, max: 20 })
        .withMessage('Username must be between 3 and 20 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers and underscores'),
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    body('fullName')
        .optional()
        .isLength({ max: 50 })
        .withMessage('Full name cannot exceed 50 characters'),
    handleValidationErrors
];

// User login validation
const validateLogin = [
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
    handleValidationErrors
];

// Prompt creation validation
const validatePrompt = [
    body('title')
        .isLength({ min: 5, max: 200 })
        .withMessage('Title must be between 5 and 200 characters'),
    body('description')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Description cannot exceed 500 characters'),
    body('content')
        .isLength({ min: 10, max: 5000 })
        .withMessage('Content must be between 10 and 5000 characters'),
    body('category')
        .isIn(['coding', 'writing', 'analysis', 'creative', 'learning', 'other'])
        .withMessage('Invalid category'),
    body('tags')
        .optional()
        .isArray()
        .withMessage('Tags must be an array'),
    handleValidationErrors
];

// Comment creation validation
const validateComment = [
    body('content')
        .isLength({ min: 1, max: 1000 })
        .withMessage('Comment must be between 1 and 1000 characters'),
    body('prompt')
        .isMongoId()
        .withMessage('Invalid prompt ID'),
    handleValidationErrors
];

// Tag creation validation
const validateTag = [
    body('name')
        .isLength({ min: 1, max: 30 })
        .withMessage('Tag name must be between 1 and 30 characters'),
    body('description')
        .optional()
        .isLength({ max: 200 })
        .withMessage('Description cannot exceed 200 characters'),
    handleValidationErrors
];



// Profile update validation
const validateProfileUpdate = [
    body('fullName')
        .optional()
        .isLength({ max: 50 })
        .withMessage('Full name cannot exceed 50 characters'),
    body('bio')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Bio cannot exceed 500 characters'),
    handleValidationErrors
];

// Password change validation
const validatePasswordChange = [
    body('currentPassword')
        .notEmpty()
        .withMessage('Current password is required'),
    body('newPassword')
        .isLength({ min: 6 })
        .withMessage('New password must be at least 6 characters long'),
    handleValidationErrors
];

module.exports = {
    validateRegister,
    validateLogin,
    validatePrompt,
    validateComment,
    validateTag,
    validateProfileUpdate,
    validatePasswordChange,
    handleValidationErrors
};
