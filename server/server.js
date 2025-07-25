const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

// Import database connection
const connectDB = require('./config/database');
const similarityService = require('./api/services/similarityService');
const summaryService = require('./api/services/summaryService');

// Import middleware
const errorHandler = require('./api/middleware/errorHandler');
const { generalLimiter } = require('./api/middleware/rateLimiter');

// Import routes
const authRoutes = require('./api/routes/authRoutes');
const promptRoutes = require('./api/routes/promptRoutes');
const commentRoutes = require('./api/routes/commentRoutes');

const tagRoutes = require('./api/routes/tagRoutes');
const dashboardRoutes = require('./api/routes/dashboardRoutes');
const adminRoutes = require('./api/routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to database
connectDB().then(() => {
    console.log('🗄️ Database connected successfully');
    
    // Initialize similarity service
    console.log('🤖 Initializing AI Similarity Service...');
    similarityService.initialize().then(() => {
        console.log('✅ AI Similarity Service initialized');
        // Build index after 10 seconds to ensure all data is loaded
        setTimeout(() => {
            console.log('🔍 Building AI search index...');
            similarityService.buildIndex().then(() => {
                console.log('✅ AI search index built successfully');
            }).catch(err => {
                console.log('⚠️ AI search index build failed, using fallback similarity');
            });
        }, 10000);
    }).catch(err => {
        console.log('⚠️ AI Similarity service initialization failed, using text-based similarity fallback');
        console.log('Details:', err.message);
    });

    // Initialize summary service
    console.log('📝 Initializing AI Summary Service...');
    summaryService.initialize().then(() => {
        console.log('✅ AI Summary Service initialized');
    }).catch(err => {
        console.log('⚠️ AI Summary service initialization failed, using fallback summary generation');
        console.log('Details:', err.message);
    });
}).catch(err => {
    console.error('❌ Database connection failed:', err);
});

// Trust proxy (for deployment)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
// Apply general rate limiting
app.use('/api/', generalLimiter);

// CORS configuration
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// Serve static files
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'CodeForge Server is healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV
    });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/prompts', promptRoutes);
app.use('/api/comments', commentRoutes);

app.use('/api/tags', tagRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to CodeForge API',
        version: '1.0.0',
        documentation: `${process.env.SERVER_URL}/api/docs`,
        endpoints: {
            auth: '/api/auth',
            prompts: '/api/prompts',
            comments: '/api/comments',
    
            tags: '/api/tags',
            dashboard: '/api/dashboard',
            health: '/health'
        }
    });
});

// 404 handler
app.all('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
});

// Global error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
    console.log('🚀 CodeForge Server Starting...');
    console.log(`📡 Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔗 Server URL: ${process.env.SERVER_URL || `http://localhost:${PORT}`}`);
    console.log(`🔗 Client URL: ${process.env.CLIENT_URL}`);
    console.log('📝 API Documentation: /api/docs');
    console.log('💚 Health Check: /health');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log('❌ Unhandled Promise Rejection:', err.message);
    // Close server & exit process
    server.close(() => {
        process.exit(1);
    });
});

module.exports = app;
