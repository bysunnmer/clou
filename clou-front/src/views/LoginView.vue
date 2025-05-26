<template>
  <div class="login-container">
    <h2>로그인 🔑</h2>
    
    <!-- 로딩 인디케이터 -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
    </div>
    
    <form @submit.prevent="login" class="login-form" :class="{ 'form-disabled': isLoading }">
      <div class="form-group">
        <label for="username">사용자 이름</label>
        <input
          type="text"
          id="username"
          v-model="formData.username"
          required
          placeholder="사용자 이름 입력"
          :class="{ 'input-error': !validations.username.valid }"
          @blur="validateUsername"
          :disabled="isLoading"
        />
        <span v-if="!validations.username.valid" class="error">{{ validations.username.message }}</span>
      </div>

      <div class="form-group">
        <label for="password">비밀번호</label>
        <input
          type="password"
          id="password"
          v-model="formData.password"
          required
          placeholder="비밀번호 입력"
          :class="{ 'input-error': !validations.password.valid }"
          @blur="validatePassword"
          :disabled="isLoading"
        />
        <span v-if="!validations.password.valid" class="error">{{ validations.password.message }}</span>
      </div>

      <!-- 서버 오류 메시지 -->
      <div v-if="error" class="error-message">
        <i class="error-icon">⚠️</i> {{ error }}
      </div>

      <button type="submit" :disabled="isLoading || !isFormValid" class="login-btn">
        {{ isLoading ? '로그인 중...' : '로그인' }}
      </button>

      <div class="signup-link">
        <p>아직 회원이 아니신가요? <RouterLink to="/signup">회원가입</RouterLink></p>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// auth 스토어의 상태 가져오기
const isLoading = computed(() => authStore.isLoading)
const error = ref('')

// 폼 유효성 검사 상태 관리
const validations = ref({
  username: { valid: true, message: '' },  // email에서 username으로 변경
  password: { valid: true, message: '' }
})

// 폼 유효성 검사 결과 계산
const isFormValid = computed(() => {
  return validations.value.username.valid && validations.value.password.valid &&
         formData.value.username && formData.value.password;
})

// 폼 데이터
const formData = ref({
  username: '',  // email에서 username으로 변경
  password: ''
})

// 사용자 이름 유효성 검사
const validateUsername = () => {
  if (!formData.value.username) {
    validations.value.username.valid = false
    validations.value.username.message = '사용자 이름을 입력해주세요'
    return false
  } else if (formData.value.username.length < 3) {
    validations.value.username.valid = false
    validations.value.username.message = '사용자 이름은 최소 3자 이상이어야 합니다'
    return false
  } else {
    validations.value.username.valid = true
    validations.value.username.message = ''
    return true
  }
}

// 비밀번호 유효성 검사
const validatePassword = () => {
  if (!formData.value.password) {
    validations.value.password.valid = false
    validations.value.password.message = '비밀번호를 입력해주세요'
    return false
  } else if (formData.value.password.length < 8) {
    validations.value.password.valid = false
    validations.value.password.message = '비밀번호는 최소 8자 이상이어야 합니다'
    return false
  } else {
    validations.value.password.valid = true
    validations.value.password.message = ''
    return true
  }
}

// 로그인 함수
const login = async () => {
  error.value = ''
  
  // 폼 유효성 검사
  const isUsernameValid = validateUsername()
  const isPasswordValid = validatePassword()
  
  if (!isUsernameValid || !isPasswordValid) {
    return
  }
  
  try {
    // auth 스토어의 login 액션 사용
    const result = await authStore.login(formData.value.username, formData.value.password)
    
    if (result.success) {
      console.log('로그인 성공')
      // 로그인 성공 후 홈으로 리다이렉트
      router.push('/')
    } else {
      error.value = result.error || '이메일 또는 비밀번호가 잘못되었습니다'
    }
  } catch (err) {
    console.error('로그인 처리 중 오류:', err)
    error.value = '서버 오류가 발생했습니다. 나중에 다시 시도해주세요.'
  }
}
</script>

<style scoped>
.login-container {
  max-width: 500px;
  margin: 2rem auto;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  background-color: #fff;
  position: relative;
}

.login-container h2 {
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
}

/* 로딩 인디케이터 */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
  border-radius: 8px;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #42b883; /* Vue 색상 */
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.form-disabled {
  opacity: 0.7;
  pointer-events: none;
}

.login-form .form-group {
  margin-bottom: 1.5rem;
  position: relative;
}

.login-form label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #333;
}

.login-form input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s, background-color 0.3s;
}

.login-form input:focus {
  border-color: #42b883;
  outline: none;
  box-shadow: 0 0 0 2px rgba(66, 184, 131, 0.2);
}

.input-error {
  border-color: #e74c3c !important;
  background-color: #fff8f8;
}

.error {
  display: block;
  color: #e74c3c;
  font-size: 0.85rem;
  margin-top: 0.5rem;
}

.error-message {
  background-color: #ffecec;
  color: #e74c3c;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
}

.error-icon {
  margin-right: 8px;
  font-style: normal;
}

.login-btn {
  width: 100%;
  padding: 0.75rem;
  background-color: #42b883; /* Vue 색상으로 변경 */
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.1s;
  position: relative;
  overflow: hidden;
}

.login-btn:hover {
  background-color: #3aa876;
  transform: translateY(-1px);
}

.login-btn:active {
  transform: translateY(1px);
}

.login-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  transform: none;
}

.signup-link {
  text-align: center;
  margin-top: 1.5rem;
}

.signup-link a {
  color: #42b883; /* Vue 색상으로 변경 */
  font-weight: bold;
  text-decoration: none;
  transition: all 0.3s;
}

.signup-link a:hover {
  text-decoration: underline;
  color: #3aa876;
}
</style>
