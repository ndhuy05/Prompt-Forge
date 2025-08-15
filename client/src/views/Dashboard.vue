<template>
  <div class="dashboard">
    <div class="container">
      <div class="dashboard-header">
        <h1>Welcome back, {{ user?.username }}! 🎉</h1>
        <p>Your AI prompt sharing dashboard</p>
      </div>
      
      <div class="dashboard-stats">
        <div class="stat-card">
          <div class="stat-icon">📝</div>
          <div class="stat-info">
            <h3>0</h3>
            <p>Prompts Created</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">👍</div>
          <div class="stat-info">
            <h3>0</h3>
            <p>Likes Received</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">⭐</div>
          <div class="stat-info">
            <h3>{{ user?.role || 'User' }}</h3>
            <p>Role</p>
          </div>
        </div>
      </div>
      
      <div class="dashboard-actions">
        <router-link to="/prompts/create" class="btn btn-primary">
          Create New Prompt
        </router-link>
        <router-link to="/prompts" class="btn btn-secondary">
          Browse Prompts
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getCurrentUser } from '@/api/authAPI'

const user = ref(null)

onMounted(async () => {
  try {
    const token = localStorage.getItem('token')
    if (token) {
      const response = await getCurrentUser()
      user.value = response.data.data
    }
  } catch (error) {
    console.error('Error fetching user profile:', error)
  }
})
</script>

<style scoped>
.dashboard {
  padding: 40px 0;
  min-height: calc(100vh - 140px);
}

.dashboard-header {
  text-align: center;
  margin-bottom: 60px;
}

.dashboard-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 10px;
}

.dashboard-header p {
  font-size: 1.1rem;
  color: #6c757d;
}

.dashboard-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 30px;
  margin-bottom: 60px;
}

.stat-card {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 20px;
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-icon {
  font-size: 2.5rem;
  opacity: 0.8;
}

.stat-info h3 {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 5px;
}

.stat-info p {
  color: #6c757d;
  font-weight: 500;
  margin: 0;
}

.dashboard-actions {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .dashboard {
    padding: 20px 0;
  }
  
  .dashboard-header h1 {
    font-size: 2rem;
  }
  
  .dashboard-stats {
    gap: 20px;
  }
  
  .stat-card {
    padding: 20px;
    gap: 15px;
  }
  
  .stat-icon {
    font-size: 2rem;
  }
  
  .stat-info h3 {
    font-size: 1.5rem;
  }
  
  .dashboard-actions {
    flex-direction: column;
    align-items: center;
  }
}
</style>
