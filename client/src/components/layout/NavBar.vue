<template>
  <nav class="navbar">
    <div class="nav-container">
      <div class="nav-brand">
        <router-link to="/" class="brand-link">
          <span class="brand-icon">🚀</span>
          <span class="brand-text">CodeForge</span>
        </router-link>
      </div>
      
      <div class="nav-links">
        <router-link to="/" class="nav-link">Home</router-link>
        <router-link to="/prompts" class="nav-link">Prompts</router-link>
        
        <div v-if="isUserAuthenticated" class="nav-auth">
          <router-link to="/my-prompts" class="btn btn-primary">Your Prompts</router-link>
          <router-link to="/dashboard" class="nav-link">Dashboard</router-link>
          <router-link v-if="isAdmin" to="/admin" class="nav-link">Admin</router-link>
          <div class="user-menu">
            <button class="user-button" @click="showUserMenu = !showUserMenu">
              <img :src="userAvatarUrl" alt="Avatar" class="user-avatar">
              <span>{{ user?.username || 'User' }}</span>
            </button>
            <div v-if="showUserMenu" class="user-dropdown">
              <router-link to="/profile" class="dropdown-link">Profile</router-link>
              <button @click="handleLogout" class="dropdown-link logout-btn">Logout</button>
            </div>
          </div>
        </div>
        
        <div v-else class="nav-auth">
          <router-link to="/login" class="nav-link">Login</router-link>
          <router-link to="/register" class="btn btn-primary">Sign Up</router-link>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { logoutUser, getUser, isAuthenticated } from '@/api/authAPI'
import { isUserAdmin } from '@/api/adminAPI'

const router = useRouter()
const route = useRoute()
const showUserMenu = ref(false)

// Reactive data
const user = ref(null)
const isUserAuthenticated = ref(false)

// Load user data khi component mounted
onMounted(() => {
  updateAuthState()
})

// Watch route changes để update auth state
watch(route, () => {
  updateAuthState()
})

const updateAuthState = () => {
  isUserAuthenticated.value = isAuthenticated()
  user.value = getUser()
}

const isAdmin = computed(() => {
  return isUserAdmin()
})

// Computed property for user avatar URL
const userAvatarUrl = computed(() => {
  const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000'
  
  if (user.value?.avatar) {
    const avatarUrl = user.value.avatar.startsWith('/') 
      ? `${serverUrl}${user.value.avatar}`
      : user.value.avatar
    return avatarUrl
  }
  
  return `${serverUrl}/images/default-avatar.svg`
})

const handleLogout = async () => {
  try {
    await logoutUser()
    updateAuthState() // Cập nhật lại state
    router.push('/')
  } catch (error) {
    console.error('Logout error:', error)
    // Vẫn logout dù có lỗi
    updateAuthState()
    router.push('/')
  }
}
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  height: 70px;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand-link {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: #333;
  font-weight: 700;
  font-size: 1.5rem;
}

.brand-icon {
  font-size: 1.8rem;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 20px;
}

.nav-link {
  text-decoration: none;
  color: #666;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 6px;
  transition: all 0.2s;
}

.nav-link:hover {
  color: #667eea;
  background: #f8f9fa;
}

.nav-link.router-link-active {
  color: #667eea;
  background: #f0f2ff;
}

.nav-auth {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-menu {
  position: relative;
}

.user-button {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  transition: background 0.2s;
}

.user-button:hover {
  background: #f8f9fa;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 8px 0;
  min-width: 150px;
  margin-top: 8px;
}

.dropdown-link {
  display: block;
  width: 100%;
  padding: 10px 16px;
  text-decoration: none;
  color: #333;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s;
}

.dropdown-link:hover {
  background: #f8f9fa;
}

.logout-btn {
  color: #dc3545;
  border-top: 1px solid #eee;
  margin-top: 4px;
  padding-top: 12px;
}

@media (max-width: 768px) {
  .nav-links {
    gap: 12px;
  }
  
  .nav-link {
    padding: 6px 12px;
    font-size: 14px;
  }
  
  .brand-text {
    display: none;
  }
}
</style>
