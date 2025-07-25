const mongoose = require('mongoose');
const similarityService = require('../api/services/similarityService');
const Prompt = require('../api/models/promptModel');
require('dotenv').config();

const testSimilarityService = async () => {
    try {
        console.log('🧪 Testing Similarity Service...');
        
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('📡 Connected to MongoDB');

        // Get a sample prompt
        const samplePrompt = await Prompt.findOne({ isPublic: true });
        
        if (!samplePrompt) {
            console.log('❌ No public prompts found for testing');
            process.exit(1);
        }

        console.log(`🎯 Testing with prompt: "${samplePrompt.title}"`);

        // Test similarity service
        console.log('🔍 Finding similar prompts...');
        const similarPrompts = await similarityService.findSimilarPrompts(samplePrompt, 3);

        console.log(`✅ Found ${similarPrompts.length} similar prompts:`);
        similarPrompts.forEach((prompt, index) => {
            console.log(`${index + 1}. ${prompt.title} (similarity: ${prompt.similarity?.toFixed(3) || 'N/A'})`);
        });

        // Close connection
        await mongoose.connection.close();
        console.log('📡 Database connection closed');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error testing similarity service:', error);
        process.exit(1);
    }
};

testSimilarityService();
