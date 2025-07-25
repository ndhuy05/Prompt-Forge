<template>
  <div class="edit-prompt">
    <div class="container">
      <div class="edit-prompt-header">
        <h1>Edit Prompt</h1>
        <p>Update your AI prompt</p>
      </div>

      <!-- Loading State -->
      <div v-if="loadingPrompt" class="loading">
        <div class="spinner"></div>
        <p>Loading prompt...</p>
      </div>

      <!-- Error State -->
      <div v-if="loadError" class="error-state">
        <h2>Error</h2>
        <p>{{ loadError }}</p>
        <router-link to="/my-prompts" class="btn btn-primary">Back to My Prompts</router-link>
      </div>

      <!-- Edit Form -->
      <div v-if="!loadingPrompt && !loadError" class="edit-prompt-form">
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="title" class="form-label">Title *</label>
            <input
              id="title"
              v-model="form.title"
              type="text"
              class="form-input"
              placeholder="Enter a descriptive title for your prompt"
              required
            >
          </div>

          <div class="form-group">
            <div class="description-header">
              <label for="description" class="form-label">
                Description *
                <span class="auto-generate-hint">(Can be auto-generated or manually edited)</span>
              </label>
              <button
                type="button"
                class="btn btn-generate"
                @click="generateDescription"
                :disabled="!form.content.trim() || generatingDescription"
              >
                <span v-if="generatingDescription">
                  <div class="spinner-tiny"></div>
                  Generating...
                </span>
                <span v-else>🤖 Auto-Generate</span>
              </button>
            </div>
            <textarea
              id="description"
              v-model="form.description"
              class="form-textarea"
              placeholder="Describe what this prompt does and how to use it, or click 'Auto-Generate' to create automatically"
              rows="3"
              required
            ></textarea>
          </div>

          <div class="form-group">
            <label for="content" class="form-label">Prompt Content *</label>
            <textarea
              id="content"
              v-model="form.content"
              class="form-textarea code-input"
              placeholder="Enter your prompt here..."
              rows="8"
              required
            ></textarea>
          </div>

          <div class="form-group">
            <label for="category" class="form-label">Category *</label>
            <select
              id="category"
              v-model="form.category"
              class="form-select"
              required
            >
              <option value="">Select a category</option>
              <option value="coding">Coding</option>
              <option value="writing">Writing</option>
              <option value="analysis">Analysis</option>
              <option value="creative">Creative</option>
              <option value="learning">Learning</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div class="form-group">
            <label for="tags" class="form-label">Tags</label>
            <input
              id="tags"
              v-model="tagsInput"
              type="text"
              class="form-input"
              placeholder="Enter tags separated by commas (e.g., react, hooks, frontend)"
              @blur="processTags"
            >
            <div v-if="form.tags.length > 0" class="tags-preview">
              <span
                v-for="tag in form.tags"
                :key="tag"
                class="tag"
                @click="removeTag(tag)"
              >
                {{ tag }} ×
              </span>
            </div>
          </div>

          <!-- Error message -->
          <div v-if="error" class="error-message">
            {{ error }}
          </div>

          <!-- Success message -->
          <div v-if="successMessage" class="success-message">
            {{ successMessage }}
          </div>

          <div class="form-actions">
            <router-link to="/my-prompts" class="btn btn-secondary">
              Cancel
            </router-link>
            <button type="submit" class="btn btn-primary" :disabled="loading">
              {{ loading ? 'Updating...' : 'Update Prompt' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'EditPrompt',
  data() {
    return {
      promptId: null,
      form: {
        title: '',
        description: '',
        content: '',
        category: '',
        tags: []
      },
      tagsInput: '',
      loading: false,
      loadingPrompt: true,
      generatingDescription: false,
      error: null,
      loadError: null,
      successMessage: null
    }
  },
  async mounted() {
    this.promptId = this.$route.params.id
    await this.loadPrompt()
  },
  methods: {
    async loadPrompt() {
      try {
        this.loadingPrompt = true
        this.loadError = null

        const token = localStorage.getItem('token')
        if (!token) {
          this.$router.push('/login')
          return
        }

        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/prompts/${this.promptId}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )

        if (response.data.success) {
          const prompt = response.data.data
          
          // Populate form with existing data
          this.form.title = prompt.title || ''
          this.form.description = prompt.description || ''
          this.form.content = prompt.content || ''
          this.form.category = prompt.category || ''
          this.form.tags = prompt.tags ? prompt.tags.map(tag => typeof tag === 'object' ? tag.name : tag) : []
          this.tagsInput = this.form.tags.join(', ')
        } else {
          this.loadError = response.data.message || 'Failed to load prompt'
        }
      } catch (error) {
        console.error('Error loading prompt:', error)
        if (error.response?.status === 404) {
          this.loadError = 'Prompt not found'
        } else if (error.response?.status === 403) {
          this.loadError = 'You are not authorized to edit this prompt'
        } else {
          this.loadError = error.response?.data?.message || 'Failed to load prompt'
        }
      } finally {
        this.loadingPrompt = false
      }
    },

    processTags() {
      if (this.tagsInput.trim()) {
        const tags = this.tagsInput
          .split(',')
          .map(tag => tag.trim().toLowerCase())
          .filter(tag => tag.length > 0 && !this.form.tags.includes(tag))
        
        this.form.tags = [...this.form.tags, ...tags]
        this.tagsInput = ''
      }
    },
    
    removeTag(tagToRemove) {
      this.form.tags = this.form.tags.filter(tag => tag !== tagToRemove)
    },
    
    async generateDescription() {
      if (!this.form.content.trim()) {
        this.error = 'Please enter prompt content first'
        return
      }
      
      this.generatingDescription = true
      this.error = null
      
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          this.$router.push('/login')
          return
        }
        
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/prompts/generate-description`,
          { content: this.form.content },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )
        
        if (response.data.success) {
          this.form.description = response.data.data.description
          
          // Show success message with info about fallback
          if (response.data.data.fallback) {
            this.showNotification('Description generated using keyword analysis. Feel free to edit!', 'info')
          } else {
            this.showNotification('Description generated using AI! You can edit it if needed.', 'success')
          }
          
          // Focus the textarea to indicate it's editable
          this.$nextTick(() => {
            const textarea = document.getElementById('description')
            if (textarea) {
              textarea.focus()
              textarea.setSelectionRange(textarea.value.length, textarea.value.length)
            }
          })
        } else {
          this.error = response.data.message || 'Failed to generate description'
        }
      } catch (error) {
        console.error('Error generating description:', error)
        this.error = error.response?.data?.message || 'Failed to generate description'
      } finally {
        this.generatingDescription = false
      }
    },
    
    showNotification(message, type = 'success') {
      const notification = document.createElement('div')
      notification.className = `notification ${type}-notification`
      notification.innerHTML = `
        <div class="notification-content">
          <span class="notification-icon">
            ${type === 'success' ? '✅' : type === 'info' ? 'ℹ️' : '⚠️'}
          </span>
          <span class="notification-message">${message}</span>
        </div>
      `
      
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#d4edda' : type === 'info' ? '#d1ecf1' : '#fff3cd'};
        color: ${type === 'success' ? '#155724' : type === 'info' ? '#0c5460' : '#856404'};
        border: 1px solid ${type === 'success' ? '#c3e6cb' : type === 'info' ? '#bee5eb' : '#ffeaa7'};
        border-radius: 8px;
        padding: 12px 16px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        max-width: 400px;
        animation: slideIn 0.3s ease-out;
      `
      
      document.body.appendChild(notification)
      
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove()
        }
      }, 3000)
    },
    
    async handleSubmit() {
      this.loading = true
      this.error = null
      this.successMessage = null
      
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          this.$router.push('/login')
          return
        }
        
        const response = await axios.put(
          `${import.meta.env.VITE_API_URL}/prompts/${this.promptId}`,
          this.form,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )
        
        if (response.data.success) {
          this.successMessage = 'Prompt updated successfully!'
          
          // Show success notification
          this.showNotification('Prompt updated successfully! 🎉', 'success')
          
          // Redirect after a short delay
          setTimeout(() => {
            this.$router.push('/my-prompts')
          }, 1500)
        } else {
          this.error = response.data.message
        }
      } catch (error) {
        console.error('Error updating prompt:', error)
        
        // Handle validation errors
        if (error.response?.data?.errors) {
          const errors = error.response.data.errors;
          if (Array.isArray(errors)) {
            this.error = errors.map(err => 
              typeof err === 'string' ? err : err.message || JSON.stringify(err)
            ).join(', ');
          } else {
            this.error = errors.toString();
          }
        } else if (error.response?.status === 403) {
          this.error = 'You are not authorized to edit this prompt'
        } else if (error.response?.status === 404) {
          this.error = 'Prompt not found'
        } else {
          this.error = error.response?.data?.message || 'Failed to update prompt'
        }
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.edit-prompt {
  padding: 2rem 0;
  min-height: 100vh;
  background: #f8f9fa;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1rem;
}

.edit-prompt-header {
  text-align: center;
  margin-bottom: 3rem;
}

.edit-prompt-header h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.edit-prompt-header p {
  font-size: 1.2rem;
  color: #7f8c8d;
}

.loading, .error-state {
  text-align: center;
  padding: 60px 20px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.edit-prompt-form {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #2c3e50;
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: #3498db;
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.code-input {
  font-family: 'Fira Code', monospace;
  background: #f8f9fa;
}

.auto-generate-hint {
  font-size: 0.8rem;
  color: #7f8c8d;
  font-weight: normal;
  margin-left: 0.5rem;
}

.description-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 0.5rem;
  gap: 1rem;
}

.description-header .form-label {
  margin-bottom: 0;
  flex: 1;
}

.btn-generate {
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  height: fit-content;
}

.btn-generate:hover:not(:disabled) {
  background: #5a6fd8;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.btn-generate:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.spinner-tiny {
  width: 12px;
  height: 12px;
  border: 1px solid #f3f3f3;
  border-top: 1px solid #ffffff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  display: inline-block;
}

.tags-preview {
  margin-top: 0.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  background: #3498db;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background 0.2s;
}

.tag:hover {
  background: #2980b9;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e1e8ed;
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

.btn-primary:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.btn-secondary {
  background: #95a5a6;
  color: white;
}

.btn-secondary:hover {
  background: #7f8c8d;
}

.error-message {
  background: #ffebee;
  color: #c62828;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  border: 1px solid #ef5350;
}

.success-message {
  background: #e8f5e8;
  color: #2e7d32;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  border: 1px solid #4caf50;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.notification-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .description-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .btn-generate {
    align-self: flex-end;
    margin-top: 0.5rem;
  }
}
</style> 