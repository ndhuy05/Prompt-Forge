# FAISS Similarity Search Setup

## Backend Dependencies

```bash
cd server
npm install @xenova/transformers faiss-node
```

## Note về FAISS setup:

1. **@xenova/transformers**: JavaScript implementation của sentence transformers
2. **faiss-node**: Node.js bindings cho FAISS
3. Nếu gặp lỗi với faiss-node, có thể dùng alternative:
   ```bash
   npm install @tensorflow/tfjs @tensorflow/tfjs-node sentence-transformers-js
   ```

## Khởi tạo FAISS Index

Trong server.js, thêm:

```javascript
const similarityService = require('./api/services/similarityService');

// Initialize similarity service after database connection
connectDB().then(() => {
    similarityService.initialize();
    setTimeout(() => {
        similarityService.buildIndex();
    }, 5000); // Wait 5 seconds after startup
});
```

## Rebuild Index

Tạo script để rebuild index khi có prompt mới:

```bash
# Create rebuild script
node scripts/rebuildIndex.js
```
