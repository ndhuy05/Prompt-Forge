const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../api/models/userModel');
const Prompt = require('../api/models/promptModel');
const Comment = require('../api/models/commentModel');
const Tag = require('../api/models/tagModel');


// Connect to database
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error);
        process.exit(1);
    }
};

// Sample users data
const sampleUsers = [
    {
        username: 'admin',
        email: 'admin@promptforce.dev',
        password: 'admin123',
        fullName: 'Admin User',
        role: 'admin',
        bio: 'Platform administrator and AI enthusiast',
        isActive: true
    },
    {
        username: 'alex_coder',
        email: 'alex@example.com',
        password: 'password123',
        fullName: 'Alex Rodriguez',
        bio: 'Senior Full-Stack Developer passionate about React, Node.js, and modern web technologies',
        isActive: true
    },
    {
        username: 'sarah_ai',
        email: 'sarah@example.com',
        password: 'password123',
        fullName: 'Sarah Johnson',
        bio: 'AI/ML Engineer specializing in prompt engineering and natural language processing',
        isActive: true
    },
    {
        username: 'mike_frontend',
        email: 'mike@example.com',
        password: 'password123',
        fullName: 'Mike Chen',
        bio: 'Frontend Developer expert in Vue.js, React, and CSS frameworks',
        isActive: true
    },
    {
        username: 'lisa_backend',
        email: 'lisa@example.com',
        password: 'password123',
        fullName: 'Lisa Wang',
        bio: 'Backend Developer focused on Python, Django, and microservices architecture',
        isActive: true
    },
    {
        username: 'david_mobile',
        email: 'david@example.com',
        password: 'password123',
        fullName: 'David Kim',
        bio: 'Mobile App Developer with expertise in React Native and Flutter',
        isActive: true
    },
    {
        username: 'emma_designer',
        email: 'emma@example.com',
        password: 'password123',
        fullName: 'Emma Thompson',
        bio: 'UX/UI Designer who codes - bridging design and development',
        isActive: true
    },
    {
        username: 'james_devops',
        email: 'james@example.com',
        password: 'password123',
        fullName: 'James Wilson',
        bio: 'DevOps Engineer specializing in Docker, Kubernetes, and CI/CD pipelines',
        isActive: true
    },
    {
        username: 'anna_data',
        email: 'anna@example.com',
        password: 'password123',
        fullName: 'Anna Martinez',
        bio: 'Data Scientist passionate about machine learning and data visualization',
        isActive: true
    },
    {
        username: 'ryan_security',
        email: 'ryan@example.com',
        password: 'password123',
        fullName: 'Ryan Garcia',
        bio: 'Cybersecurity specialist focused on secure coding practices and penetration testing',
        isActive: true
    },
    {
        username: 'olivia_writer',
        email: 'olivia@example.com',
        password: 'password123',
        fullName: 'Olivia Brown',
        bio: 'Technical writer and content creator specializing in developer documentation',
        isActive: true
    },
    {
        username: 'ethan_architect',
        email: 'ethan@example.com',
        password: 'password123',
        fullName: 'Ethan Davis',
        bio: 'Software architect with 15+ years experience in enterprise applications',
        isActive: true
    },
    {
        username: 'sophia_product',
        email: 'sophia@example.com',
        password: 'password123',
        fullName: 'Sophia Miller',
        bio: 'Product Manager with a technical background in software development',
        isActive: true
    },
    {
        username: 'noah_startup',
        email: 'noah@example.com',
        password: 'password123',
        fullName: 'Noah Johnson',
        bio: 'Startup founder and entrepreneur building innovative tech solutions',
        isActive: true
    },
    {
        username: 'maya_researcher',
        email: 'maya@example.com',
        password: 'password123',
        fullName: 'Maya Patel',
        bio: 'Research scientist exploring the intersection of AI and human-computer interaction',
        isActive: true
    }
];

// Sample prompts data
const samplePrompts = [
    {
        title: 'React Custom Hook for API Data Fetching',
        content: `Create a custom React hook that handles API data fetching with loading states, error handling, and caching:

\`\`\`javascript
import { useState, useEffect, useCallback } from 'react';

export const useApiData = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });
      
      if (!response.ok) {
        throw new Error(\`HTTP error! status: \${response.status}\`);
      }
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [url, options]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  return { data, loading, error, refetch: fetchData };
};
\`\`\`

Usage example:
\`\`\`javascript
const UserProfile = ({ userId }) => {
  const { data: user, loading, error } = useApiData(\`/api/users/\${userId}\`);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return <div>Welcome, {user.name}!</div>;
};
\`\`\``,
        description: 'A reusable React hook for handling API calls with proper error handling and loading states',
        category: 'coding',
        tags: ['react', 'hooks', 'api', 'javascript', 'frontend']
    },
    {
        title: 'Python Data Analysis Pipeline with Pandas',
        content: `Create a comprehensive data analysis pipeline using pandas for processing and analyzing large datasets:

\`\`\`python
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import matplotlib.pyplot as plt
import seaborn as sns

class DataAnalysisPipeline:
    def __init__(self, data_source):
        self.data_source = data_source
        self.df = None
        self.cleaned_df = None
        self.analysis_results = {}
    
    def load_data(self):
        """Load data from various sources"""
        if self.data_source.endswith('.csv'):
            self.df = pd.read_csv(self.data_source)
        elif self.data_source.endswith('.json'):
            self.df = pd.read_json(self.data_source)
        elif self.data_source.endswith('.xlsx'):
            self.df = pd.read_excel(self.data_source)
        else:
            raise ValueError("Unsupported file format")
        
        print(f"✅ Data loaded: {self.df.shape[0]} rows, {self.df.shape[1]} columns")
        return self
    
    def clean_data(self):
        """Clean and preprocess the data"""
        self.cleaned_df = self.df.copy()
        
        # Remove duplicates
        initial_rows = len(self.cleaned_df)
        self.cleaned_df = self.cleaned_df.drop_duplicates()
        print(f"🧹 Removed {initial_rows - len(self.cleaned_df)} duplicate rows")
        
        # Handle missing values
        numeric_columns = self.cleaned_df.select_dtypes(include=[np.number]).columns
        categorical_columns = self.cleaned_df.select_dtypes(include=['object']).columns
        
        # Fill numeric columns with median
        for col in numeric_columns:
            self.cleaned_df[col].fillna(self.cleaned_df[col].median(), inplace=True)
        
        # Fill categorical columns with mode
        for col in categorical_columns:
            self.cleaned_df[col].fillna(self.cleaned_df[col].mode()[0], inplace=True)
        
        return self
    
    def analyze(self):
        """Perform comprehensive analysis"""
        if self.cleaned_df is None:
            raise ValueError("Data must be cleaned before analysis")
        
        # Basic statistics
        self.analysis_results['basic_stats'] = self.cleaned_df.describe()
        
        # Correlation matrix for numeric columns
        numeric_df = self.cleaned_df.select_dtypes(include=[np.number])
        if len(numeric_df.columns) > 1:
            self.analysis_results['correlation_matrix'] = numeric_df.corr()
        
        return self
    
    def visualize(self, output_dir='./plots'):
        """Create visualizations"""
        import os
        os.makedirs(output_dir, exist_ok=True)
        
        # Distribution plots for numeric columns
        numeric_columns = self.cleaned_df.select_dtypes(include=[np.number]).columns
        for col in numeric_columns:
            plt.figure(figsize=(10, 6))
            self.cleaned_df[col].hist(bins=30, alpha=0.7)
            plt.title(f'Distribution of {col}')
            plt.xlabel(col)
            plt.ylabel('Frequency')
            plt.savefig(f'{output_dir}/{col}_distribution.png')
            plt.close()
        
        return self

# Usage example
if __name__ == "__main__":
    pipeline = DataAnalysisPipeline('data.csv')
    pipeline.load_data().clean_data().analyze().visualize()
\`\`\``,
        description: 'A comprehensive Python class for data analysis pipeline with pandas, including cleaning, analysis, and visualization',
        category: 'analysis',
        tags: ['python', 'pandas', 'data-analysis', 'visualization', 'numpy']
    },
    {
        title: 'Vue.js Composition API Store Pattern',
        content: `Create a lightweight state management solution using Vue 3 Composition API:

\`\`\`javascript
// stores/useUserStore.js
import { ref, computed, readonly } from 'vue';

export const useUserStore = () => {
  // State
  const user = ref(null);
  const isLoading = ref(false);
  const error = ref(null);
  
  // Computed properties
  const isAuthenticated = computed(() => !!user.value);
  const userRole = computed(() => user.value?.role || 'guest');
  
  // Actions
  const login = async (credentials) => {
    try {
      isLoading.value = true;
      error.value = null;
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      if (!response.ok) {
        throw new Error('Login failed');
      }
      
      const data = await response.json();
      user.value = data.user;
      localStorage.setItem('token', data.token);
      
      return data;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };
  
  const logout = () => {
    user.value = null;
    localStorage.removeItem('token');
  };
  
  return {
    user: readonly(user),
    isLoading: readonly(isLoading),
    error: readonly(error),
    isAuthenticated,
    userRole,
    login,
    logout,
  };
};
\`\`\`

Usage in components:
\`\`\`javascript
<template>
  <div class="user-profile">
    <div v-if="isLoading">Loading...</div>
    <div v-else-if="error">Error: {{ error }}</div>
    <div v-else-if="isAuthenticated">
      <h2>Welcome, {{ user.fullName }}!</h2>
      <p>Role: {{ userRole }}</p>
      <button @click="handleLogout">Logout</button>
    </div>
    <div v-else>
      <LoginForm @login="handleLogin" />
    </div>
  </div>
</template>

<script setup>
import { useUserStore } from '@/stores/useUserStore';

const { 
  user, 
  isLoading, 
  error, 
  isAuthenticated, 
  userRole, 
  login, 
  logout 
} = useUserStore();

const handleLogin = async (credentials) => {
  try {
    await login(credentials);
  } catch (err) {
    console.error('Login error:', err);
  }
};

const handleLogout = () => {
  logout();
};
</script>
\`\`\``,
        description: 'A clean and scalable state management pattern using Vue 3 Composition API',
        category: 'coding',
        tags: ['vue', 'composition-api', 'state-management', 'javascript', 'frontend']
    },
    {
        title: 'Creative Writing AI Assistant Prompt',
        content: `You are a professional creative writing assistant with expertise in various genres and writing techniques. Your role is to help writers at all levels improve their craft, overcome writer's block, and develop compelling narratives.

**Your Capabilities:**
- Story development and plot structuring
- Character development and dialogue writing
- Genre-specific guidance (fantasy, sci-fi, romance, mystery, etc.)
- Writing technique improvement
- Editing and revision suggestions
- Inspiration and prompt generation

**When helping with creative writing:**

1. **Story Development:**
   - Ask clarifying questions about the writer's vision
   - Suggest plot structures (three-act, hero's journey, etc.)
   - Help identify and resolve plot holes
   - Recommend pacing improvements

2. **Character Development:**
   - Guide the creation of multi-dimensional characters
   - Suggest character arcs and development
   - Help with dialogue authenticity
   - Recommend character motivation techniques

3. **Genre Expertise:**
   - Provide genre-specific conventions and tropes
   - Suggest appropriate tone and style
   - Recommend research areas for accuracy
   - Help with world-building for fantasy/sci-fi

**Example Interaction:**
User: "I'm stuck on how to make my villain more compelling."

Response: "Great question! Compelling villains are often the most memorable characters. Here are several approaches:

1. **Give them understandable motivations** - What do they believe they're fighting for?
2. **Create moral complexity** - Give them admirable qualities or skills
3. **Connect them to the hero** - Mirror the protagonist's journey

Can you tell me more about your villain's current role in the story?"`,
        description: 'A comprehensive AI prompt for creative writing assistance covering story development, character creation, and genre-specific guidance',
        category: 'creative',
        tags: ['writing', 'creative', 'ai-prompt', 'storytelling', 'character-development']
    },
    {
        title: 'Advanced Express.js API with Authentication',
        content: `Build a production-ready REST API with Express.js including authentication, validation, and security middleware:

\`\`\`javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Validation middleware
const { body, validationResult } = require('express-validator');

const validateUser = [
  body('username')
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be between 3 and 20 characters'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Routes
app.post('/api/auth/register', validateUser, async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create user (pseudo-code)
    const user = await User.create({
      username,
      email,
      password: hashedPassword
    });
    
    // Generate token
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Protected routes
app.get('/api/users/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

module.exports = app;
\`\`\``,
        description: 'A production-ready Express.js API with comprehensive security, authentication, and validation',
        category: 'coding',
        tags: ['nodejs', 'express', 'api', 'authentication', 'security', 'javascript']
    },
    {
        title: 'CSS Grid Layout System with Responsive Design',
        content: `Create a comprehensive CSS Grid layout system for modern web applications:

\`\`\`css
/* CSS Grid Layout System */

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.grid {
  display: grid;
  gap: 1rem;
}

/* Grid Templates */
.grid-1 { grid-template-columns: 1fr; }
.grid-2 { grid-template-columns: repeat(2, 1fr); }
.grid-3 { grid-template-columns: repeat(3, 1fr); }
.grid-4 { grid-template-columns: repeat(4, 1fr); }

/* Responsive Grid */
.grid-responsive {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

/* Holy Grail Layout */
.holy-grail {
  display: grid;
  grid-template:
    "header header header" auto
    "nav main aside" 1fr
    "footer footer footer" auto /
    200px 1fr 200px;
  min-height: 100vh;
  gap: 1rem;
}

.holy-grail .header { grid-area: header; }
.holy-grail .nav { grid-area: nav; }
.holy-grail .main { grid-area: main; }
.holy-grail .aside { grid-area: aside; }
.holy-grail .footer { grid-area: footer; }

/* Card Grid */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  padding: 1rem;
}

.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
}

.card-header {
  padding: 1rem;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.card-body {
  padding: 1rem;
}

.card-footer {
  padding: 1rem;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

/* Responsive Design */
@media (max-width: 768px) {
  .grid-2,
  .grid-3,
  .grid-4 {
    grid-template-columns: 1fr;
  }
  
  .holy-grail {
    grid-template:
      "header" auto
      "nav" auto
      "main" 1fr
      "aside" auto
      "footer" auto / 1fr;
  }
}

/* Utility Classes */
.gap-1 { gap: 0.25rem; }
.gap-2 { gap: 0.5rem; }
.gap-3 { gap: 0.75rem; }
.gap-4 { gap: 1rem; }
.gap-5 { gap: 1.25rem; }
.gap-6 { gap: 1.5rem; }
\`\`\`

HTML Example:
\`\`\`html
<div class="container">
  <div class="card-grid">
    <div class="card">
      <div class="card-header">
        <h3>Card Title</h3>
      </div>
      <div class="card-body">
        <p>Card content goes here...</p>
      </div>
      <div class="card-footer">
        <button class="btn">Action</button>
      </div>
    </div>
    <!-- More cards... -->
  </div>
</div>
\`\`\``,
        description: 'A comprehensive CSS Grid layout system with responsive design patterns and utility classes',
        category: 'coding',
        tags: ['css', 'grid', 'responsive', 'layout', 'frontend', 'design']
    },
    {
        title: 'Machine Learning Model Training Guide',
        content: `A comprehensive guide to training machine learning models with scikit-learn:

\`\`\`python
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns

class MLModelTrainer:
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.label_encoder = LabelEncoder()
        
    def prepare_data(self, X, y):
        """Prepare data for training"""
        # Handle missing values
        X = X.fillna(X.mean())
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        # Encode labels if necessary
        if y.dtype == 'object':
            y_encoded = self.label_encoder.fit_transform(y)
        else:
            y_encoded = y
            
        return X_scaled, y_encoded
    
    def train_model(self, X, y, model_type='random_forest'):
        """Train the model"""
        X_prepared, y_prepared = self.prepare_data(X, y)
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X_prepared, y_prepared, test_size=0.2, random_state=42
        )
        
        # Initialize model
        if model_type == 'random_forest':
            self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        
        # Train model
        self.model.fit(X_train, y_train)
        
        # Evaluate model
        y_pred = self.model.predict(X_test)
        
        print("Model Performance:")
        print(classification_report(y_test, y_pred))
        
        # Feature importance
        if hasattr(self.model, 'feature_importances_'):
            feature_importance = pd.DataFrame({
                'feature': X.columns,
                'importance': self.model.feature_importances_
            }).sort_values('importance', ascending=False)
            
            print("\\nTop 10 Most Important Features:")
            print(feature_importance.head(10))
        
        return self.model
    
    def cross_validate(self, X, y, cv=5):
        """Perform cross-validation"""
        X_prepared, y_prepared = self.prepare_data(X, y)
        
        scores = cross_val_score(self.model, X_prepared, y_prepared, cv=cv)
        
        print(f"Cross-validation scores: {scores}")
        print(f"Mean CV score: {scores.mean():.4f} (+/- {scores.std() * 2:.4f})")
        
        return scores
    
    def hyperparameter_tuning(self, X, y):
        """Perform hyperparameter tuning"""
        X_prepared, y_prepared = self.prepare_data(X, y)
        
        param_grid = {
            'n_estimators': [50, 100, 200],
            'max_depth': [10, 20, None],
            'min_samples_split': [2, 5, 10],
            'min_samples_leaf': [1, 2, 4]
        }
        
        grid_search = GridSearchCV(
            RandomForestClassifier(random_state=42),
            param_grid,
            cv=5,
            scoring='accuracy',
            n_jobs=-1
        )
        
        grid_search.fit(X_prepared, y_prepared)
        
        print("Best parameters:", grid_search.best_params_)
        print("Best cross-validation score:", grid_search.best_score_)
        
        self.model = grid_search.best_estimator_
        return self.model
    
    def visualize_results(self, X, y):
        """Visualize model results"""
        X_prepared, y_prepared = self.prepare_data(X, y)
        X_train, X_test, y_train, y_test = train_test_split(
            X_prepared, y_prepared, test_size=0.2, random_state=42
        )
        
        y_pred = self.model.predict(X_test)
        
        # Confusion matrix
        plt.figure(figsize=(8, 6))
        cm = confusion_matrix(y_test, y_pred)
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues')
        plt.title('Confusion Matrix')
        plt.ylabel('Actual')
        plt.xlabel('Predicted')
        plt.show()
        
        # Feature importance
        if hasattr(self.model, 'feature_importances_'):
            feature_importance = pd.DataFrame({
                'feature': X.columns,
                'importance': self.model.feature_importances_
            }).sort_values('importance', ascending=False).head(10)
            
            plt.figure(figsize=(10, 6))
            sns.barplot(data=feature_importance, x='importance', y='feature')
            plt.title('Top 10 Feature Importance')
            plt.tight_layout()
            plt.show()

# Usage example
if __name__ == "__main__":
    # Load your data
    # df = pd.read_csv('your_data.csv')
    # X = df.drop('target', axis=1)
    # y = df['target']
    
    # Initialize trainer
    trainer = MLModelTrainer()
    
    # Train model
    # model = trainer.train_model(X, y)
    
    # Perform cross-validation
    # trainer.cross_validate(X, y)
    
    # Hyperparameter tuning
    # trainer.hyperparameter_tuning(X, y)
    
    # Visualize results
    # trainer.visualize_results(X, y)
    
    print("ML Model Trainer ready!")
\`\`\``,
        description: 'A comprehensive machine learning model training framework with preprocessing, evaluation, and visualization',
        category: 'learning',
        tags: ['machine-learning', 'python', 'scikit-learn', 'data-science', 'model-training']
    },
    {
        title: 'Docker Containerization Best Practices',
        content: `Complete guide to containerizing applications with Docker following best practices:

\`\`\`dockerfile
# Multi-stage build for Node.js application
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Set working directory
WORKDIR /app

# Copy built application from builder stage
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package*.json ./

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:3000/health || exit 1

# Start application
CMD ["npm", "start"]
\`\`\`

\`\`\`yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=mongodb://mongo:27017/myapp
    depends_on:
      - mongo
      - redis
    volumes:
      - ./uploads:/app/uploads
    restart: unless-stopped
    networks:
      - app-network

  mongo:
    image: mongo:5.0
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=password
    volumes:
      - mongo-data:/data/db
    restart: unless-stopped
    networks:
      - app-network

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    restart: unless-stopped
    networks:
      - app-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped
    networks:
      - app-network

volumes:
  mongo-data:
  redis-data:

networks:
  app-network:
    driver: bridge
\`\`\`

\`\`\`bash
# Build and deployment scripts

#!/bin/bash
# build.sh

set -e

echo "Building Docker images..."

# Build application image
docker build -t myapp:latest .

# Tag for registry
docker tag myapp:latest registry.example.com/myapp:latest

echo "Build completed successfully!"

# Push to registry
docker push registry.example.com/myapp:latest

echo "Images pushed to registry!"
\`\`\`

\`\`\`bash
# deploy.sh

#!/bin/bash

set -e

echo "Deploying application..."

# Pull latest images
docker-compose pull

# Stop existing containers
docker-compose down

# Start new containers
docker-compose up -d

# Wait for health check
echo "Waiting for application to be ready..."
sleep 30

# Check if application is running
if curl -f http://localhost:3000/health; then
    echo "✅ Application deployed successfully!"
else
    echo "❌ Application deployment failed!"
    exit 1
fi

# Clean up old images
docker image prune -f

echo "Deployment completed!"
\`\`\`

**Best Practices:**

1. **Use multi-stage builds** to reduce image size
2. **Run as non-root user** for security
3. **Use .dockerignore** to exclude unnecessary files
4. **Implement health checks** for container monitoring
5. **Use specific image tags** instead of 'latest'
6. **Set resource limits** in docker-compose
7. **Use secrets management** for sensitive data
8. **Implement proper logging** and monitoring
9. **Use volume mounts** for persistent data
10. **Test containers locally** before deployment`,
        description: 'Comprehensive Docker containerization guide with best practices, multi-stage builds, and deployment strategies',
        category: 'other',
        tags: ['docker', 'containerization', 'devops', 'deployment', 'infrastructure']
    },
    {
        title: 'Technical Writing for Developers',
        content: `A comprehensive guide to writing clear, effective technical documentation:

## 1. Know Your Audience

Before writing, understand who will read your documentation:
- **Beginners**: Need more context and step-by-step instructions
- **Experienced developers**: Want concise, reference-style information
- **Mixed audience**: Provide both overview and detailed sections

## 2. Structure Your Content

### Use Clear Hierarchies
\`\`\`
# Main Title
## Section Heading
### Subsection
#### Details
\`\`\`

### Follow a Logical Flow
1. **Overview**: What is this about?
2. **Prerequisites**: What do readers need to know?
3. **Step-by-step instructions**: How to do it?
4. **Examples**: Show it in action
5. **Troubleshooting**: Common issues and solutions
6. **References**: Additional resources

## 3. Writing Best Practices

### Use Active Voice
❌ "The function will be called by the system"
✅ "The system calls the function"

### Be Concise
❌ "In order to be able to install the package, you need to run the following command"
✅ "To install the package, run:"

### Use Parallel Structure
❌ "The API supports creating users, user updates, and deletion of users"
✅ "The API supports creating, updating, and deleting users"

## 4. Code Documentation

### Function Documentation
\`\`\`javascript
/**
 * Calculates the total price including tax
 * @param {number} price - The base price
 * @param {number} taxRate - The tax rate (e.g., 0.1 for 10%)
 * @returns {number} The total price including tax
 * @example
 * const total = calculateTotal(100, 0.1); // Returns 110
 */
function calculateTotal(price, taxRate) {
  return price * (1 + taxRate);
}
\`\`\`

### API Documentation
\`\`\`
## POST /api/users

Creates a new user account.

### Request Body
\`\`\`json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword123"
}
\`\`\`

### Response
\`\`\`json
{
  "id": "user_123",
  "username": "johndoe",
  "email": "john@example.com",
  "created_at": "2023-01-01T00:00:00Z"
}
\`\`\`

### Error Responses
- \`400\`: Invalid request data
- \`409\`: Username or email already exists
- \`500\`: Server error
\`\`\`

## 5. README Template

\`\`\`markdown
# Project Name

Brief description of what the project does.

## Features

- Feature 1
- Feature 2
- Feature 3

## Installation

\`\`\`bash
npm install project-name
\`\`\`

## Quick Start

\`\`\`javascript
const project = require('project-name');

// Basic usage example
const result = project.doSomething();
console.log(result);
\`\`\`

## API Reference

### Methods

#### \`doSomething(param1, param2)\`

Description of what this method does.

**Parameters:**
- \`param1\` (string): Description of parameter 1
- \`param2\` (number): Description of parameter 2

**Returns:** Description of return value

**Example:**
\`\`\`javascript
const result = doSomething('hello', 42);
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) file for details.
\`\`\`

## 6. Common Mistakes to Avoid

1. **Assuming knowledge**: Don't assume readers know what you know
2. **Outdated information**: Keep documentation current with code changes
3. **No examples**: Always provide practical examples
4. **Poor formatting**: Use consistent formatting and syntax highlighting
5. **Missing context**: Explain why, not just how
6. **Incomplete error handling**: Document all possible error scenarios

## 7. Tools and Resources

- **Grammar**: Grammarly, Hemingway Editor
- **Markdown**: Typora, Mark Text
- **API docs**: Swagger/OpenAPI, Postman
- **Static sites**: GitBook, Docusaurus, VuePress
- **Diagramming**: Mermaid, Draw.io

## 8. Testing Your Documentation

1. **Have others review it**: Fresh eyes catch issues
2. **Follow your own instructions**: Can you complete the task?
3. **Test code examples**: Ensure all examples work
4. **Check links**: Verify all links are valid
5. **Mobile-friendly**: Ensure readability on different devices`,
        description: 'Comprehensive guide to writing clear, effective technical documentation for developers',
        category: 'writing',
        tags: ['technical-writing', 'documentation', 'communication', 'developer-tools']
    }
];

// Sample tags data
const sampleTags = [
    { name: 'javascript', description: 'JavaScript programming language', color: '#F7DF1E' },
    { name: 'python', description: 'Python programming language', color: '#3776AB' },
    { name: 'react', description: 'React JavaScript library', color: '#61DAFB' },
    { name: 'vue', description: 'Vue.js framework', color: '#4FC08D' },
    { name: 'nodejs', description: 'Node.js runtime', color: '#339933' },
    { name: 'express', description: 'Express.js framework', color: '#000000' },
    { name: 'css', description: 'Cascading Style Sheets', color: '#1572B6' },
    { name: 'html', description: 'HyperText Markup Language', color: '#E34F26' },
    { name: 'api', description: 'Application Programming Interface', color: '#FF6C37' },
    { name: 'hooks', description: 'React Hooks', color: '#61DAFB' },
    { name: 'frontend', description: 'Frontend development', color: '#FF4154' },
    { name: 'backend', description: 'Backend development', color: '#4CAF50' },
    { name: 'database', description: 'Database management', color: '#336791' },
    { name: 'mongodb', description: 'MongoDB database', color: '#47A248' },
    { name: 'authentication', description: 'User authentication', color: '#FF9800' },
    { name: 'security', description: 'Application security', color: '#F44336' },
    { name: 'docker', description: 'Docker containerization', color: '#2496ED' },
    { name: 'devops', description: 'DevOps practices', color: '#326CE5' },
    { name: 'machine-learning', description: 'Machine learning', color: '#FF6F00' },
    { name: 'data-science', description: 'Data science', color: '#3F51B5' },
    { name: 'pandas', description: 'Python pandas library', color: '#150458' },
    { name: 'numpy', description: 'NumPy library', color: '#013243' },
    { name: 'scikit-learn', description: 'Scikit-learn ML library', color: '#F7931E' },
    { name: 'visualization', description: 'Data visualization', color: '#E91E63' },
    { name: 'writing', description: 'Creative writing', color: '#795548' },
    { name: 'creative', description: 'Creative content', color: '#9C27B0' },
    { name: 'ai-prompt', description: 'AI prompt engineering', color: '#FF5722' },
    { name: 'storytelling', description: 'Storytelling techniques', color: '#607D8B' },
    { name: 'character-development', description: 'Character development', color: '#8BC34A' },
    { name: 'grid', description: 'CSS Grid layout', color: '#1572B6' },
    { name: 'responsive', description: 'Responsive web design', color: '#FF4081' },
    { name: 'layout', description: 'Web layout design', color: '#00BCD4' },
    { name: 'design', description: 'User interface design', color: '#FFC107' },
    { name: 'composition-api', description: 'Vue Composition API', color: '#4FC08D' },
    { name: 'state-management', description: 'State management patterns', color: '#673AB7' },
    { name: 'middleware', description: 'Express middleware', color: '#000000' },
    { name: 'data-analysis', description: 'Data analysis techniques', color: '#3F51B5' },
    { name: 'model-training', description: 'ML model training', color: '#FF6F00' },
    { name: 'containerization', description: 'Application containerization', color: '#2496ED' },
    { name: 'deployment', description: 'Application deployment', color: '#4CAF50' },
    { name: 'infrastructure', description: 'IT infrastructure', color: '#9E9E9E' },
    { name: 'technical-writing', description: 'Technical writing skills', color: '#795548' },
    { name: 'documentation', description: 'Software documentation', color: '#607D8B' },
    { name: 'communication', description: 'Communication skills', color: '#FF9800' },
    { name: 'developer-tools', description: 'Developer tools and utilities', color: '#9C27B0' }
];

const seedDatabase = async () => {
    try {
        await connectDB();
        
        // Clear existing data
        console.log('🧹 Clearing existing data...');
        await Promise.all([
            User.deleteMany({}),
            Prompt.deleteMany({}),
            Comment.deleteMany({}),
            Tag.deleteMany({})
        ]);
        
        // Create users with hashed passwords
        console.log('👥 Creating users...');
        const hashedUsers = await Promise.all(
            sampleUsers.map(async (user) => ({
                ...user,
                password: await bcrypt.hash(user.password, 12)
            }))
        );
        
        const users = await User.create(hashedUsers);
        console.log(`✅ Created ${users.length} users`);
        
        // Create tags
        console.log('🏷️ Creating tags...');
        const tags = await Tag.create(sampleTags);
        console.log(`✅ Created ${tags.length} tags`);
        
        // Create prompts with random authors
        console.log('📝 Creating prompts...');
        const promptsWithAuthors = samplePrompts.map(prompt => ({
            ...prompt,
            author: users[Math.floor(Math.random() * users.length)]._id
        }));
        
        const prompts = await Prompt.create(promptsWithAuthors);
        console.log(`✅ Created ${prompts.length} prompts`);
        
        // Create comments
        console.log('💬 Creating comments...');
        const commentTexts = [
            "Great example! This really helped me understand the concept better.",
            "Thanks for sharing this. I've been looking for exactly this solution.",
            "Very comprehensive guide. The examples are particularly useful.",
            "This is a solid approach. I would also suggest adding error handling.",
            "Excellent work! The code is clean and well-documented.",
            "Perfect timing! I was just working on something similar.",
            "This saved me hours of research. Much appreciated!",
            "Clear and concise explanation. Love the practical examples.",
            "Great resource! I'll definitely be bookmarking this one.",
            "The step-by-step approach makes it easy to follow along.",
            "Nice implementation! Have you considered performance optimizations?",
            "This is exactly what I needed for my project. Thank you!",
            "Well written and easy to understand. Keep up the good work!",
            "I learned something new today. Thanks for the detailed explanation.",
            "Bookmarked for future reference. This will come in handy.",
            "Simple yet effective solution. I like the clean approach.",
            "Great tutorial! The examples really help clarify the concepts.",
            "This is going to save me so much time. Really appreciate it!",
            "Love the practical examples. Makes it much easier to understand.",
            "Outstanding work! This should be in the official documentation."
        ];
        
        const comments = [];
        for (let i = 0; i < prompts.length; i++) {
            const numComments = Math.floor(Math.random() * 8) + 3; // 3-10 comments per prompt
            
            for (let j = 0; j < numComments; j++) {
                const randomUser = users[Math.floor(Math.random() * users.length)];
                const randomText = commentTexts[Math.floor(Math.random() * commentTexts.length)];
                
                comments.push({
                    content: randomText,
                    author: randomUser._id,
                    prompt: prompts[i]._id,
                    likes: users.slice(0, Math.floor(Math.random() * 5)).map(u => u._id) // Random likes
                });
            }
        }
        
        const createdComments = await Comment.create(comments);
        console.log(`✅ Created ${createdComments.length} comments`);
        

        
        // Add likes to prompts
        console.log('👍 Adding likes to prompts...');
        for (let i = 0; i < prompts.length; i++) {
            const numLikes = Math.floor(Math.random() * 10) + 1; // 1-10 likes per prompt
            const shuffledUsers = users.sort(() => 0.5 - Math.random());
            const likes = shuffledUsers.slice(0, numLikes).map(u => u._id);
            
            await Prompt.findByIdAndUpdate(prompts[i]._id, { likes });
        }
        
        // Update tag usage counts
        console.log('📊 Updating tag usage counts...');
        const allTags = [...new Set(prompts.flatMap(p => p.tags))];
        
        for (const tagName of allTags) {
            const count = prompts.filter(p => p.tags.includes(tagName)).length;
            await Tag.findOneAndUpdate(
                { name: tagName },
                { $inc: { usageCount: count } }
            );
        }
        
        console.log('🎉 Database seeding completed successfully!');
        console.log('📊 Summary:');
        console.log(`   - Users: ${users.length}`);
        console.log(`   - Prompts: ${prompts.length}`);
        console.log(`   - Tags: ${tags.length}`);
        console.log(`   - Comments: ${createdComments.length}`);

        
    } catch (error) {
        console.error('❌ Database seeding failed:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
    }
};

// Run seeding
seedDatabase();
