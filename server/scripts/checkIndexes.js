const mongoose = require('mongoose');
require('dotenv').config();

async function checkIndexes() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
        
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        
        console.log('Collections in database:');
        for (let collection of collections) {
            console.log(`\n=== ${collection.name} ===`);
            const indexes = await db.collection(collection.name).indexes();
            console.log('Indexes:');
            indexes.forEach(index => {
                console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
            });
            
            // Count documents
            const count = await db.collection(collection.name).countDocuments();
            console.log(`Documents: ${count}`);
            
            // Show a few sample documents
            const samples = await db.collection(collection.name).find().limit(2).toArray();
            console.log('Sample documents:');
            samples.forEach((doc, i) => {
                console.log(`  Sample ${i + 1}:`, JSON.stringify(doc, null, 2));
            });
        }
        
        // Check for any duplicate indexes
        const User = require('../models/userModel');
        const Prompt = require('../models/promptModel');
        const Comment = require('../models/commentModel');
        const Tag = require('../models/tagModel');
        
        
        console.log('\n=== Model Index Analysis ===');
        
        // Check User indexes
        console.log('\nUser model indexes:');
        const userIndexes = await User.collection.getIndexes();
        console.log(JSON.stringify(userIndexes, null, 2));
        
        // Check Prompt indexes
        console.log('\nPrompt model indexes:');
        const promptIndexes = await Prompt.collection.getIndexes();
        console.log(JSON.stringify(promptIndexes, null, 2));
        
        mongoose.connection.close();
        
    } catch (error) {
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
}

checkIndexes();
