const mongoose = require('mongoose');
require('dotenv').config();

async function checkDatabase() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        
        const db = mongoose.connection.db;
        
        // Get all collections
        const collections = await db.listCollections().toArray();
        console.log('\n📊 Database Collections:');
        
        for (const collection of collections) {
            const count = await db.collection(collection.name).countDocuments();
            console.log(`   - ${collection.name}: ${count} documents`);
        }
        
        // Sample data from each collection
        console.log('\n🔍 Sample Data:');
        
        if (collections.some(c => c.name === 'users')) {
            const sampleUser = await db.collection('users').findOne();
            console.log('   User sample:', sampleUser ? sampleUser.username : 'No users found');
        }
        
        if (collections.some(c => c.name === 'prompts')) {
            const samplePrompt = await db.collection('prompts').findOne();
            console.log('   Prompt sample:', samplePrompt ? samplePrompt.title : 'No prompts found');
        }
        
        if (collections.some(c => c.name === 'tags')) {
            const sampleTag = await db.collection('tags').findOne();
            console.log('   Tag sample:', sampleTag ? sampleTag.name : 'No tags found');
        }
        
        if (collections.some(c => c.name === 'comments')) {
            const commentCount = await db.collection('comments').countDocuments();
            console.log('   Comments:', commentCount);
        }
        

        
    } catch (error) {
        console.error('❌ Database check failed:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
    }
}

checkDatabase();
