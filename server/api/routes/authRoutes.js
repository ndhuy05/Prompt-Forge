const express = require('express');
const {
    register,
    login,
    getMe,
    updateProfile,
    changePassword,
    logout
} = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const {
    validateRegister,
    validateLogin,
    validateProfileUpdate,
    validatePasswordChange
} = require('../middleware/validation');

const router = express.Router();

// Public routes
router.post('/register', authLimiter, validateRegister, register);
router.post('/login', authLimiter, validateLogin, login);

// Private routes
router.use(authenticate); // All routes below require authentication

router.get('/me', getMe);
router.put('/profile', validateProfileUpdate, updateProfile);
router.put('/password', validatePasswordChange, changePassword);
router.post('/logout', logout);

module.exports = router;