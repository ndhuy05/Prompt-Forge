const rateLimit = require('express-rate-limit');

// General rate limiting
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Auth rate limiting (stricter)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 auth requests per windowMs
    message: {
        success: false,
        message: 'Too many authentication attempts, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Create prompt rate limiting
const createPromptLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // limit each IP to 10 prompt creation per hour
    message: {
        success: false,
        message: 'Too many prompts created, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Comment rate limiting
const commentLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // limit each IP to 20 comments per windowMs
    message: {
        success: false,
        message: 'Too many comments, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    generalLimiter,
    authLimiter,
    createPromptLimiter,
    commentLimiter
};
