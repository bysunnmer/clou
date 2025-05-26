<template>
  <nav class="nav" v-if="!isHomePage">
    <!-- 데스크탑 -->
    <template v-if="!isMobile">
      <div class="nav-left">
        <img src="@/assets/logo_plat.png" alt="logo" class="logo logo-desktop" />
        <RouterLink to="/" class="nav-item">Home</RouterLink>
        <RouterLink to="/movies" class="nav-item">Movies</RouterLink>
        <RouterLink to="/emotions" class="nav-item">Emotions</RouterLink>
      </div>
      <div class="nav-right">
        <template v-if="!isAuthenticated">
          <RouterLink to="/signup" class="nav-item">Sign Up</RouterLink>
          <RouterLink to="/login" class="nav-item">Log In</RouterLink>
        </template>
        <template v-else>
          <RouterLink to="/mypage" class="nav-item">My Page</RouterLink>
          <button @click="logout" class="nav-item logout-btn">Log Out</button>
        </template>
      </div>
    </template>

    <!-- 모바일 -->
    <template v-else>
      <div class="menu-container">
        <img
          src="@/assets/logo_circle.png"
          alt="menu"
          class="logo logo-mobile"
          @click="toggleMenu"
        />
        <transition-group name="domino" tag="div" class="nav-links mobile" v-if="isOpen">
          <RouterLink to="/" class="nav-item">Home</RouterLink>
          <RouterLink to="/movies" class="nav-item">Movies</RouterLink>
          <RouterLink to="/emotions" class="nav-item">Emotions</RouterLink>
          <template v-if="!isAuthenticated">
            <RouterLink to="/signup" class="nav-item">Sign Up</RouterLink>
            <RouterLink to="/login" class="nav-item">Log In</RouterLink>
          </template>
          <template v-else>
            <RouterLink to="/mypage" class="nav-item">My Page</RouterLink>
            <button @click="logout" class="nav-item logout-btn">Log Out</button>
          </template>
        </transition-group>
      </div>
    </template>
  </nav>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const isMobile = ref(window.innerWidth <= 768)
const isOpen = ref(false)
const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const isAuthenticated = computed(() => authStore.isAuthenticated)
const isHomePage = computed(() => route.path === '/')

const toggleMenu = () => {
  isOpen.value = !isOpen.value
}

const handleResize = () => {
  isMobile.value = window.innerWidth <= 768
  if (!isMobile.value) isOpen.value = false
}

const logout = async () => {
  try {
    await authStore.logout()
    router.push('/')
  } catch (error) {
    console.error('로그아웃 실패:', error)
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background-color: #111;
  z-index: 1000;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1.5rem;
}

.nav-left, .nav-right {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.nav-item {
  color: white;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
  padding: 0.5rem 0;
  position: relative;
}

.nav-item:hover {
  color: #42b883;
}

.nav-item::after {
  content: '';
  position: absolute;
  width: 0;
  height: 2px;
  bottom: 0;
  left: 0;
  background-color: #42b883;
  transition: width 0.3s;
}

.nav-item:hover::after {
  width: 100%;
}

.logout-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  font-family: inherit;
  color: white;
}

.router-link-active {
  font-weight: bold;
  text-decoration: underline;
}

.logo-desktop {
  height: 65px;
  margin-right: 1rem;
}

/* 모바일 */
.menu-container {
  position: absolute;
  top: 0.5rem;
  right: 1rem;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  z-index: 1100;
}

.logo-mobile {
  height: 64px;
  cursor: pointer;
  background: none;
}

.nav-links.mobile {
  margin-top: 0.5rem;
  background-color: #111;
  padding: 1rem 1rem;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
}

.nav-links.mobile a,
.nav-links.mobile button {
  color: white;
  text-decoration: none;
  font-size: 0.95rem;
}

.domino-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}
.domino-enter-active {
  transition: all 0.3s ease;
}
.domino-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
.domino-leave-active {
  transition: all 0.2s ease;
}

@media (max-width: 768px) {
  .nav {
    background-color: transparent;
  }
}
</style>
