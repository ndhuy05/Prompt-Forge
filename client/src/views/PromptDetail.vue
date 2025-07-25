<template>
<div class="prompt-detail">
    <div class="container">
    <!-- Loading State -->
    <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Loading prompt...</p>
    </div>

    <!-- Error State -->
    <div v-if="error" class="error">
        <h2>Error</h2>
        <p>{{ error }}</p>
        <router-link to="/prompts" class="btn btn-primary">Back to Prompts</router-link>
    </div>

    <!-- Prompt Content -->
    <div v-if="prompt && !loading && !error" class="prompt-content">
        <!-- Prompt Header -->
        <div class="prompt-header">
        <div class="prompt-meta">
            <span class="prompt-category">{{ prompt.category }}</span>
            <!-- <span class="prompt-visibility">{{ prompt.isPublic ? 'Public' : 'Private' }}</span> -->
        </div>
        <h1 class="prompt-title">{{ prompt.title }}</h1>
        
        <!-- Prompt Description -->
        <div class="prompt-description">
            <p v-if="prompt.description && prompt.description.trim()">
                {{ prompt.description }}
            </p>
            <p v-else class="no-description">
                No description provided for this prompt.
            </p>
        </div>
        </div>

        <!-- Author Info -->
        <div class="author-section">
        <div class="author-info">
            <img :src="getAuthorAvatar(prompt.author)" alt="Author" class="author-avatar">
            <div class="author-details">
            <h3>{{ prompt.author?.username || 'Unknown' }}</h3>
            <p>{{ formatDate(prompt.createdAt) }}</p>
            </div>
        </div>
        <div class="prompt-stats">
            <span class="stat">👍 {{ prompt.likes?.length || 0 }} likes</span>
            <span class="stat">💬 {{ prompt.commentsCount || 0 }} comments</span>

        </div>
        </div>

        <!-- Prompt Code/Content -->
        <div class="code-section">
        <div class="code-header">
            <h3>Prompt Content</h3>
            <button @click="copyToClipboard" class="btn btn-secondary">
            📋 Copy
            </button>
        </div>
        <div class="code-container">
            <pre><code>{{ prompt.content }}</code></pre>
        </div>
        </div>

        <!-- Tags -->
        <div v-if="prompt.tags && prompt.tags.length > 0" class="tags-section">
        <h3>Tags</h3>
        <div class="tags">
            <span v-for="tag in prompt.tags" :key="tag._id" class="tag">
            {{ tag.name }}
            </span>
        </div>
        </div>

        <!-- Actions -->
        <div class="prompt-actions">
        <!-- Edit button - only show for prompt author -->
        <button v-if="prompt.canEdit" @click="editPrompt" class="btn btn-action btn-edit">
            ✏️ Edit Prompt
        </button>
        <button @click="toggleLike" class="btn btn-action" :class="{ 'liked': isLiked }">
            👍 {{ isLiked ? 'Liked' : 'Like' }} ({{ prompt.likes?.length || 0 }})
        </button>

        <button @click="sharePrompt" class="btn btn-action">
            🔗 Share
        </button>
        </div>

        <!-- Comments Section -->
        <div class="comments-section">
        <h3>Comments ({{ comments.length }})</h3>
        
        <!-- Add Comment (if authenticated) -->
        <div v-if="isAuthenticated" class="add-comment">
            <div class="comment-form">
                <div class="comment-user-info">
                    <img :src="getAuthorAvatar(user)" alt="Your Avatar" class="comment-user-avatar">
                    <span class="comment-user-name">{{ user?.username || 'You' }}</span>
                </div>
                <textarea 
                    v-model="newComment" 
                    placeholder="Share your thoughts about this prompt..."
                    class="comment-input"
                    rows="4"
                    @keydown.ctrl.enter="addComment"
                    :disabled="addingComment"
                ></textarea>
                <div class="comment-actions">
                    <div class="comment-info">
                        <span class="char-count" :class="{ 'warning': newComment.length > 800 }">
                            {{ newComment.length }}/1000
                        </span>
                        <span class="shortcut-hint">Ctrl+Enter to post</span>
                    </div>
                    <div class="comment-buttons">
                        <button 
                            @click="cancelComment" 
                            class="btn btn-secondary btn-sm"
                            v-if="newComment.trim()"
                        >
                            Cancel
                        </button>
                        <button 
                            @click="addComment" 
                            class="btn btn-primary btn-sm" 
                            :disabled="!newComment.trim() || addingComment || newComment.length > 1000"
                        >
                            <span v-if="addingComment">
                                <div class="spinner-tiny"></div>
                                Posting...
                            </span>
                            <span v-else>💬 Post Comment</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Login prompt for non-authenticated users -->
        <div v-else class="login-prompt">
            <p>💬 Want to join the discussion?</p>
            <router-link to="/login" class="btn btn-primary">Login to Comment</router-link>
        </div>

        <!-- Comments List -->
        <div class="comments-list">
            <div v-for="comment in comments" :key="comment._id" class="comment">
            <div class="comment-author">
                <img :src="getAuthorAvatar(comment.author)" alt="Author" class="comment-avatar">
                <div class="comment-meta">
                <h4>{{ comment.author?.username || 'Unknown' }}</h4>
                <span class="comment-date">{{ formatDate(comment.createdAt) }}</span>
                </div>
            </div>
            <p class="comment-content">{{ comment.content }}</p>
            </div>
            
            <div v-if="comments.length === 0" class="no-comments">
            <p>No comments yet. Be the first to comment!</p>
            </div>
        </div>
        </div>

        <!-- Similar Prompts Section -->
        <div class="similar-prompts-section">
        <h3>
            🔍 Similar Prompts 
            <span v-if="loadingSimilar" class="loading-badge">Loading...</span>
        </h3>
        
        <div v-if="loadingSimilar" class="loading-similar">
            <div class="spinner-small"></div>
            <p>Finding similar prompts using AI...</p>
        </div>

        <div v-if="similarPrompts.length > 0" class="similar-prompts-grid">
            <div 
            v-for="(similarPrompt, index) in similarPrompts" 
            :key="similarPrompt._id" 
            class="similar-prompt-card"
            @click="navigateToPrompt(similarPrompt._id)"
            :style="{ animationDelay: `${index * 0.1}s` }"
            >
            <div class="similar-prompt-header">
                <h4 class="similar-prompt-title">{{ similarPrompt.title }}</h4>
                <span class="similar-prompt-category">{{ similarPrompt.category }}</span>
            </div>
            
            <p class="similar-prompt-description">
                {{ similarPrompt.description || 'No description available' }}
            </p>
            
            <div class="similar-prompt-footer">
                <div class="similar-prompt-author">
                <img :src="getAuthorAvatar(similarPrompt.author)" alt="Author" class="similar-author-avatar">
                <span>{{ similarPrompt.author?.username || 'Unknown' }}</span>
                </div>
                <div class="similar-prompt-stats">
                <span>👍 {{ similarPrompt.likes?.length || 0 }}</span>
                <span>💬 {{ similarPrompt.commentsCount || 0 }}</span>
                </div>
            </div>
            
            <!-- Similarity score indicator -->
            <div v-if="similarPrompt.similarity" class="similarity-indicator">
                <div class="similarity-bar">
                <div class="similarity-fill" :style="{ width: `${(similarPrompt.similarity * 100)}%` }"></div>
                </div>
                <span class="similarity-text">{{ Math.round(similarPrompt.similarity * 100) }}% match</span>
            </div>
            </div>
        </div>

        <div v-if="!loadingSimilar && similarPrompts.length === 0" class="no-similar-prompts">
            <p>🤖 No similar prompts found. This prompt is quite unique!</p>
        </div>
        </div>
    </div>
    </div>
</div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getUser, isAuthenticated as checkAuth } from '@/api/authAPI'
import axios from 'axios'

const route = useRoute()
const router = useRouter()

const prompt = ref(null)
const comments = ref([])
const similarPrompts = ref([])
const loading = ref(true)
const loadingSimilar = ref(false)
const addingComment = ref(false)
const error = ref(null)
const newComment = ref('')

const user = computed(() => getUser())
const isAuthenticated = computed(() => checkAuth())

const isLiked = computed(() => {
if (!prompt.value || !user.value) return false
return prompt.value.likes?.some(like => like.user === user.value._id)
})





onMounted(() => {
fetchPromptDetail()
fetchComments()
fetchSimilarPrompts()
})

const fetchPromptDetail = async () => {
try {
    loading.value = true
    const API_URL = import.meta.env.VITE_API_URL
    const response = await axios.get(`${API_URL}/prompts/${route.params.id}`)
    
    if (response.data.success) {
    prompt.value = response.data.data
    } else {
    throw new Error(response.data.message || 'Failed to fetch prompt')
    }
} catch (err) {
    console.error('Error fetching prompt:', err)
    error.value = err.response?.data?.message || err.message || 'Failed to load prompt'
} finally {
    loading.value = false
}
}

const fetchComments = async () => {
try {
    const API_URL = import.meta.env.VITE_API_URL
    console.log('Fetching comments from:', `${API_URL}/comments/prompt/${route.params.id}`)
    
    const response = await axios.get(`${API_URL}/comments/prompt/${route.params.id}`)
    
    console.log('Comments response:', response.data)
    
    if (response.data.success) {
        comments.value = response.data.data
        console.log('Comments set to:', comments.value)
    }
} catch (err) {
    console.error('Error fetching comments:', err)
    console.error('Error response:', err.response?.data)
}
}

const fetchSimilarPrompts = async () => {
try {
    loadingSimilar.value = true
    const API_URL = import.meta.env.VITE_API_URL
    const response = await axios.get(`${API_URL}/prompts/${route.params.id}/similar?limit=6`)
    
    if (response.data.success) {
    similarPrompts.value = response.data.data
    }
} catch (err) {
    console.error('Error fetching similar prompts:', err)
} finally {
    loadingSimilar.value = false
}
}

const goBack = () => {
router.go(-1)
}

const getAuthorAvatar = (author) => {
const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000'
if (author?.avatar) {
    return author.avatar.startsWith('/') 
    ? `${serverUrl}${author.avatar}`
    : author.avatar
}
return `${serverUrl}/images/default-avatar.svg`
}

const formatDate = (dateString) => {
return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
})
}

const copyToClipboard = async () => {
try {
    await navigator.clipboard.writeText(prompt.value.content)
    alert('Prompt content copied to clipboard!')
} catch (err) {
    console.error('Failed to copy to clipboard:', err)
}
}

const toggleLike = async () => {
const token = localStorage.getItem('token')
if (!token) {
    router.push('/login')
    return
}

try {
    const API_URL = import.meta.env.VITE_API_URL
    
    await axios.post(
    `${API_URL}/prompts/${prompt.value._id}/like`,
    {},
    {
        headers: {
        Authorization: `Bearer ${token}`
        }
    }
    )

    // Refresh prompt data to get updated likes
    await fetchPromptDetail()
} catch (err) {
    if (err.response?.status === 401) {
    router.push('/login')
    }
}
}



const sharePrompt = () => {
const url = window.location.href
navigator.clipboard.writeText(url).then(() => {
    alert('Prompt URL copied to clipboard!')
}).catch(() => {
    alert(`Share this prompt: ${url}`)
})
}

const addComment = async () => {
    if (!isAuthenticated.value) {
        showSuccessMessage('Please log in to comment', 'warning')
        router.push('/login')
        return
    }

    if (!newComment.value.trim()) {
        showSuccessMessage('Please write a comment before posting', 'warning')
        return
    }

    if (newComment.value.length > 1000) {
        showSuccessMessage('Comment is too long (max 1000 characters)', 'error')
        return
    }

    try {
        addingComment.value = true
        const API_URL = import.meta.env.VITE_API_URL
        const token = localStorage.getItem('token')
        
        if (!token) {
            showSuccessMessage('Please log in to comment', 'warning')
            router.push('/login')
            return
        }
        
        const response = await axios.post(
            `${API_URL}/comments`,
            {
                prompt: prompt.value._id,  // Ensure this matches backend expectation
                content: newComment.value.trim()
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        )

        if (response.data.success) {
            // Show success message with backend response
            showSuccessMessage(response.data.message || 'Comment posted successfully! 🎉', 'success')
            
            // Clear the comment input
            newComment.value = ''
            
            // Add new comment to the beginning of the list for immediate feedback
            if (response.data.data) {
                comments.value.unshift(response.data.data)
            }
            
            // Refresh comments and prompt data after a brief delay
            setTimeout(async () => {
                await fetchComments()
                await fetchPromptDetail()
            }, 500)
            
        } else {
            throw new Error(response.data.message || 'Failed to post comment')
        }
    } catch (err) {
        console.error('Error adding comment:', err)
        
        // Handle specific error cases with better UX
        if (err.response?.status === 401) {
            showSuccessMessage('Session expired. Please log in again.', 'warning')
            localStorage.removeItem('token')
            router.push('/login')
        } else if (err.response?.status === 404) {
            showSuccessMessage('Prompt not found', 'error')
            router.push('/prompts')
        } else if (err.response?.status === 400) {
            const errorMessage = err.response?.data?.message || 'Invalid comment data'
            showSuccessMessage(errorMessage, 'error')
        } else if (err.response?.data?.errors) {
            const errors = Array.isArray(err.response.data.errors) 
                ? err.response.data.errors.join(', ')
                : err.response.data.errors
            showSuccessMessage(`Validation error: ${errors}`, 'error')
        } else if (err.response?.status >= 500) {
            showSuccessMessage('Server error. Please try again later.', 'error')
        } else {
            showSuccessMessage(err.response?.data?.message || 'Network error. Please check your connection.', 'error')
        }
    } finally {
        addingComment.value = false
    }
}

const cancelComment = () => {
    newComment.value = ''
}

const showSuccessMessage = (message, type = 'success') => {
    // Enhanced notification system with different message types
    const notification = document.createElement('div')
    notification.className = `notification ${type}-notification`
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">
                ${type === 'success' ? '✅' : type === 'warning' ? '⚠️' : type === 'error' ? '❌' : 'ℹ️'}
            </span>
            <span class="notification-message">${message}</span>
        </div>
    `
    
    // Add styles dynamically
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#d4edda' : type === 'warning' ? '#fff3cd' : type === 'error' ? '#f8d7da' : '#d1ecf1'};
        color: ${type === 'success' ? '#155724' : type === 'warning' ? '#856404' : type === 'error' ? '#721c24' : '#0c5460'};
        border: 1px solid ${type === 'success' ? '#c3e6cb' : type === 'warning' ? '#ffeaa7' : type === 'error' ? '#f5c6cb' : '#bee5eb'};
        border-radius: 8px;
        padding: 12px 16px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        max-width: 400px;
        animation: slideIn 0.3s ease-out;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `
    
    // Add animation keyframes
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style')
        style.id = 'notification-styles'
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            .notification-content {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .notification-icon {
                font-size: 16px;
            }
            .notification-message {
                font-size: 14px;
                font-weight: 500;
            }
        `
        document.head.appendChild(style)
    }
    
    document.body.appendChild(notification)
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideIn 0.3s ease-out reverse'
            setTimeout(() => notification.remove(), 300)
        }
    }, 4000)
    
    // Allow manual dismiss by clicking
    notification.addEventListener('click', () => {
        notification.style.animation = 'slideIn 0.3s ease-out reverse'
        setTimeout(() => notification.remove(), 300)
    })
}

const navigateToPrompt = (promptId) => {
router.push(`/prompts/${promptId}`)
}

const editPrompt = () => {
router.push(`/prompts/${prompt.value._id}/edit`)
}
</script>

<style scoped>
.prompt-detail {
padding: 40px 0;
min-height: calc(100vh - 140px);
}

.container {
max-width: 800px;
margin: 0 auto;
padding: 0 20px;
}

.loading, .error {
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

.back-navigation {
margin-bottom: 30px;
}

.prompt-header {
margin-bottom: 40px;
}

.prompt-meta {
display: flex;
gap: 10px;
margin-bottom: 15px;
}

.prompt-category, .prompt-visibility {
padding: 4px 12px;
border-radius: 20px;
font-size: 0.8rem;
font-weight: 500;
}

.prompt-category {
background: #667eea;
color: white;
}

.prompt-visibility {
background: #f8f9fa;
color: #6c757d;
border: 1px solid #dee2e6;
}

.prompt-title {
font-size: 2.5rem;
font-weight: 700;
color: #2c3e50;
margin-bottom: 15px;
line-height: 1.2;
}

.prompt-description {
font-size: 1.1rem;
color: #6c757d;
line-height: 1.6;
margin-bottom: 20px;
}

.prompt-description p {
margin: 0;
font-style: italic;
}

.prompt-description .no-description {
opacity: 0.7;
font-size: 1rem;
color: #adb5bd;
}

.author-section {
display: flex;
justify-content: space-between;
align-items: center;
padding: 20px;
background: #f8f9fa;
border-radius: 10px;
margin-bottom: 30px;
}

.author-info {
display: flex;
align-items: center;
gap: 15px;
}

.author-avatar {
width: 50px;
height: 50px;
border-radius: 50%;
object-fit: cover;
}

.author-details h3 {
margin: 0;
font-size: 1.1rem;
color: #2c3e50;
}

.author-details p {
margin: 5px 0 0;
color: #6c757d;
font-size: 0.9rem;
}

.prompt-stats {
display: flex;
gap: 20px;
}

.stat {
color: #6c757d;
font-size: 0.9rem;
}

.code-section {
margin-bottom: 40px;
}

.code-header {
display: flex;
justify-content: space-between;
align-items: center;
margin-bottom: 15px;
}

.code-header h3 {
margin: 0;
color: #2c3e50;
}

.code-container {
background: #f8f9fa;
border: 1px solid #dee2e6;
border-radius: 8px;
padding: 20px;
overflow-x: auto;
}

.code-container pre {
margin: 0;
font-family: 'Monaco', 'Consolas', 'Courier New', monospace;
font-size: 14px;
line-height: 1.6;
white-space: pre-wrap;
word-wrap: break-word;
}

.tags-section {
margin-bottom: 40px;
}

.tags-section h3 {
margin-bottom: 15px;
color: #2c3e50;
}

.tags {
display: flex;
flex-wrap: wrap;
gap: 10px;
}

.tag {
padding: 6px 12px;
background: #e9ecef;
color: #495057;
border-radius: 20px;
font-size: 0.85rem;
font-weight: 500;
}

.prompt-actions {
display: flex;
gap: 15px;
margin-bottom: 50px;
flex-wrap: wrap;
}

.btn-action {
padding: 10px 20px;
border: 2px solid #dee2e6;
background: white;
color: #495057;
border-radius: 8px;
font-weight: 500;
transition: all 0.2s;
}

.btn-action:hover {
border-color: #667eea;
color: #667eea;
}

.btn-action.liked {
background: #667eea;
color: white;
border-color: #667eea;
}



.btn-action.btn-edit {
background: #ffc107;
color: #212529;
border-color: #ffc107;
}

.btn-action.btn-edit:hover {
background: #e0a800;
border-color: #d39e00;
color: #212529;
}

.comments-section h3 {
margin-bottom: 25px;
color: #2c3e50;
}

.add-comment {
margin-bottom: 30px;
}

.comment-form {
background: #f8f9fa;
border: 1px solid #e9ecef;
border-radius: 12px;
padding: 20px;
transition: all 0.2s;
}

.comment-form:focus-within {
border-color: #667eea;
box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.comment-user-info {
display: flex;
align-items: center;
gap: 10px;
margin-bottom: 15px;
}

.comment-user-avatar {
width: 32px;
height: 32px;
border-radius: 50%;
object-fit: cover;
}

.comment-user-name {
font-weight: 600;
color: #2c3e50;
font-size: 0.9rem;
}

.comment-input {
width: 100%;
min-height: 80px;
padding: 15px;
border: 1px solid #dee2e6;
border-radius: 8px;
font-family: inherit;
font-size: 14px;
line-height: 1.5;
resize: vertical;
margin-bottom: 15px;
transition: border-color 0.2s;
}

.comment-input:focus {
outline: none;
border-color: #667eea;
}

.comment-input:disabled {
background: #e9ecef;
cursor: not-allowed;
}

.comment-actions {
display: flex;
justify-content: space-between;
align-items: center;
}

.comment-info {
display: flex;
align-items: center;
gap: 15px;
}

.char-count {
font-size: 0.8rem;
color: #6c757d;
}

.char-count.warning {
color: #dc3545;
font-weight: 600;
}

.shortcut-hint {
font-size: 0.75rem;
color: #adb5bd;
}

.comment-buttons {
display: flex;
gap: 10px;
}

.btn-sm {
padding: 8px 16px;
font-size: 0.875rem;
}

.spinner-tiny {
width: 12px;
height: 12px;
border: 1px solid #f3f3f3;
border-top: 1px solid #667eea;
border-radius: 50%;
animation: spin 1s linear infinite;
display: inline-block;
margin-right: 5px;
}

.login-prompt {
background: #e3f2fd;
border: 1px solid #bbdefb;
border-radius: 8px;
padding: 20px;
text-align: center;
margin-bottom: 30px;
}

.login-prompt p {
margin: 0 0 15px;
color: #1976d2;
font-weight: 500;
}

.success-notification {
position: fixed;
top: 20px;
right: 20px;
background: #28a745;
color: white;
padding: 12px 20px;
border-radius: 8px;
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
z-index: 1000;
animation: slideInRight 0.3s ease-out;
}

@keyframes slideInRight {
from {
    transform: translateX(100%);
    opacity: 0;
}
to {
    transform: translateX(0);
    opacity: 1;
}
}

.comment {
padding: 20px;
background: #f8f9fa;
border-radius: 8px;
margin-bottom: 15px;
}

.comment-author {
display: flex;
align-items: center;
gap: 12px;
margin-bottom: 10px;
}

.comment-avatar {
width: 40px;
height: 40px;
border-radius: 50%;
object-fit: cover;
}

.comment-meta h4 {
margin: 0;
font-size: 1rem;
color: #2c3e50;
}

.comment-date {
color: #6c757d;
font-size: 0.85rem;
}

.comment-content {
margin: 0;
line-height: 1.6;
color: #495057;
}

.no-comments {
text-align: center;
padding: 40px 20px;
color: #6c757d;
}

.similar-prompts-section {
margin-top: 60px;
padding-top: 40px;
border-top: 2px solid #e9ecef;
}

.similar-prompts-section h3 {
margin-bottom: 25px;
color: #2c3e50;
font-size: 1.5rem;
display: flex;
align-items: center;
gap: 10px;
}

.loading-badge {
font-size: 0.8rem;
background: #667eea;
color: white;
padding: 4px 8px;
border-radius: 12px;
animation: pulse 1.5s infinite;
}

@keyframes pulse {
0%, 100% { opacity: 1; }
50% { opacity: 0.5; }
}

.loading-similar {
text-align: center;
padding: 30px 20px;
}

.spinner-small {
width: 30px;
height: 30px;
border: 2px solid #f3f3f3;
border-top: 2px solid #667eea;
border-radius: 50%;
animation: spin 1s linear infinite;
margin: 0 auto 15px;
}

.similar-prompts-grid {
display: grid;
grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
gap: 20px;
}

.similar-prompt-card {
background: #f8f9fa;
border: 1px solid #e9ecef;
border-radius: 8px;
padding: 20px;
transition: all 0.2s;
cursor: pointer;
position: relative;
animation: fadeInUp 0.5s ease-out forwards;
opacity: 0;
transform: translateY(20px);
}

@keyframes fadeInUp {
to {
    opacity: 1;
    transform: translateY(0);
}
}

.similar-prompt-card:hover {
transform: translateY(-2px);
box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
border-color: #667eea;
}

.similar-prompt-header {
display: flex;
justify-content: space-between;
align-items: flex-start;
margin-bottom: 12px;
}

.similar-prompt-title {
margin: 0;
font-size: 1.1rem;
font-weight: 600;
color: #2c3e50;
line-height: 1.3;
flex: 1;
margin-right: 10px;
}

.similar-prompt-category {
padding: 4px 8px;
background: #667eea;
color: white;
border-radius: 12px;
font-size: 0.75rem;
font-weight: 500;
white-space: nowrap;
}

.similar-prompt-description {
margin: 0 0 15px;
color: #6c757d;
font-size: 0.9rem;
line-height: 1.4;
display: -webkit-box;
-webkit-line-clamp: 2;
-webkit-box-orient: vertical;
line-clamp: 2;
overflow: hidden;
}

.similar-prompt-footer {
display: flex;
justify-content: space-between;
align-items: center;
}

.similar-prompt-author {
display: flex;
align-items: center;
gap: 8px;
}

.similar-author-avatar {
width: 24px;
height: 24px;
border-radius: 50%;
object-fit: cover;
}

.similar-prompt-author span {
font-size: 0.85rem;
color: #495057;
font-weight: 500;
}

.similar-prompt-stats {
display: flex;
gap: 12px;
}

.similar-prompt-stats span {
font-size: 0.8rem;
color: #6c757d;
}

.similarity-indicator {
margin-top: 12px;
padding-top: 12px;
border-top: 1px solid #e9ecef;
}

.similarity-bar {
width: 100%;
height: 4px;
background: #e9ecef;
border-radius: 2px;
overflow: hidden;
margin-bottom: 5px;
}

.similarity-fill {
height: 100%;
background: linear-gradient(90deg, #667eea, #764ba2);
border-radius: 2px;
transition: width 0.5s ease;
}

.similarity-text {
font-size: 0.75rem;
color: #6c757d;
font-weight: 500;
}

.no-similar-prompts {
text-align: center;
padding: 40px 20px;
color: #6c757d;
}

.btn {
padding: 10px 20px;
border: none;
border-radius: 6px;
font-weight: 500;
text-decoration: none;
display: inline-block;
text-align: center;
cursor: pointer;
transition: all 0.2s;
}

.btn-primary {
background: #667eea;
color: white;
}

.btn-primary:hover {
background: #5a6fd8;
}

.btn-primary:disabled {
background: #c8d0f0;
cursor: not-allowed;
}

.btn-secondary {
background: #6c757d;
color: white;
}

.btn-secondary:hover {
background: #5a6268;
}

@media (max-width: 768px) {
.prompt-title {
    font-size: 2rem;
}

.prompt-description {
    font-size: 1rem;
    margin-bottom: 15px;
}

.author-section {
    flex-direction: column;
    gap: 15px;
    text-align: center;
}

.prompt-stats {
    justify-content: center;
}

.prompt-actions {
    justify-content: center;
}
}
</style>
