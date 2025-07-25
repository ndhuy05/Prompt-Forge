<template>
  <div class="my-prompts">
    <div class="container">
      <div class="my-prompts-header">
        <h1>Your Prompts</h1>
        <p>Manage and share your AI prompts</p>
        <router-link to="/create-prompt" class="btn btn-primary">Post New Prompt</router-link>
      </div>

      <!-- Search and Filters -->
      <div class="search-section">
        <div class="search-bar">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search your prompts..."
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
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="likes">Most Liked</option>
            <option value="title">Title A-Z</option>
          </select>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Loading your prompts...</p>
      </div>

      <!-- Error State -->
      <div v-if="error" class="error">
        <p>{{ error }}</p>
        <button @click="fetchMyPrompts" class="btn btn-primary">Try Again</button>
      </div>

      <!-- Prompts List -->
      <div v-if="!loading && !error" class="prompts-grid">
        <div v-if="prompts.length === 0" class="no-results">
          <p>You haven't created any prompts yet.</p>
          <router-link to="/create-prompt" class="btn btn-primary">Create Your First Prompt</router-link>
        </div>
        
        <div v-for="prompt in prompts" :key="prompt._id" class="prompt-card" @click="viewPrompt(prompt._id)">
          <div class="prompt-header">
            <h3 class="prompt-title">{{ prompt.title }}</h3>
            <div class="prompt-status">
              <span class="prompt-category">{{ prompt.category }}</span>
              <span class="prompt-visibility">{{ prompt.isPublic ? 'Public' : 'Private' }}</span>
            </div>
          </div>
          
          <div class="prompt-content">
            <p class="prompt-description">{{ prompt.description }}</p>
            <div class="prompt-code" v-if="prompt.content">
              <pre><code>{{ prompt.content.substring(0, 200) }}{{ prompt.content.length > 200 ? '...' : '' }}</code></pre>
            </div>
          </div>
          
          <div class="prompt-footer">
            <div class="prompt-meta">
              <span class="stats">👍 {{ prompt.likes?.length || 0 }} likes</span>
              <span class="stats">💬 {{ prompt.commentsCount || 0 }} comments</span>
              <span class="date">{{ formatDate(prompt.createdAt) }}</span>
            </div>
            <div class="prompt-actions" @click.stop>
              <button @click="editPrompt(prompt._id)" class="btn-action btn-edit">
                ✏️ Edit
              </button>
              <button @click="deletePrompt(prompt._id)" class="btn-action btn-delete">
                🗑️ Delete
              </button>
              <button @click="sharePrompt(prompt._id)" class="btn-action btn-share">
                🔗 Share
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
  name: 'MyPrompts',
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
    this.fetchMyPrompts()
  },
  methods: {
    async fetchMyPrompts() {
      this.loading = true
      this.error = null
      
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          this.$router.push('/login')
          return
        }

        const params = {
          limit: 100,
          search: this.searchQuery,
          category: this.selectedCategory,
          sort: this.sortBy
        }
        
        const apiUrl = `${import.meta.env.VITE_API_URL}/prompts/my-prompts`
        console.log('Fetching from:', apiUrl)
        console.log('Params:', params)
        
        const response = await axios.get(apiUrl, { 
          params,
          headers: { Authorization: `Bearer ${token}` }
        })
        console.log('Response:', response)
        
        if (response.data.success) {
          this.prompts = response.data.data
        } else {
          this.error = 'Failed to fetch your prompts'
        }
      } catch (error) {
        console.error('Error fetching my prompts:', error)
        if (error.response?.status === 401) {
          this.$router.push('/login')
        } else {
          this.error = error.response?.data?.message || error.message || 'Failed to fetch your prompts'
        }
      } finally {
        this.loading = false
      }
    },
    
    async deletePrompt(promptId) {
      if (!confirm('Are you sure you want to delete this prompt?')) {
        return
      }
      
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          this.$router.push('/login')
          return
        }
        
        await axios.delete(`${import.meta.env.VITE_API_URL}/prompts/${promptId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        
        // Refresh prompts list
        this.fetchMyPrompts()
        alert('Prompt deleted successfully!')
      } catch (error) {
        console.error('Error deleting prompt:', error)
        alert('Failed to delete prompt')
      }
    },
    
    editPrompt(promptId) {
      this.$router.push(`/prompts/${promptId}/edit`)
    },
    
    viewPrompt(promptId) {
      this.$router.push(`/prompts/${promptId}`)
    },
    
    sharePrompt(promptId) {
      const shareUrl = `${window.location.origin}/prompt/${promptId}`
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert('Prompt URL copied to clipboard!')
      }).catch(() => {
        alert(`Share this prompt: ${shareUrl}`)
      })
    },
    
    searchPrompts() {
      this.fetchMyPrompts()
    },
    
    filterPrompts() {
      this.fetchMyPrompts()
    },
    
    sortPrompts() {
      this.fetchMyPrompts()
    },
    
    formatDate(date) {
      return new Date(date).toLocaleDateString()
    }
  }
}
</script>

<style scoped>
.my-prompts {
  padding: 2rem 0;
  min-height: 100vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.my-prompts-header {
  text-align: center;
  margin-bottom: 3rem;
}

.my-prompts-header h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.my-prompts-header p {
  font-size: 1.2rem;
  color: #7f8c8d;
  margin-bottom: 2rem;
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

.prompt-status {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.prompt-category {
  background: #3498db;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.prompt-visibility {
  background: #27ae60;
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

.stats {
  font-size: 0.875rem;
  color: #7f8c8d;
}

.date {
  font-size: 0.875rem;
  color: #7f8c8d;
}

.prompt-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-action {
  padding: 0.5rem 1rem;
  border: 1px solid #e1e8ed;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.btn-action:hover {
  background: #f8f9fa;
}

.btn-edit:hover {
  background: #e3f2fd;
  border-color: #2196f3;
}

.btn-delete:hover {
  background: #ffebee;
  border-color: #f44336;
}

.btn-share:hover {
  background: #e8f5e8;
  border-color: #4caf50;
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
  
  .prompt-actions {
    flex-wrap: wrap;
  }
}
</style>
