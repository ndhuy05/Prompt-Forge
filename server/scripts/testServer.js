const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());

// Test database connection
console.log('🔄 Connecting to MongoDB...');
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('✅ Connected to MongoDB');
    
    // Test prompt fetching
    const Prompt = require('../api/models/promptModel');
    
    return Prompt.find().populate('author', 'username').populate('tags');
})
.then(prompts => {
    console.log(`📝 Found ${prompts.length} prompts in database`);
    prompts.forEach(prompt => {
        console.log(`- ${prompt.title} by ${prompt.author?.username || 'Unknown'}`);
    });
    
    // Start server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
})
.catch(error => {
    console.error('❌ Database connection error:', error.message);
    if (error.message.includes('index')) {
        console.error('🔍 Index-related error detected');
        console.error('Full error:', error);
    }
    process.exit(1);
});
