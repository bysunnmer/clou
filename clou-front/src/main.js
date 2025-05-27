import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// 앱 마운트 후 auth 스토어 초기화
app.mount('#app')

// auth 스토어 초기화 (페이지 새로고침 시 인증 상태 유지)
const authStore = useAuthStore()
authStore.initAuth()
