# PromptForge - AI-Powered Prompt Sharing Platform

An intelligent prompt sharing platform built with Vue.js and Node.js, featuring advanced AI capabilities for content enhancement and similarity analysis.

## 🤖 AI Features

### 1. **AI-Powered Prompt Summarization**
- **Technology**: Python integration with AI summarization models
- **Implementation**: `server/python/summarize_service.py`
- **Service**: `server/api/services/summaryService.js`
- **Purpose**: Automatically generates concise summaries for lengthy prompts to improve readability and searchability

### 2. **Intelligent Similarity Detection**
- **Technology**: Advanced similarity algorithms using NLP techniques
- **Implementation**: `server/python/similarity_service.py`
- **Service**: `server/api/services/similarityService.js`
- **Purpose**: 
  - Prevents duplicate content submission
  - Suggests related prompts to users
  - Enhances content discovery through semantic matching

### 3. **Smart Content Management**
- **Auto-categorization**: AI analyzes prompt content to suggest appropriate categories
- **Content Enhancement**: Provides suggestions for improving prompt effectiveness
- **Semantic Search**: Advanced search capabilities beyond keyword matching

## 🏗️ Architecture

### Backend (Node.js/Express)
```
server/
├── api/
│   ├── controllers/     # Business logic
│   │   ├── authController.js
│   │   ├── promptController.js
│   │   ├── commentController.js
│   │   ├── adminController.js
│   │   ├── dashboardController.js
│   │   └── tagController.js
│   ├── models/         # MongoDB schemas
│   │   ├── userModel.js
│   │   ├── promptModel.js
│   │   ├── commentModel.js
│   │   └── tagModel.js
│   ├── routes/         # API endpoints
│   │   ├── authRoutes.js
│   │   ├── promptRoutes.js
│   │   ├── commentRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── dashboardRoutes.js
│   │   └── tagRoutes.js
│   ├── services/       # AI service integrations
│   │   ├── similarityService.js
│   │   └── summaryService.js
│   ├── middleware/     # Authentication, validation
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   ├── rateLimiter.js
│   │   └── validation.js
│   └── helpers/        # Utility functions
├── python/             # AI processing scripts
│   ├── similarity_service.py
│   └── summarize_service.py
├── config/            # Database configuration
│   └── database.js
└── public/            # Static assets
    └── images/
```

### Frontend (Vue.js 3)
```
client/
├── src/
│   ├── api/           # API communication layer
│   │   ├── authAPI.js
│   │   ├── promptAPI.js
│   │   ├── commentAPI.js
│   │   ├── adminAPI.js
│   │   ├── dashboardAPI.js
│   │   └── tagAPI.js
│   ├── components/    # Reusable Vue components
│   │   └── layout/
│   │       ├── NavBar.vue
│   │       └── Footer.vue
│   ├── views/         # Page components
│   │   ├── Home.vue
│   │   ├── Dashboard.vue
│   │   ├── Prompts.vue
│   │   ├── PromptDetail.vue
│   │   ├── CreatePrompt.vue
│   │   ├── EditPrompt.vue
│   │   ├── MyPrompts.vue
│   │   ├── Admin.vue
│   │   ├── AdminPrompts.vue
│   │   ├── AdminUsers.vue
│   │   └── auth/
│   │       ├── Login.vue
│   │       └── Register.vue
│   ├── router/        # Navigation routing
│   │   └── index.js
│   ├── utils/         # Helper utilities
│   │   └── auth.js
│   └── assets/        # Static assets
│       └── css/
└── public/            # Public assets
```

## 🚀 Key Features

### Core Functionality
- **User Authentication & Authorization** (JWT-based)
- **Prompt Creation & Management** with rich text editor
- **Advanced Search & Filtering** with AI-enhanced results
- **Like & Comment System** with real-time updates
- **Admin Dashboard** for content moderation
- **Role-based Access Control** (User/Admin)
- **Tag Management** for better content organization
- **Dashboard Analytics** with usage statistics

### AI-Enhanced Features
- **Automatic Content Summarization**
- **Duplicate Detection** using similarity algorithms
- **Smart Recommendations** based on user behavior
- **Content Quality Assessment**
- **Semantic Search** capabilities
- **Intelligent Categorization**

## 🛠️ Technology Stack

### Frontend
- **Vue.js 3** (Composition API)
- **Vue Router** for navigation
- **Axios** for HTTP requests
- **Vite** for development and building
- **CSS3** for responsive design

### Backend
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcrypt** for password hashing
- **Python** integration for AI services
- **Docker** for containerization

### AI/ML Technologies
- **Python** for AI processing
- **NLP libraries** for text analysis
- **Similarity algorithms** for content matching
- **Summarization models** for content enhancement
- **Machine Learning** for recommendation systems

## 📊 Database Schema

### Users
```javascript
{
  username: String,
  email: String,
  password: String,        // bcrypt hashed
  fullName: String,
  avatar: String,
  role: Enum ['user', 'admin'],
  createdAt: Date,
  updatedAt: Date,
  lastLogin: Date
}
```

### Prompts
```javascript
{
  title: String,
  description: String,
  content: String,
  summary: String,         // AI-generated
  category: String,
  tags: [ObjectId],
  author: ObjectId,
  likes: [ObjectId],
  likesCount: Number,
  views: Number,
  isPublic: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Comments
```javascript
{
  content: String,
  author: ObjectId,
  prompt: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

### Tags
```javascript
{
  name: String,
  description: String,
  color: String,
  createdBy: ObjectId,
  createdAt: Date
}
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- Python (v3.8 or higher)
- Git

### 1. Clone the repository
```bash
git clone https://github.com/ndhuy05/Prompt-Forge.git
cd promptforge
```

### 2. Install Backend Dependencies
```bash
cd server
npm install
pip install -r requirements.txt
```

### 3. Install Frontend Dependencies
```bash
cd ../client
npm install
```

### 4. Environment Configuration

**Server `.env`**
```env
# Database
MONGODB_URI=mongodb://localhost:27017/promptforge

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=30d

# Server Configuration
PORT=5000
NODE_ENV=development

# Python Services
PYTHON_SERVICE_URL=http://localhost:8000
```

**Client `.env`**
```env
VITE_API_URL=http://localhost:5000/api
```

### 5. Start the Application

**Backend (Terminal 1)**
```bash
cd server
npm run dev
```

**Frontend (Terminal 2)**
```bash
cd client
npm run dev
```

**Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

## 🤖 AI Service Integration

### Summarization Service
```javascript
const summaryService = require('./services/summaryService');

// Generate AI summary for new prompts
const summary = await summaryService.generateSummary(promptContent);

// Usage in controller
const newPrompt = await Prompt.create({
  title,
  content,
  summary: await summaryService.generateSummary(content),
  author: req.user.id
});
```

### Similarity Detection
```javascript
const similarityService = require('./services/similarityService');

// Check for similar existing prompts
const similarPrompts = await similarityService.findSimilar(newPrompt);

// Prevent duplicate submissions
if (similarPrompts.length > 0 && similarPrompts[0].similarity > 0.85) {
  return res.status(400).json({
    message: 'Similar prompt already exists',
    suggestions: similarPrompts
  });
}
```

### Python AI Services
```python
# similarity_service.py
def calculate_similarity(text1, text2):
    # Advanced NLP similarity calculation
    return similarity_score

# summarize_service.py
def generate_summary(text, max_length=150):
    # AI-powered text summarization
    return summary
```

## 📈 Performance Optimizations

- **Lazy Loading** for prompt content
- **Pagination** for large datasets (100 items per page)
- **Caching** for AI processing results
- **Rate Limiting** for API endpoints (100 requests/15min)
- **Image Optimization** for avatars and content
- **Database Indexing** for search performance
- **CDN Integration** for static assets

## 🔒 Security Features

- **JWT Authentication** with secure token handling
- **Password Encryption** using bcrypt (12 rounds)
- **Input Validation** and sanitization
- **Rate Limiting** to prevent abuse
- **CORS Configuration** for secure cross-origin requests
- **SQL Injection Protection** via Mongoose
- **XSS Protection** with input validation
- **Role-based Authorization** middleware

## 📱 Responsive Design

- **Mobile-first** approach
- **Optimized** for all screen sizes (320px - 2560px)
- **Touch-friendly** interface
- **Progressive Web App** capabilities
- **Dark/Light mode** support

## 🎯 API Endpoints

### Authentication
```
POST /api/auth/register    # User registration
POST /api/auth/login       # User login
POST /api/auth/logout      # User logout
GET  /api/auth/me          # Get current user
```

### Prompts
```
GET    /api/prompts              # Get all prompts (with filters)
GET    /api/prompts/:id          # Get specific prompt
POST   /api/prompts              # Create new prompt
PUT    /api/prompts/:id          # Update prompt
DELETE /api/prompts/:id          # Delete prompt
POST   /api/prompts/:id/like     # Like/unlike prompt
```

### Comments
```
GET    /api/comments/prompt/:id  # Get prompt comments
POST   /api/comments             # Create comment
PUT    /api/comments/:id         # Update comment
DELETE /api/comments/:id         # Delete comment
```

### Admin
```
GET    /api/admin/users          # Get all users
GET    /api/admin/prompts        # Get all prompts
DELETE /api/admin/users/:id      # Delete user
PUT    /api/admin/users/:id      # Update user role
```

## 🎯 Future AI Enhancements

1. **Advanced NLP Models** for better content understanding
2. **Personalized Recommendations** using collaborative filtering
3. **Automated Content Moderation** with AI filtering
4. **Sentiment Analysis** for user feedback
5. **Multi-language Support** with AI translation
6. **Voice-to-Text** prompt creation
7. **AI-powered Writing Assistant**
8. **Content Quality Scoring**

## 🧪 Testing

```bash
# Backend tests
cd server
npm test

# Frontend tests
cd client
npm test

# E2E tests
npm run test:e2e
```

## 🚀 Deployment

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d
```

### Manual Deployment
```bash
# Backend
cd server
npm run build
npm start

# Frontend
cd client
npm run build
```

## 🤝 Contributing

This project demonstrates proficiency in:

- **Full-stack Development** with modern JavaScript ecosystem
- **AI/ML Integration** in production web applications
- **Microservices Architecture** with Python AI services
- **Database Design** for AI-enhanced applications
- **RESTful API Development** with intelligent features
- **User Experience Design** for AI-powered platforms
- **DevOps Practices** with Docker and CI/CD
- **Security Implementation** in web applications
- **Performance Optimization** for scalable applications
- **Code Quality** with ESLint, Prettier, and testing

### AI Engineering Skills Highlighted:
- **Machine Learning Integration** in web applications
- **NLP Processing** for text analysis and similarity
- **AI Service Architecture** with Python microservices
- **Data Pipeline Design** for AI model integration
- **Algorithm Implementation** for recommendation systems
- **Model Deployment** in production environments

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

**Nguyen Duc Huy**
- Portfolio: [Your Portfolio URL]
- LinkedIn: [Your LinkedIn URL]
- Email: [Your Email]

---

*Built with ❤️ and AI for the future of content sharing*

## 🔗 Live Demo

- **Live Application**: [Demo URL]
- **API Documentation**: [API Docs URL]
- **Video Demo**: [Demo Video URL]

---

**Note**: This project showcases advanced AI integration capabilities suitable for AI Engineer positions, demonstrating both technical depth and practical implementation of machine learning in web applications.
