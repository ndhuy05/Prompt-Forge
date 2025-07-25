const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Middleware để verify JWT token
const authenticate = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided, authorization denied'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Token is not valid'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Token is not valid'
        });
    }
};

// Middleware để check admin role
const requireAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: 'Admin access required'
        });
    }
};

// Optional authentication - không bắt buộc phải đăng nhập
const optionalAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select('-password');
            if (user) {
                req.user = user;
            }
        }
        
        next();
    } catch (error) {
        // Ignore token errors for optional auth
        next();
    }
};

module.exports = {
    authenticate,
    requireAdmin,
    optionalAuth
};
