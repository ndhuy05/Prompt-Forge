const mongoose = require('mongoose');
const similarityService = require('../api/services/similarityService');
require('dotenv').config();

const rebuildFAISSIndex = async () => {
    try {
        console.log('🔧 Rebuilding FAISS Index...');
        
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('📡 Connected to MongoDB');

        // Initialize and build index
        await similarityService.initialize();
        await similarityService.buildIndex();

        console.log('✅ FAISS Index rebuilt successfully!');
        
        // Close connection
        await mongoose.connection.close();
        console.log('📡 Database connection closed');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error rebuilding FAISS index:', error);
        process.exit(1);
    }
};

rebuildFAISSIndex();
