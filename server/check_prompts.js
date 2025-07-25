const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/promptforce');

// Simple prompt schema
const promptSchema = new mongoose.Schema({
    title: String,
    content: String,
    isPublic: Boolean
});

const Prompt = mongoose.model('Prompt', promptSchema);

async function checkPrompts() {
    try {
        const prompts = await Prompt.find({}).select('title content isPublic');
        console.log('Prompts in database:');
        console.log(`Total: ${prompts.length}`);
        
        prompts.forEach((p, index) => {
            console.log(`\n${index + 1}. ID: ${p._id}`);
            console.log(`   Title: ${p.title || 'NO TITLE'}`);
            console.log(`   Content: ${p.content ? p.content.substring(0, 100) + '...' : 'NO CONTENT'}`);
            console.log(`   IsPublic: ${p.isPublic}`);
        });
        
        const withContent = prompts.filter(p => p.content && p.content.trim());
        console.log(`\nPrompts with content: ${withContent.length}`);
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        mongoose.disconnect();
    }
}

checkPrompts();
