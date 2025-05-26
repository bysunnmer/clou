import { defineStore } from 'pinia'
import axios from 'axios'

// API 기본 URL 설정
const API_BASE_URL = 'http://localhost:8000'

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
    // 사용자 이름 중복 확인
    async checkUsernameExists(username) {
      try {
        const response = await axios.post(`${API_BASE_URL}/accounts/check-username/`, { username })
        this.fieldExists.username = response.data.exists
        return response.data.exists
      } catch (error) {
        console.error('사용자 이름 중복 확인 오류:', error)
        return false
      }
    },

    // 이메일 중복 확인
    async checkEmailExists(email) {
      try {
        const response = await axios.post(`${API_BASE_URL}/accounts/check-email/`, { email })
        this.fieldExists.email = response.data.exists
        return response.data.exists
      } catch (error) {
        console.error('이메일 중복 확인 오류:', error)
        return false
      }
    },

    // 닉네임 중복 확인
    async checkNicknameExists(nickname) {
      try {
        const response = await axios.post(`${API_BASE_URL}/accounts/check-nickname/`, { nickname })
        this.fieldExists.nickname = response.data.exists
        return response.data.exists
      } catch (error) {
        console.error('닉네임 중복 확인 오류:', error)
        return false
      }
    },
    // 로그인 액션
    async login(username, password) {
      this.loading = true
      this.error = null

      try {
        const response = await axios.post(`${API_BASE_URL}/accounts/login/`, {
          username,  // 사용자 이름 직접 전달
          password,
        })

        // dj-rest-auth는 로그인 시 key (토큰)만 반환
        const token = response.data.key
        
        if (!token) {
          throw new Error('토큰이 받아지지 않았습니다')
        }

        // 상태 업데이트
        this.token = token
        this.isAuthenticated = true  // 인증 상태 업데이트
        
        // 로컬 스토리지에 토큰 저장
        localStorage.setItem('token', token)
        
        // Axios 인터셉터 설정
        this.setupInterceptors()
        
        // 사용자 정보 가져오기
        await this.fetchUserProfile()

        return { success: true }
      } catch (error) {
        // 에러 처리
        this.error = error.response?.data?.non_field_errors?.[0] || 
                    '로그인 중 오류가 발생했습니다'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    // 회원가입 액션
    async register(userData) {
      this.loading = true
      this.error = null
      
      // dj-rest-auth 필드 형식에 맞게 데이터 구성
      const registrationData = {
        username: userData.username,
        email: userData.email,
        nickname: userData.nickname,
        password1: userData.password1,
        password2: userData.password2,
      };
      
      try {
        // 회원가입 API 요청
        const response = await axios.post(`${API_BASE_URL}/accounts/signup/`, registrationData)
        return { success: true, data: response.data }
      } catch (error) {
        // 오류 처리
        let errorObj = {}
        
        if (error.response) {
          // 서버에서 반환된 오류 처리
          if (error.response.status === 500) {
            const errorHtml = error.response.data;
            
            // 일반적인 중복 오류 패턴 검사
            if (errorHtml && errorHtml.includes('UNIQUE constraint failed')) {
              // 닉네임 중복
              if (errorHtml.includes('accounts_user.nickname')) {
                errorObj = { nickname: ['이미 사용 중인 닉네임입니다.'] };
              } 
              // 사용자 이름 중복
              else if (errorHtml.includes('accounts_user.username')) {
                errorObj = { username: ['이미 사용 중인 사용자 이름입니다.'] };
              }
              // 이메일 중복
              else if (errorHtml.includes('accounts_user.email')) {
                errorObj = { email: ['이미 사용 중인 이메일입니다.'] };
              }
              // 기타 데이터베이스 제약조건 오류
              else {
                errorObj = { non_field_errors: ['데이터베이스 오류가 발생했습니다.'] };
              }
            } else {
              // 기타 500 오류
              errorObj = { non_field_errors: ['서버 오류가 발생했습니다.'] };
            }
          } 
          // 400 오류 (Django DRF에서 반환하는 JSON 형식)
          else if (typeof error.response.data === 'object') {
            errorObj = error.response.data;
          } 
          // 기타 오류
          else {
            errorObj = { non_field_errors: ['회원가입 중 오류가 발생했습니다.'] };
          }
        } else {
          // 서버 연결 자체가 안 되는 경우
          errorObj = { non_field_errors: ['서버에 연결할 수 없습니다.'] };
        }
        
        this.error = '회원가입 중 오류가 발생했습니다'
        return { success: false, errors: errorObj }
      } finally {
        this.loading = false
      }
    },

    // 로그아웃 액션
    async logout() {
      this.loading = true

      try {
        // 토큰이 있을 경우에만 서버에 로그아웃 요청
        if (this.token) {
          await axios.post(
            'http://localhost:8000/accounts/logout/',
            {},
            { headers: { Authorization: `Token ${this.token}` } }
          )
        }

        // 상태 초기화
        this.token = null
        this.user = null
        this.isAuthenticated = false  // 인증 상태 초기화

        // 로컬 스토리지 정리
        localStorage.removeItem('token')
        localStorage.removeItem('user')

        return { success: true }
      } catch (error) {
        console.error('로그아웃 오류:', error)
        // 오류가 발생해도 클라이언트 측 로그아웃은 처리
        this.token = null
        this.user = null
        localStorage.removeItem('token')
        localStorage.removeItem('user')

        return { success: true }
      } finally {
        this.loading = false
      }
    },

    // 사용자 정보 조회 액션
    async fetchUserProfile() {
      if (!this.token) return { success: false, error: '인증되지 않은 사용자' }

      this.loading = true

      try {
        const response = await axios.get('http://localhost:8000/accounts/user/', {
          headers: { Authorization: `Token ${this.token}` }
        })

        // 사용자 정보 업데이트
        this.user = response.data
        localStorage.setItem('user', JSON.stringify(response.data))

        return { success: true, data: response.data }
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
    initAuth() {
      const token = localStorage.getItem('token')
      if (token) {
        // 토큰이 있으면 인증 상태 활성화
        this.token = token
        this.isAuthenticated = true
        this.setupInterceptors()
        // 사용자 정보 새로 조회 (최신 상태 유지를 위해 활성화)
        this.fetchUserProfile()
      }
    },

    // Axios 인터셉터 설정
    setupInterceptors() {
      // 요청 인터셉터 - 인증 토큰 추가
      axios.interceptors.request.use(
        (config) => {
          // 토큰이 있으면 Authorization 헤더에 추가
          if (this.token) {
            config.headers.Authorization = `Token ${this.token}`
          }
          return config
        },
        (error) => Promise.reject(error)
      )

      // 응답 인터셉터 - 401 오류 처리
      axios.interceptors.response.use(
        (response) => response,
        (error) => {
          // 인증 오류인 경우 로그아웃 처리
          if (error.response?.status === 401) {
            this.logout()
          }
          return Promise.reject(error)
        }
      )
    },
  },
})
