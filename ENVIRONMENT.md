# Environment Configuration Guide

## Environment Variables

### Required Variables

| Variable | Description | Local Development | Production (Render) |
|----------|-------------|-------------------|---------------------|
| `NODE_ENV` | Application environment | `development` | `production` |
| `PORT` | Server port | `5000` | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/promptforce` | Your MongoDB Atlas URI |
| `JWT_SECRET` | JWT signing secret | Any secure string | Secure random string |

### Optional Variables

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:3000` | `https://your-frontend.onrender.com` |
| `SERVER_URL` | Backend URL | `http://localhost:5000` | `https://your-backend.onrender.com` |
| `DB_NAME` | Database name | `promptforce` | `promptforce` |
| `GEMINI_API_KEY` | Google Gemini API key | Built-in key | `AIzaSyCbCVIwSZQaa5jMeFNL0wkepxkDR_o6AtE` |
| `BCRYPT_ROUNDS` | Password hashing rounds | `12` | `12` |

## Environment Behavior

### Development Mode (`NODE_ENV=development`)
- **Summary Service**: Python/Qwen → Gemini API → Fallback
- **Similarity Service**: Python FAISS → JavaScript transformers → Text-based
- **Purpose**: Full ML capabilities for testing and development

### Production Mode (`NODE_ENV=production`) 
- **Summary Service**: Gemini API → Python/Qwen → Fallback
- **Similarity Service**: JavaScript transformers → Text-based → (no Python)
- **Purpose**: Lightweight, fast deployment with cloud APIs

## Local Development Setup

1. Copy environment variables:
```bash
# Create .env file in server directory
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/promptforce
JWT_SECRET=your-super-secret-jwt-key-should-be-very-long-and-random
CLIENT_URL=http://localhost:3000
SERVER_URL=http://localhost:5000
GEMINI_API_KEY=AIzaSyCbCVIwSZQaa5jMeFNL0wkepxkDR_o6AtE
```

2. Run with Docker Compose:
```bash
docker-compose up --build
```

## Render Deployment Setup

### Environment Variables in Render:
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/promptforce
JWT_SECRET=your-production-jwt-secret
CLIENT_URL=https://your-frontend.onrender.com
GEMINI_API_KEY=AIzaSyCbCVIwSZQaa5jMeFNL0wkepxkDR_o6AtE
```

### Render Service Settings:
- **Environment**: Docker
- **Root Directory**: (empty)
- **Dockerfile Path**: Dockerfile
- **Build Command**: (empty)
- **Start Command**: (empty)

## Benefits by Environment

### Local Development Benefits:
- ✅ Full ML model capabilities (Python/Qwen + FAISS)
- ✅ Highest accuracy similarity search
- ✅ Local debugging of ML services
- ✅ No external API dependencies

### Production Deployment Benefits:
- ✅ Fast build times (3-5 minutes vs 10-15 minutes)
- ✅ Low memory usage (300MB vs 1GB+)
- ✅ Quick startup (30 seconds vs 3+ minutes)
- ✅ Reliable cloud APIs (Gemini)
- ✅ No Python ML dependency issues 