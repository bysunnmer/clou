<template>
  <div class="signup-container">
    <h2>회원가입 🚀</h2>
    <form @submit.prevent="register" class="signup-form">
      <div class="form-group">
        <label for="username">사용자 이름</label>
        <input
          type="text"
          id="username"
          v-model="formData.username"
          required
          placeholder="사용자 이름 입력"
          :class="{ 'input-error': !validations.username.valid }"
          @blur="checkUsernameExists"
        />
        <div class="error-message" v-if="!validations.username.valid">
          {{ validations.username.message }}
        </div>
        <div class="error-message" v-if="errors.username">
          {{ errors.username[0] }}
        </div>
      </div>

      <div class="form-group">
        <label for="email">이메일</label>
        <input
          type="email"
          id="email"
          v-model="formData.email"
          required
          placeholder="이메일 입력"
          :class="{ 'input-error': !validations.email.valid }"
          @blur="checkEmailExists"
        />
        <span v-if="!validations.email.valid" class="error">{{ validations.email.message }}</span>
        <span v-else-if="errors.email" class="error">{{ errors.email[0] }}</span>
      </div>

      <div class="form-group">
        <label for="nickname">닉네임</label>
        <input
          type="text"
          id="nickname"
          v-model="formData.nickname"
          required
          placeholder="닉네임 입력"
          :class="{ 'input-error': !validations.nickname.valid }"
          @blur="checkNicknameExists"
        />
        <span v-if="!validations.nickname.valid" class="error">{{ validations.nickname.message }}</span>
        <span v-else-if="errors.nickname" class="error">{{ errors.nickname[0] }}</span>
      </div>

      <div class="form-group">
        <label for="password1">비밀번호</label>
        <input
          type="password"
          id="password1"
          v-model="formData.password1"
          required
          placeholder="비밀번호 입력"
          :class="{ 'input-error': !validations.password1.valid }"
        />
        <span v-if="!validations.password1.valid" class="error">{{ validations.password1.message }}</span>
        <span v-else-if="errors.password1" class="error">{{ errors.password1[0] }}</span>
        <small class="password-hint">* 비밀번호는 최소 8자 이상이어야 합니다</small>
      </div>

      <div class="form-group">
        <label for="password2">비밀번호 확인</label>
        <input
          type="password"
          id="password2"
          v-model="formData.password2"
          required
          placeholder="비밀번호 다시 입력"
          :class="{ 'input-error': !validations.password2.valid }"
        />
        <span v-if="!validations.password2.valid" class="error">{{ validations.password2.message }}</span>
        <span v-else-if="errors.password2" class="error">{{ errors.password2[0] }}</span>
      </div>

      <!-- 서버 오류 메시지 표시 -->
      <div v-if="errors.non_field_errors" class="non-field-error">
        {{ errors.non_field_errors[0] }}
      </div>

      <button type="submit" :disabled="isLoading || !isFormValid" class="signup-btn">
        {{ isLoading ? '처리 중...' : '회원가입' }}
      </button>

      <div class="login-link">
        <p>이미 계정이 있으신가요? <RouterLink to="/login">로그인</RouterLink></p>
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

// Auth 스토어의 상태 가져오기
const isLoading = computed(() => authStore.isLoading)

// 오류 처리
const errors = ref({})

// 폼 데이터
const formData = ref({
  username: '',
  email: '',
  nickname: '',
  password1: '',
  password2: ''
})

// 폼 유효성 검사 상태
const validations = ref({
  username: { valid: true, message: '' },
  email: { valid: true, message: '' },
  nickname: { valid: true, message: '' },
  password1: { valid: true, message: '' },
  password2: { valid: true, message: '' }
})

// 폼 유효성 검사 결과
const isFormValid = computed(() => {
  return validations.value.username.valid && 
         validations.value.email.valid && 
         validations.value.nickname.valid && 
         validations.value.password1.valid && 
         validations.value.password2.valid && 
         formData.value.username && 
         formData.value.email && 
         formData.value.nickname && 
         formData.value.password1 && 
         formData.value.password2;
})

// 이메일 형식 검사 함수
const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(String(email).toLowerCase())
}

// 사용자 이름 중복 확인
const checkUsernameExists = async () => {
  if (formData.value.username && formData.value.username.length >= 3) {
    const exists = await authStore.checkUsernameExists(formData.value.username);
    if (exists) {
      validations.value.username.valid = false;
      validations.value.username.message = '이미 사용 중인 사용자 이름입니다';
    }
  }
}

// 이메일 중복 확인
const checkEmailExists = async () => {
  if (formData.value.email && isValidEmail(formData.value.email)) {
    const exists = await authStore.checkEmailExists(formData.value.email);
    if (exists) {
      validations.value.email.valid = false;
      validations.value.email.message = '이미 사용 중인 이메일입니다';
    }
  }
}

// 닉네임 중복 확인
const checkNicknameExists = async () => {
  if (formData.value.nickname && formData.value.nickname.length >= 2) {
    const exists = await authStore.checkNicknameExists(formData.value.nickname);
    if (exists) {
      validations.value.nickname.valid = false;
      validations.value.nickname.message = '이미 사용 중인 닉네임입니다';
    }
  }
}

// 폼 유효성 검사 함수
const validateForm = () => {
  let isValid = true
  
  // 사용자 이름 검사
  if (!formData.value.username || formData.value.username.length < 3) {
    validations.value.username.valid = false
    validations.value.username.message = '사용자 이름은 최소 3자 이상이어야 합니다'
    isValid = false
  } else {
    validations.value.username.valid = true
    validations.value.username.message = ''
  }
  
  // 이메일 검사
  if (!formData.value.email || !isValidEmail(formData.value.email)) {
    validations.value.email.valid = false
    validations.value.email.message = '유효한 이메일 주소를 입력해주세요'
    isValid = false
  } else {
    validations.value.email.valid = true
    validations.value.email.message = ''
  }
  
  // 닉네임 검사
  if (!formData.value.nickname || formData.value.nickname.length < 2) {
    validations.value.nickname.valid = false
    validations.value.nickname.message = '닉네임은 최소 2자 이상이어야 합니다'
    isValid = false
  } else {
    validations.value.nickname.valid = true
    validations.value.nickname.message = ''
  }
  
  // 비밀번호 검사
  if (!formData.value.password1 || formData.value.password1.length < 8) {
    validations.value.password1.valid = false
    validations.value.password1.message = '비밀번호는 최소 8자 이상이어야 합니다'
    isValid = false
  } else {
    validations.value.password1.valid = true
    validations.value.password1.message = ''
  }
  
  // 비밀번호 확인 검사
  if (formData.value.password1 !== formData.value.password2) {
    validations.value.password2.valid = false
    validations.value.password2.message = '비밀번호가 일치하지 않습니다'
    isValid = false
  } else {
    validations.value.password2.valid = true
    validations.value.password2.message = ''
  }
  
  return isValid
}

// 회원가입 함수
const register = async () => {
  // 서버 오류 초기화
  errors.value = {}
  
  // 클라이언트 측 유효성 검사 실행
  if (!validateForm()) {
    return
  }
  
  try {
    // 폼 데이터 로그
    console.log('회원가입 요청 데이터:', formData.value)
    
    // auth 스토어의 register 액션 사용
    const result = await authStore.register(formData.value)
    
    console.log('회원가입 응답:', result)
    
    if (result.success) {
      console.log('회원가입 성공')
      // 성공 메시지 표시 및 로그인 페이지로 리다이렉트
      alert('CLOU에 오신 것을 환영합니다! 로그인하여 영화 감정 여행을 시작해보세요.')
      router.push('/login')
    } else {
      // 서버에서 오는 오류 처리
      console.error('회원가입 실패:', result.errors)
      errors.value = result.errors || {}
      
      // 오류가 없는 경우 기본 오류 메시지 표시
      if (Object.keys(errors.value).length === 0) {
        errors.value.non_field_errors = ['회원가입 중 오류가 발생했습니다']
      }
    }
  } catch (error) {
    console.error('회원가입 처리 중 오류:', error)
    errors.value.non_field_errors = ['서버 오류가 발생했습니다. 나중에 다시 시도해주세요.']
  }
}
</script>

<style scoped>
.signup-container {
  max-width: 500px;
  margin: 2rem auto;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  background-color: #fff;
}

.signup-container h2 {
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
}

.signup-form .form-group {
  margin-bottom: 1.5rem;
}

.signup-form label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #333;
}

.signup-form input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.signup-form input:focus {
  border-color: #666;
  outline: none;
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

.password-hint {
  display: block;
  color: #777;
  font-size: 0.8rem;
  margin-top: 0.3rem;
}

.non-field-error {
  background-color: #ffecec;
  color: #e74c3c;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
  text-align: center;
  font-size: 0.9rem;
}

.signup-btn {
  width: 100%;
  padding: 0.75rem;
  background-color: #222;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
}

.signup-btn:hover {
  background-color: #333;
}

.signup-btn:disabled {
  background-color: #999;
  cursor: not-allowed;
}

.login-link {
  text-align: center;
  margin-top: 1.5rem;
}

.login-link a {
  color: #222;
  font-weight: bold;
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
}
</style>
