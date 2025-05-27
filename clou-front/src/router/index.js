import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import MovieListView from '../views/MovieListView.vue'
import MovieDetailView from '@/views/MovieDetailView.vue'
import EmotionView from '@/views/EmotionView.vue'
import SignUpView from '@/views/SignUpView.vue'
import LoginView from '@/views/LoginView.vue'
import MyPageView from '@/views/MyPageView.vue'
import DiaryPage from '@/views/DiaryPage.vue'

// 인증 상태 관리 스토어 가져오기
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/movies', name: 'movies', component: MovieListView },
    { path: '/movies/:id', name: 'movie-detail', component: MovieDetailView },
    { path: '/emotions', name: 'emotions', component: EmotionView },
    { path: '/signup', name: 'signup', component: SignUpView },
    { path: '/login', name: 'login', component: LoginView },
    { 
      path: '/mypage', 
      name: 'mypage', 
      component: MyPageView,
      meta: { requiresAuth: true } // 인증이 필요한 페이지로 표시
    },
    {
      path: '/diary',
      name: 'diary',
      component: DiaryPage,
      meta: { requiresAuth: true } // 인증이 필요한 페이지로 표시
    },
    { 
      path: '/profile/:username', 
      name: 'userProfile', 
      component: MyPageView, // 마이페이지 컴포넌트 재사용
      props: true // URL 파라미터를 props로 전달
    },
  ],
})

// 전역 네비게이션 가드 설정
router.beforeEach((to, from, next) => {
  // 페이지 진입 전에 스토어에 접근하려면 useAuthStore()를 직접 호출해야 함
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated
  
  // 인증이 필요한 페이지에 접근하는 경우
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isAuthenticated) {
      // 비로그인 상태면 로그인 페이지로 리디렉션
      next({ 
        path: '/login', 
        // 로그인 후 원래 가려던 페이지로 이동하기 위해 쿼리 파라미터로 저장
        query: { redirect: to.fullPath } 
      })
    } else {
      // 로그인 상태면 요청한 페이지로 진행
      next()
    }
  } 
  // 로그인/회원가입 페이지에 접근하는 경우
  else if (to.path === '/login' || to.path === '/signup') {
    if (isAuthenticated) {
      // 이미 로그인한 상태면 홈으로 리디렉션
      next({ path: '/' })
    } else {
      // 비로그인 상태면 요청한 페이지로 진행
      next()
    }
  } 
  else {
    // 그 외 페이지는 인증 상태와 무관하게 접근 허용
    next()
  }
})

export default router
