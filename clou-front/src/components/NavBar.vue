<template>
  <nav class="nav">
    <div class="nav-left">
      <RouterLink to="/" class="nav-item">Home</RouterLink>
      <RouterLink to="/movies" class="nav-item">Movies</RouterLink>
      <RouterLink to="/emotions" class="nav-item">Emotions</RouterLink>
    </div>
    
    <div class="nav-right">
      <!-- 로그인하지 않은 경우 -->
      <template v-if="!isAuthenticated">
        <RouterLink to="/signup" class="nav-item">Sign Up</RouterLink>
        <RouterLink to="/login" class="nav-item">Log In</RouterLink>
        <RouterLink to="/mypage" class="nav-item">My Page</RouterLink>
      </template>
      
      <!-- 로그인한 경우 -->
      <template v-else>
        <RouterLink to="/mypage" class="nav-item">My Page</RouterLink>
        <button @click="logout" class="nav-item logout-btn">Log Out</button>
      </template>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// 인증 상태 가져오기
const isAuthenticated = computed(() => authStore.isAuthenticated)

// 로그아웃 함수
const logout = async () => {
  try {
    await authStore.logout()
    // 로그아웃 성공 시 홈으로 리디렉션
    router.push('/')
  } catch (error) {
    console.error('로그아웃 실패:', error)
  }
}
</script>

<style scoped>
.nav {
  display: flex;
  justify-content: space-between;
  background-color: #222;
  padding: 1rem 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
  color: #42b883; /* Vue 색상 */
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
}

.router-link-active {
  font-weight: bold;
  text-decoration: underline;
}
</style>