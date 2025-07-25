const axios = require('axios');

async function testAPI() {
    try {
        console.log('🔄 Testing API endpoints...');
        
        // Test health endpoint
        const healthResponse = await axios.get('http://localhost:5000/health');
        console.log('✅ Health check:', healthResponse.data);
        
        // Test prompts endpoint
        const promptsResponse = await axios.get('http://localhost:5000/api/prompts');
        console.log('✅ Prompts API:', promptsResponse.data);
        
        if (promptsResponse.data.success && promptsResponse.data.data.length > 0) {
            console.log(`📝 Found ${promptsResponse.data.data.length} prompts`);
            console.log('Sample prompt:', promptsResponse.data.data[0].title);
        } else {
            console.log('❌ No prompts found or API error');
        }
        
    } catch (error) {
        console.error('❌ API Test Error:', error.message);
        if (error.response) {
            console.error('Response:', error.response.data);
        }
    }
}

testAPI();
