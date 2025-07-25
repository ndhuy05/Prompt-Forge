const mongoose = require('mongoose');
require('dotenv').config();

console.log('Starting MongoDB connection test...');
console.log('MongoDB URI:', process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB successfully');
        
        // List all collections
        return mongoose.connection.db.listCollections().toArray();
    })
    .then(collections => {
        console.log('📁 Collections found:', collections.map(c => c.name));
        
        // Check each collection
        return Promise.all(collections.map(async (collection) => {
            const count = await mongoose.connection.db.collection(collection.name).countDocuments();
            console.log(`📊 ${collection.name}: ${count} documents`);
            
            // Check indexes
            const indexes = await mongoose.connection.db.collection(collection.name).indexes();
            console.log(`🔍 ${collection.name} indexes:`, indexes.map(i => i.name));
            
            return { name: collection.name, count, indexes };
        }));
    })
    .then(results => {
        console.log('\n📈 Summary:');
        results.forEach(r => {
            console.log(`- ${r.name}: ${r.count} docs, ${r.indexes.length} indexes`);
        });
        
        mongoose.connection.close();
    })
    .catch(error => {
        console.error('❌ Error:', error.message);
        if (error.message.includes('index')) {
            console.error('🔍 This appears to be an index-related error');
        }
        process.exit(1);
    });
