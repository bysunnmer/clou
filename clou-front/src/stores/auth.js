import { defineStore } from 'pinia'
import { authApi } from '@/api/axios'
import { authService } from '@/api/auth'

export const useAuthStore = defineStore('auth', {
  // 상태(state)
  state: () => {
    // localStorage에서 사용자 정보 가져오기 안전하게 처리
    let user = null;
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        user = JSON.parse(userStr);
      }
    } catch (e) {
      console.error('사용자 정보 파싱 오류:', e);
      localStorage.removeItem('user');
    }
    
    return {
      // 사용자 인증 정보
      token: localStorage.getItem('token') || null,
      user,
      isAuthenticated: !!localStorage.getItem('token'),
      loading: false,
      error: null,
      // 필드 중복 체크 결과
      fieldExists: {
        username: false,
        email: false,
        nickname: false
      }
    }
  },

  // 계산된 속성(getters)
  getters: {
    isLoading: (state) => state.loading,
    usernameExists: (state) => state.fieldExists.username,
    emailExists: (state) => state.fieldExists.email,
    nicknameExists: (state) => state.fieldExists.nickname,
    getUser: (state) => state.user,
    getToken: (state) => state.token,
    getError: (state) => state.error,
  },

  // 액션(actions)
  actions: {
    // 사용자 이름 중복 체크
    async checkUsernameExists(username) {
      try {
        const result = await authService.checkUsernameExists(username)
        
        if (!result.success) {
          throw new Error(result.message || '사용자 이름 중복 체크 중 오류가 발생했습니다')
        }
        
        this.fieldExists.username = result.data.exists
        return result.data.exists
      } catch (error) {
        console.error('사용자 이름 중복 체크 중 오류:', error)
        return false
      }
    },
    
    // 이메일 중복 체크
    async checkEmailExists(email) {
      try {
        const result = await authService.checkEmailExists(email)
        
        if (!result.success) {
          throw new Error(result.message || '이메일 중복 체크 중 오류가 발생했습니다')
        }
        
        this.fieldExists.email = result.data.exists
        return result.data.exists
      } catch (error) {
        console.error('이메일 중복 체크 중 오류:', error)
        return false
      }
    },

    // 닉네임 중복 확인
    async checkNicknameExists(nickname) {
      try {
        const result = await authService.checkNicknameExists(nickname)
        
        if (!result.success) {
          throw new Error(result.message || '닉네임 중복 체크 중 오류가 발생했습니다')
        }
        
        this.fieldExists.nickname = result.data.exists
        return result.data.exists
      } catch (error) {
        console.error('닉네임 중복 체크 중 오류:', error)
        return false
      }
    },
    // 로그인 액션
    async login(username, password) {
      this.loading = true
      this.error = null

      try {
        // authService를 사용하여 로그인 요청
        const result = await authService.login({ username, password })
        
        if (!result.success) {
          throw new Error(result.message || '로그인 중 오류가 발생했습니다')
        }
        
        // 토큰은 authService에서 이미 localStorage에 저장됨
        const token = localStorage.getItem('token')
        
        if (!token) {
          throw new Error('토큰이 설정되지 않았습니다')
        }

        // 상태 업데이트
        this.token = token
        this.isAuthenticated = true
        
        // 사용자 정보 가져오기
        await this.fetchUserProfile()

        return { success: true }
      } catch (error) {
        // 에러 처리
        this.error = error.message || '로그인 중 오류가 발생했습니다'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    // 회원가입 액션
    async register(userData) {
      this.loading = true
      this.error = null
      
      // 회원가입 데이터 구성
      const registrationData = {
        username: userData.username,
        email: userData.email,
        nickname: userData.nickname,
        password1: userData.password1,
        password2: userData.password2,
      };
      
      try {
        // authService를 사용하여 회원가입 요청
        const result = await authService.register(registrationData)
        
        if (!result.success) {
          throw new Error(result.message || '회원가입 중 오류가 발생했습니다')
        }
        
        // 회원가입 성공 시 자동 로그인 처리 제거
        // 토큰이 있으면 제거 (회원가입 후 자동 로그인 방지)
        localStorage.removeItem('token')
        this.token = null
        this.isAuthenticated = false
        this.user = null
        
        return { success: true }
      } catch (error) {
        // 에러 처리
        if (error.response && error.response.data) {
          const errorData = error.response.data
          
          // 필드별 오류 메시지 구성
          let errorMessage = ''
          
          if (typeof errorData === 'object') {
            // 각 필드별 오류 메시지를 문자열로 변환
            Object.keys(errorData).forEach(key => {
              const fieldErrors = errorData[key]
              if (Array.isArray(fieldErrors)) {
                errorMessage += `${key}: ${fieldErrors.join(', ')}\n`
              } else {
                errorMessage += `${key}: ${fieldErrors}\n`
              }
            })
          } else {
            errorMessage = error.message || '회원가입 중 오류가 발생했습니다.'
          }
          
          this.error = errorMessage
        } else {
          this.error = error.message || '회원가입 중 오류가 발생했습니다.'
        }
        
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    // 로그아웃 액션
    async logout() {
      this.loading = true

      try {
        // authService를 사용하여 로그아웃 요청
        await authService.logout()
        
        // 상태 초기화 (토큰은 authService에서 이미 제거됨)
        this.token = null
        this.user = null
        this.isAuthenticated = false
      } catch (error) {
        console.error('로그아웃 중 오류:', error)
        // 오류가 발생해도 클라이언트에서는 로그아웃 처리를 진행
        this.token = null
        this.user = null
        this.isAuthenticated = false
      } finally {
        this.loading = false
      }
    },

    // 사용자 정보 조회 액션
    async fetchUserProfile() {
      if (!this.token) return { success: false, error: '인증되지 않은 사용자' }

      this.loading = true

      try {
        const result = await authService.getUserProfile()
        
        if (!result.success) {
          throw new Error(result.message || '사용자 정보 조회 중 오류가 발생했습니다')
        }
        
        // 사용자 정보 업데이트
        this.user = result.data
        localStorage.setItem('user', JSON.stringify(result.data))

        return { success: true, data: result.data }
      } catch (error) {
        console.error('사용자 정보 조회 오류:', error)

        // 인증 오류 (401)인 경우 로그아웃 처리
        if (error.response?.status === 401) {
          this.logout()
          this.error = '세션이 만료되었습니다. 다시 로그인해주세요.'
        } else {
          this.error = '사용자 정보를 불러오는 중 오류가 발생했습니다'
        }

        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    // 인증 상태 초기화 (앱 시작 시 호출)
    async initAuth() {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          // 토큰 검증
          const result = await authService.verifyAuth()
          
          if (result.success && result.authenticated) {
            // 토큰이 유효하면 인증 상태 활성화
            this.token = token
            this.isAuthenticated = true
            this.user = result.user
            
            // 로컬 스토리지에 사용자 정보 업데이트
            try {
              localStorage.setItem('user', JSON.stringify(result.user))
            } catch (e) {
              console.error('사용자 정보 저장 중 오류:', e)
            }
          } else {
            // 토큰이 유효하지 않으면 초기화
            this.token = null
            this.user = null
            this.isAuthenticated = false
            localStorage.removeItem('token')
            localStorage.removeItem('user')
          }
        } catch (error) {
          console.error('인증 확인 중 오류:', error)
          // 오류 발생 시 초기화
          this.token = null
          this.user = null
          this.isAuthenticated = false
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        }
      }
    },
  },
})
