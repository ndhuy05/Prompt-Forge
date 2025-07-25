<template>
  <div class="register-container">
    <div class="register-card card">
      <div class="register-header">
        <h1 class="register-title">
          <span class="icon">🚀</span>
          Join CodeForge
        </h1>
        <p class="register-subtitle">
          Start sharing and discovering amazing AI prompts
        </p>
      </div>

      <form @submit.prevent="handleRegister" class="register-form">
        <div class="form-group">
          <label for="username" class="form-label">
            Username *
          </label>
          <input
            id="username"
            v-model="form.username"
            type="text"
            class="form-input"
            :class="{ error: errors.username }"
            placeholder="Choose a unique username"
            required
            autocomplete="username"
          >
          <div v-if="errors.username" class="error-message">
            {{ errors.username }}
          </div>
        </div>

        <div class="form-group">
          <label for="email" class="form-label">
            Email Address *
          </label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            class="form-input"
            :class="{ error: errors.email }"
            placeholder="your.email@example.com"
            required
            autocomplete="email"
          >
          <div v-if="errors.email" class="error-message">
            {{ errors.email }}
          </div>
        </div>

        <div class="form-group">
          <label for="password" class="form-label">
            Password *
          </label>
          <div class="password-input-container">
            <input
              id="password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              class="form-input"
              :class="{ error: errors.password }"
              placeholder="Create a strong password"
              required
              autocomplete="new-password"
            >
            <button
              type="button"
              class="password-toggle"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? '👁️' : '🙈' }}
            </button>
          </div>
          <div v-if="errors.password" class="error-message">
            {{ errors.password }}
          </div>
          <div class="password-strength">
            <div class="strength-bar">
              <div 
                class="strength-fill"
                :class="passwordStrength.class"
                :style="{ width: passwordStrength.width }"
              ></div>
            </div>
            <span class="strength-text">{{ passwordStrength.text }}</span>
          </div>
        </div>

        <div class="form-group">
          <label for="confirmPassword" class="form-label">
            Confirm Password *
          </label>
          <input
            id="confirmPassword"
            v-model="form.confirmPassword"
            type="password"
            class="form-input"
            :class="{ error: errors.confirmPassword }"
            placeholder="Confirm your password"
            required
            autocomplete="new-password"
          >
          <div v-if="errors.confirmPassword" class="error-message">
            {{ errors.confirmPassword }}
          </div>
        </div>

        <div class="form-group">
          <label for="fullName" class="form-label">
            Full Name (Optional)
          </label>
          <input
            id="fullName"
            v-model="form.fullName"
            type="text"
            class="form-input"
            :class="{ error: errors.fullName }"
            placeholder="Your full name"
            autocomplete="name"
          >
          <div v-if="errors.fullName" class="error-message">
            {{ errors.fullName }}
          </div>
        </div>

        <div class="form-group terms-group">
          <label class="checkbox-label">
            <input
              v-model="form.agreeToTerms"
              type="checkbox"
              class="checkbox-input"
              required
            >
            <span class="checkbox-custom"></span>
            <span class="checkbox-text">
              I agree to the 
              <a href="/terms" target="_blank">Terms of Service</a> 
              and 
              <a href="/privacy" target="_blank">Privacy Policy</a>
            </span>
          </label>
          <div v-if="errors.agreeToTerms" class="error-message">
            {{ errors.agreeToTerms }}
          </div>
        </div>

        <button
          type="submit"
          class="btn btn-primary register-btn"
          :disabled="isLoading || !isFormValid"
          :class="{ loading: isLoading }"
        >
          <span v-if="isLoading" class="loading-spinner"></span>
          {{ isLoading ? 'Creating Account...' : 'Create Account' }}
        </button>

        <div v-if="serverError" class="error-message server-error">
          {{ serverError }}
        </div>

        <div v-if="successMessage" class="success-message">
          {{ successMessage }}
        </div>
      </form>

      <div class="register-footer">
        <p>
          Already have an account?
          <router-link to="/login" class="login-link">
            Sign in here
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { registerUser } from '@/api/authAPI'
import { 
  validateUsername, 
  validateEmail, 
  validatePassword, 
  validateConfirmPassword, 
  validateFullName,
  checkPasswordStrength 
} from '@/utils/auth'

const router = useRouter()

// Form data
const form = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  fullName: '',
  agreeToTerms: false
})

// UI state
const showPassword = ref(false)
const isLoading = ref(false)
const errors = ref({})
const serverError = ref('')
const successMessage = ref('')

// Password strength calculation
const passwordStrength = computed(() => {
  return checkPasswordStrength(form.value.password)
})

// Form validation
const isFormValid = computed(() => {
  // Check if all required fields are filled
  const requiredFieldsFilled = form.value.username &&
                              form.value.email &&
                              form.value.password &&
                              form.value.confirmPassword &&
                              form.value.agreeToTerms

  // Check if there are any validation errors (filter out null/undefined errors)
  const hasValidationErrors = Object.values(errors.value).some(error => error !== null && error !== undefined && error !== '')

  return requiredFieldsFilled && !hasValidationErrors
})

// Real-time validation
watch(() => form.value.username, (newVal) => {
  errors.value.username = validateUsername(newVal)
}, { immediate: true })

watch(() => form.value.email, (newVal) => {
  errors.value.email = validateEmail(newVal)
}, { immediate: true })

watch(() => form.value.password, (newVal) => {
  errors.value.password = validatePassword(newVal)
  // Re-validate confirm password if it exists
  if (form.value.confirmPassword) {
    errors.value.confirmPassword = validateConfirmPassword(form.value.confirmPassword, newVal)
  }
}, { immediate: true })

watch(() => form.value.confirmPassword, (newVal) => {
  errors.value.confirmPassword = validateConfirmPassword(newVal, form.value.password)
}, { immediate: true })

watch(() => form.value.fullName, (newVal) => {
  errors.value.fullName = validateFullName(newVal)
}, { immediate: true })

watch(() => form.value.agreeToTerms, (newVal) => {
  errors.value.agreeToTerms = newVal ? null : 'You must agree to the terms and conditions'
}, { immediate: true })

// Submit handler
const handleRegister = async () => {
  // Clear previous messages
  serverError.value = ''
  successMessage.value = ''
  
  // Final validation
  const finalErrors = {
    username: validateUsername(form.value.username),
    email: validateEmail(form.value.email),
    password: validatePassword(form.value.password),
    confirmPassword: validateConfirmPassword(form.value.confirmPassword, form.value.password),
    fullName: validateFullName(form.value.fullName),
    agreeToTerms: form.value.agreeToTerms ? null : 'You must agree to the terms and conditions'
  }
  
  // Remove null errors
  Object.keys(finalErrors).forEach(key => {
    if (finalErrors[key] === null) delete finalErrors[key]
  })
  
  if (Object.keys(finalErrors).length > 0) {
    errors.value = finalErrors
    return
  }
  
  isLoading.value = true
  
  try {
    const response = await registerUser({
      username: form.value.username,
      email: form.value.email,
      password: form.value.password,
      fullName: form.value.fullName || undefined
    })
    
    if (response.success) {
      successMessage.value = 'Account created successfully! Redirecting...'
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
    } else {
      serverError.value = response.message
    }
  } catch (error) {
    serverError.value = error.message || 'Registration failed. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.register-card {
  width: 100%;
  max-width: 480px;
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

.register-header {
  text-align: center;
  margin-bottom: 32px;
}

.register-title {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.register-title .icon {
  font-size: 2.2rem;
}

.register-subtitle {
  color: #6c757d;
  font-size: 1rem;
  margin: 0;
}

.register-form {
  margin-bottom: 24px;
}

.password-input-container {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.password-toggle:hover {
  background-color: #f8f9fa;
}

.password-strength {
  margin-top: 8px;
}

.strength-bar {
  width: 100%;
  height: 4px;
  background-color: #e9ecef;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 4px;
}

.strength-fill {
  height: 100%;
  transition: width 0.3s ease, background-color 0.3s ease;
  border-radius: 2px;
}

.strength-fill.very-weak { background-color: #dc3545; }
.strength-fill.weak { background-color: #fd7e14; }
.strength-fill.fair { background-color: #ffc107; }
.strength-fill.good { background-color: #20c997; }
.strength-fill.strong { background-color: #28a745; }
.strength-fill.very-strong { background-color: #28a745; }
.strength-fill.excellent { background-color: #198754; }

.strength-text {
  font-size: 12px;
  color: #6c757d;
}

.terms-group {
  margin: 24px 0;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
  font-size: 14px;
  line-height: 1.5;
}

.checkbox-input {
  display: none;
}

.checkbox-custom {
  width: 18px;
  height: 18px;
  border: 2px solid #dee2e6;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
  margin-top: 2px;
}

.checkbox-input:checked + .checkbox-custom {
  background-color: #667eea;
  border-color: #667eea;
}

.checkbox-input:checked + .checkbox-custom::after {
  content: '✓';
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.checkbox-text {
  color: #495057;
}

.checkbox-text a {
  color: #667eea;
  text-decoration: none;
}

.checkbox-text a:hover {
  text-decoration: underline;
}

.register-btn {
  width: 100%;
  position: relative;
  overflow: hidden;
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

.success-message {
  text-align: center;
  margin-top: 16px;
  padding: 12px;
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 6px;
  color: #155724;
}

.register-footer {
  text-align: center;
  padding-top: 24px;
  border-top: 1px solid #dee2e6;
}

.register-footer p {
  color: #6c757d;
  margin: 0;
}

.login-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
}

.login-link:hover {
  text-decoration: underline;
}

/* Responsive Design */
@media (max-width: 576px) {
  .register-container {
    padding: 16px;
  }
  
  .register-card {
    padding: 24px;
  }
  
  .register-title {
    font-size: 1.75rem;
  }
  
  .checkbox-label {
    font-size: 13px;
  }
}

/* Focus states for accessibility */
.form-input:focus,
.checkbox-input:focus + .checkbox-custom {
  outline: 2px solid #667eea;
  outline-offset: 2px;
}

/* Error states */
.form-input.error {
  border-color: #dc3545;
  box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
}
</style>
