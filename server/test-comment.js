// Test script to check comment creation
const mongoose = require('mongoose');
require('dotenv').config();

// Connect to database
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/promptforce')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const Comment = require('./api/models/commentModel');
const Prompt = require('./api/models/promptModel');

async function testCommentCreation() {
  try {
    // Find an existing prompt
    const prompt = await Prompt.findOne();
    if (!prompt) {
      console.log('No prompts found. Please create a prompt first.');
      return;
    }

    console.log('Testing with prompt:', prompt._id);
    console.log('Prompt likes:', prompt.likes);
    console.log('Prompt likesCount:', prompt.likesCount);

    // Create a test comment
    const comment = await Comment.create({
      prompt: prompt._id,
      author: '6877b65202841c0d0b862dbc', // Use an existing user ID
      content: 'Test comment from script'
    });

    console.log('Comment created successfully:', comment._id);

    // Test population
    const populatedComment = await Comment.findById(comment._id)
      .populate('author', 'username avatar fullName');

    console.log('Comment populated successfully');
    console.log('Populated comment:', JSON.stringify(populatedComment, null, 2));

    // Clean up
    await Comment.findByIdAndDelete(comment._id);
    console.log('Test comment cleaned up');

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    process.exit(0);
  }
}

testCommentCreation();
