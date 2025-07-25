require('dotenv').config();
const connectDB = require('../config/database');
const Prompt = require('../api/models/promptModel');
const User = require('../api/models/userModel');
const Comment = require('../api/models/commentModel');
const Tag = require('../api/models/tagModel');


async function diagnoseDatabase() {
    try {
        await connectDB();
        
        console.log('🔍 Database Diagnosis Report');
        console.log('============================');
        
        // Check collections
        const userCount = await User.countDocuments();
        const promptCount = await Prompt.countDocuments();
        const commentCount = await Comment.countDocuments();
        const tagCount = await Tag.countDocuments();

        
        console.log(`👥 Users: ${userCount}`);
        console.log(`📝 Prompts: ${promptCount}`);
        console.log(`💬 Comments: ${commentCount}`);
        console.log(`🏷️  Tags: ${tagCount}`);

        
        // Check if prompts have proper structure
        if (promptCount > 0) {
            console.log('\n📝 Analyzing prompts...');
            
            const prompts = await Prompt.find()
                .populate('author', 'username')
                .populate('tags', 'name')
                .sort({ createdAt: -1 });
            
            console.log(`✅ Successfully retrieved ${prompts.length} prompts`);
            
            prompts.forEach((prompt, index) => {
                console.log(`${index + 1}. "${prompt.title}"`);
                console.log(`   Author: ${prompt.author?.username || 'Unknown'}`);
                console.log(`   Category: ${prompt.category}`);
                console.log(`   Tags: ${prompt.tags?.map(t => t.name).join(', ') || 'None'}`);
                console.log(`   Likes: ${prompt.likes?.length || 0}`);
                console.log(`   Created: ${prompt.createdAt}`);
                console.log('');
            });
            
            // Test specific queries that might fail
            console.log('🔍 Testing specific queries...');
            
            // Test pagination
            const paginatedPrompts = await Prompt.find()
                .populate('author', 'username')
                .populate('tags', 'name')
                .sort({ createdAt: -1 })
                .limit(5)
                .skip(0);
            
            console.log(`✅ Pagination test: ${paginatedPrompts.length} prompts`);
            
            // Test filtering
            const codingPrompts = await Prompt.find({ category: 'coding' })
                .populate('author', 'username')
                .populate('tags', 'name');
            
            console.log(`✅ Category filter test: ${codingPrompts.length} coding prompts`);
            
            // Test search
            const searchResults = await Prompt.find({
                $or: [
                    { title: { $regex: 'React', $options: 'i' } },
                    { content: { $regex: 'React', $options: 'i' } }
                ]
            }).populate('author', 'username');
            
            console.log(`✅ Search test: ${searchResults.length} prompts matching "React"`);
            
        } else {
            console.log('❌ No prompts found in database!');
        }
        
        // Check for any data integrity issues
        console.log('\n🔍 Checking data integrity...');
        
        const promptsWithMissingAuthor = await Prompt.find({ author: null });
        console.log(`⚠️  Prompts with missing author: ${promptsWithMissingAuthor.length}`);
        
        const orphanedComments = await Comment.find({ prompt: { $exists: false } });
        console.log(`⚠️  Orphaned comments: ${orphanedComments.length}`);
        

        
        console.log('\n✅ Database diagnosis complete!');
        
    } catch (error) {
        console.error('❌ Diagnosis failed:', error.message);
        console.error('Full error:', error);
    }
    
    process.exit(0);
}

diagnoseDatabase();
