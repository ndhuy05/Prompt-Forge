<template>
  <div class="prompts">
    <div class="container">
      <div class="prompts-header">
        <h1>Browse Prompts</h1>
        <p>Discover and share AI prompts with the community</p>
      </div>

      <!-- Search and Filters -->
      <div class="search-section">
        <div class="search-bar">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search prompts..."
            class="search-input"
            @input="searchPrompts"
          >
        </div>
        <div class="filters">
          <select v-model="selectedCategory" @change="filterPrompts" class="filter-select">
            <option value="">All Categories</option>
            <option value="coding">Coding</option>
            <option value="writing">Writing</option>
            <option value="analysis">Analysis</option>
            <option value="creative">Creative</option>
            <option value="learning">Learning</option>
            <option value="other">Other</option>
          </select>
          <select v-model="sortBy" @change="sortPrompts" class="filter-select">
            <option value="newest">Newest First</option>
            <option value="likes">Most Liked</option>
          </select>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Loading prompts...</p>
      </div>

      <!-- Error State -->
      <div v-if="error" class="error">
        <p>{{ error }}</p>
        <button @click="fetchPrompts" class="btn btn-primary">Try Again</button>
      </div>

      <!-- Prompts List -->
      <div v-if="!loading && !error" class="prompts-grid">
        <div v-if="prompts.length === 0" class="no-results">
          <p>No prompts found.</p>
          <router-link to="/dashboard" class="btn btn-primary">Create Your First Prompt</router-link>
        </div>
        
        <div v-for="prompt in prompts" :key="prompt._id" class="prompt-card" @click="viewPrompt(prompt._id)">
          <div class="prompt-header">
            <h3 class="prompt-title">{{ prompt.title }}</h3>
            <span class="prompt-category">{{ prompt.category }}</span>
          </div>
          
          <div class="prompt-content">
            <p class="prompt-description">{{ prompt.description }}</p>
            <div class="prompt-code" v-if="prompt.content">
              <pre><code>{{ prompt.content.substring(0, 200) }}{{ prompt.content.length > 200 ? '...' : '' }}</code></pre>
            </div>
          </div>
          
          <div class="prompt-footer">
            <div class="prompt-meta">
              <span class="author">By {{ prompt.author?.username || 'Unknown' }}</span>
              <span class="date">{{ formatDate(prompt.createdAt) }}</span>
            </div>
            <div class="prompt-actions" @click.stop>
              <button @click="likePrompt(prompt._id)" class="btn-like" :class="{ liked: prompt.isLiked }">
                👍 {{ prompt.likesCount || prompt.likes?.length || 0 }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'Prompts',
  data() {
    return {
      prompts: [],
      loading: false,
      error: null,
      searchQuery: '',
      selectedCategory: '',
      sortBy: 'newest'
    }
  },
  mounted() {
    this.fetchPrompts()
  },
  methods: {
    async fetchPrompts() {
      this.loading = true
      this.error = null
      
      try {
        const params = {
          limit: 100,
          search: this.searchQuery,
          category: this.selectedCategory,
          sort: this.sortBy
        }
        
        const apiUrl = `${import.meta.env.VITE_API_URL}/prompts`
        console.log('Fetching from:', apiUrl)
        console.log('Params:', params)
        
        const response = await axios.get(apiUrl, { params })
        console.log('Response:', response)
        
        if (response.data.success) {
          this.prompts = response.data.data
          console.log(`Fetched ${this.prompts.length} prompts with sort: ${this.sortBy}`)
          
          // Debug first few prompts to verify sorting
          if (this.prompts.length > 0) {
            console.log('First 3 prompts:')
            this.prompts.slice(0, 3).forEach((prompt, index) => {
              console.log(`${index + 1}. "${prompt.title}" - Likes: ${prompt.likesCount || 0}, Created: ${prompt.createdAt}`)
            })
          }
        } else {
          this.error = 'Failed to fetch prompts'
        }
      } catch (error) {
        console.error('Error fetching prompts:', error)
        console.error('API URL:', `${import.meta.env.VITE_API_URL}/prompts`)
        console.error('Error response:', error.response)
        this.error = error.response?.data?.message || error.message || 'Failed to fetch prompts'
      } finally {
        this.loading = false
      }
    },
    
    async likePrompt(promptId) {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          this.$router.push('/login')
          return
        }
        
        await axios.post(`${import.meta.env.VITE_API_URL}/prompts/${promptId}/like`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        })
        
        // Refresh prompts to show updated likes
        this.fetchPrompts()
      } catch (error) {
        if (error.response?.status === 401) {
          this.$router.push('/login')
        }
      }
    },
    
    viewPrompt(promptId) {
      this.$router.push(`/prompts/${promptId}`)
    },
    
    
    searchPrompts() {
      this.fetchPrompts()
    },
    
    filterPrompts() {
      this.fetchPrompts()
    },
    
    sortPrompts() {
      this.fetchPrompts()
    },
    
    formatDate(date) {
      return new Date(date).toLocaleDateString()
    },
    
    getSortLabel(sortValue) {
      switch (sortValue) {
        case 'newest':
          return '📅 Newest First'
        case 'likes':
          return '👍 Most Liked'
        default:
          return '📅 Newest First'
      }
    }
  }
}
</script>

<style scoped>
.prompts {
  padding: 2rem 0;
  min-height: 100vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.prompts-header {
  text-align: center;
  margin-bottom: 3rem;
}

.prompts-header h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.prompts-header p {
  font-size: 1.2rem;
  color: #7f8c8d;
}

.search-section {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.search-bar {
  flex: 1;
  min-width: 300px;
}

.search-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  font-size: 1rem;
}

.search-input:focus {
  outline: none;
  border-color: #3498db;
}

.filters {
  display: flex;
  gap: 1rem;
}

.filter-select {
  padding: 0.75rem;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
}

.sort-status {
  margin-bottom: 1rem;
  padding: 0.75rem 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #3498db;
}

.sort-indicator {
  color: #2c3e50;
  font-size: 0.9rem;
}

.category-filter, .search-filter {
  color: #7f8c8d;
  font-style: italic;
  margin-left: 0.5rem;
}

.loading {
  text-align: center;
  padding: 3rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error {
  text-align: center;
  padding: 3rem;
  color: #e74c3c;
}

.no-results {
  text-align: center;
  padding: 3rem;
  color: #7f8c8d;
}

.prompts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.prompt-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.prompt-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.prompt-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.prompt-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
  flex: 1;
}

.prompt-category {
  background: #3498db;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.prompt-content {
  margin-bottom: 1rem;
}

.prompt-description {
  color: #7f8c8d;
  margin-bottom: 1rem;
  line-height: 1.6;
}

.prompt-code {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 1rem;
  overflow-x: auto;
}

.prompt-code pre {
  margin: 0;
  font-family: 'Fira Code', monospace;
  font-size: 0.875rem;
  line-height: 1.4;
}

.prompt-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #e1e8ed;
}

.prompt-meta {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.author {
  font-weight: 500;
  color: #2c3e50;
}

.date {
  font-size: 0.875rem;
  color: #7f8c8d;
}

.prompt-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-like {
  padding: 0.5rem 1rem;
  border: 1px solid #e1e8ed;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-like:hover {
  background: #f8f9fa;
}

.btn-like.liked {
  background: #3498db;
  color: white;
  border-color: #3498db;
}



@media (max-width: 768px) {
  .prompts-grid {
    grid-template-columns: 1fr;
  }
  
  .search-section {
    flex-direction: column;
  }
  
  .prompt-footer {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  display: inline-block;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover {
  background: #2980b9;
}
</style>
