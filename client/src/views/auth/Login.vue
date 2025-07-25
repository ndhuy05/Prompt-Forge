<template>
  <div class="login-container">
    <div class="login-card card">
      <div class="login-header">
        <h1 class="login-title">
          <span class="icon">🔐</span>
          Welcome Back
        </h1>
        <p class="login-subtitle">
          Sign in to your CodeForge account
        </p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email" class="form-label">Email or Username</label>
          <input
            id="email"
            v-model="form.email"
            type="text"
            class="form-input"
            :class="{ error: errors.email }"
            placeholder="Enter your email or username"
            required
          >
          <div v-if="errors.email" class="error-message">
            {{ errors.email }}
          </div>
        </div>

        <div class="form-group">
          <label for="password" class="form-label">Password</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            class="form-input"
            :class="{ error: errors.password }"
            placeholder="Enter your password"
            required
          >
          <div v-if="errors.password" class="error-message">
            {{ errors.password }}
          </div>
        </div>

        <button
          type="submit"
          class="btn btn-primary login-btn"
          :disabled="isLoading"
          :class="{ loading: isLoading }"
        >
          <span v-if="isLoading" class="loading-spinner"></span>
          {{ isLoading ? 'Signing In...' : 'Sign In' }}
        </button>

        <div v-if="serverError" class="error-message server-error">
          {{ serverError }}
        </div>
      </form>

      <div class="login-footer">
        <p>
          Don't have an account?
          <router-link to="/register" class="register-link">
            Sign up here
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { loginUser } from '@/api/authAPI'

const router = useRouter()

const form = ref({
  email: '',
  password: ''
})

const isLoading = ref(false)
const errors = ref({})
const serverError = ref('')

const handleLogin = async () => {
  serverError.value = ''
  errors.value = {}
  
  if (!form.value.email) {
    errors.value.email = 'Email or username is required'
    return
  }
  
  if (!form.value.password) {
    errors.value.password = 'Password is required'
    return
  }
  
  isLoading.value = true
  
  try {
    const response = await loginUser({
      email: form.value.email,
      password: form.value.password
    })
    
    if (response.success) {
      router.push('/dashboard')
    } else {
      serverError.value = response.message
    }
  } catch (error) {
    serverError.value = error.message || 'Login failed. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 100%;
  max-width: 400px;
  padding: 40px;
  animation: slideUp 0.6s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-title {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.login-title .icon {
  font-size: 2.2rem;
}

.login-subtitle {
  color: #6c757d;
  font-size: 1rem;
  margin: 0;
}

.login-form {
  margin-bottom: 24px;
}

.login-btn {
  width: 100%;
}

.server-error {
  text-align: center;
  margin-top: 16px;
  padding: 12px;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 6px;
  color: #721c24;
}

.login-footer {
  text-align: center;
  padding-top: 24px;
  border-top: 1px solid #dee2e6;
}

.login-footer p {
  color: #6c757d;
  margin: 0;
}

.register-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
}

.register-link:hover {
  text-decoration: underline;
}

@media (max-width: 576px) {
  .login-container {
    padding: 16px;
  }
  
  .login-card {
    padding: 24px;
  }
  
  .login-title {
    font-size: 1.75rem;
  }
}
</style>
