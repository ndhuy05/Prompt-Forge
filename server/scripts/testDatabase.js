require('dotenv').config();
const connectDB = require('../config/database');

// Import models để register schemas
const User = require('../api/models/userModel');
const Prompt = require('../api/models/promptModel');
const Comment = require('../api/models/commentModel');
const Tag = require('../api/models/tagModel');


async function testDatabase() {
    try {
        // Connect to database
        await connectDB();
        
        console.log('🔄 Testing database queries...');
        
        // Test each model
        const userCount = await User.countDocuments();
        console.log(`👥 Users: ${userCount}`);
        
        const promptCount = await Prompt.countDocuments();
        console.log(`📝 Prompts: ${promptCount}`);
        
        const commentCount = await Comment.countDocuments();
        console.log(`💬 Comments: ${commentCount}`);
        
        const tagCount = await Tag.countDocuments();
        console.log(`🏷️  Tags: ${tagCount}`);
        

        
        // Test prompt fetching with population
        console.log('\n📝 Testing prompt retrieval...');
        const prompts = await Prompt.find()
            .populate('author', 'username')
            .populate('tags', 'name')
            .sort({ createdAt: -1 });
        
        console.log(`✅ Found ${prompts.length} prompts`);
        
        if (prompts.length > 0) {
            console.log('📋 Sample prompts:');
            prompts.slice(0, 3).forEach((prompt, index) => {
                console.log(`${index + 1}. "${prompt.title}" by ${prompt.author?.username || 'Unknown'}`);
                console.log(`   Category: ${prompt.category}, Tags: ${prompt.tags.map(t => t.name).join(', ')}`);
            });
        } else {
            console.log('❌ No prompts found - this might be the issue!');
        }
        
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.message.includes('index')) {
            console.error('🔍 Index-related error detected');
        }
        console.error('Full error:', error);
        process.exit(1);
    }
}

testDatabase();
