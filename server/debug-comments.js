// Debug script to test comment fetching
const mongoose = require('mongoose');
require('dotenv').config();

// Connect to database
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/promptforce')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const Comment = require('./api/models/commentModel');

async function debugComments() {
  try {
    // Check total comments count
    const totalComments = await Comment.countDocuments();
    console.log('Total comments in database:', totalComments);

    // Get all comments
    const allComments = await Comment.find().limit(5);
    console.log('Sample comments:', allComments.map(c => ({
      id: c._id,
      prompt: c.prompt,
      content: c.content,
      author: c.author
    })));

    // Test the getByPrompt method with a specific prompt ID
    const promptId = '687cfd3ebaf28db98fea11be'; // Use the prompt ID from the error
    console.log(`\nTesting getByPrompt for prompt: ${promptId}`);
    
    const commentsForPrompt = await Comment.getByPrompt(promptId);
    console.log('Comments for prompt:', commentsForPrompt.length);
    console.log('Comments data:', commentsForPrompt.map(c => ({
      id: c._id,
      content: c.content,
      author: c.author
    })));

  } catch (error) {
    console.error('Debug failed:', error);
  } finally {
    process.exit(0);
  }
}

debugComments();
