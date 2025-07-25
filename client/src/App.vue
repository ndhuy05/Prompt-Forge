<template>
  <div id="app">
    <NavBar v-if="!isAuthRoute" />
    <main class="main-content" :class="{ 'auth-layout': isAuthRoute }">
      <router-view />
    </main>
    <Footer v-if="!isAuthRoute" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import NavBar from '@/components/layout/NavBar.vue'
import Footer from '@/components/layout/Footer.vue'

const route = useRoute()

const isAuthRoute = computed(() => {
  return ['Login', 'Register'].includes(route.name)
})
</script>

<style>
.main-content {
  flex: 1;
  padding-top: 80px; /* Account for fixed navbar */
}

.main-content.auth-layout {
  padding-top: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
</style>
