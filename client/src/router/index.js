import { createRouter, createWebHistory } from 'vue-router'
import { isAuthenticated } from '@/api/authAPI'
import { isUserAdmin } from '@/api/adminAPI'

// Import views
import Home from '@/views/Home.vue'
import Register from '@/views/auth/Register.vue'
import Login from '@/views/auth/Login.vue'
import Dashboard from '@/views/Dashboard.vue'
import Prompts from '@/views/Prompts.vue'
import CreatePrompt from '@/views/CreatePrompt.vue'
import EditPrompt from '@/views/EditPrompt.vue'
import MyPrompts from '@/views/MyPrompts.vue'
import PromptDetail from '@/views/PromptDetail.vue'
import Admin from '@/views/Admin.vue'
import AdminUsers from '@/views/AdminUsers.vue'
import AdminPrompts from '@/views/AdminPrompts.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { requiresAuth: false, hideForAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false, hideForAuth: true }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/prompts',
    name: 'Prompts',
    component: Prompts,
    meta: { requiresAuth: false }
  },
  {
    path: '/prompts/:id/edit',
    name: 'EditPrompt',
    component: EditPrompt,
    meta: { requiresAuth: true }
  },
  {
    path: '/prompts/:id',
    name: 'PromptDetail',
    component: PromptDetail,
    meta: { requiresAuth: false }
  },
  {
    path: '/create-prompt',
    name: 'CreatePrompt',
    component: CreatePrompt,
    meta: { requiresAuth: true }
  },
  {
    path: '/my-prompts',
    name: 'MyPrompts',
    component: MyPrompts,
    meta: { requiresAuth: true }
  },
  // Simple Admin routes
  {
    path: '/admin',
    name: 'Admin',
    component: Admin,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/users',
    name: 'AdminUsers',
    component: AdminUsers,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/prompts',
    name: 'AdminPrompts',
    component: AdminPrompts,
    meta: { requiresAuth: true, requiresAdmin: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation Guards
router.beforeEach((to, from, next) => {
  // Check if route requires authentication
  if (to.meta.requiresAuth && !isAuthenticated()) {
    next('/login')
    return
  }
  
  // Hide auth pages if already logged in
  if (to.meta.hideForAuth && isAuthenticated()) {
    next('/dashboard')
    return
  }
  
  // Check if route requires admin access
  if (to.meta.requiresAdmin && !isUserAdmin()) {
    next('/dashboard')
    return
  }
  
  next()
})

export default router
