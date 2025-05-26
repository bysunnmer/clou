// src/api/auth.js
import axios from 'axios'

// 기본 API 클라이언트 설정
const authApi = axios.create({
  baseURL: 'http://localhost:8000/',
  timeout: 10000, // 요청 타임아웃 10초
  headers: {
    'Content-Type': 'application/json',
  }
})

// 응답 오류 처리 유틸리티 함수
const handleApiError = (error) => {
  // 서버 응답이 있는 경우 (서버에서 반환한 오류)
  if (error.response) {
    const { status, data } = error.response
    
    // 401 Unauthorized: 인증 오류
    if (status === 401) {
      return {
        success: false,
        status,
        message: '인증에 실패했습니다. 다시 로그인해주세요.',
        data
      }
    }
    
    // 400 Bad Request: 입력 오류
    if (status === 400) {
      return {
        success: false,
        status,
        message: '입력 정보가 올바르지 않습니다.',
        data
      }
    }
    
    // 그 외 상태 코드
    return {
      success: false,
      status,
      message: `서버 오류가 발생했습니다 (${status})`,
      data
    }
  }
  
  // 요청은 보냈으나 응답을 받지 못한 경우 (네트워크 오류 등)
  if (error.request) {
    return {
      success: false,
      message: '서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.',
      error: error.request
    }
  }
  
  // 그 외 오류
  return {
    success: false,
    message: '알 수 없는 오류가 발생했습니다.',
    error: error.message
  }
}

// 성공 응답 처리 유틸리티 함수
const handleApiSuccess = (response) => {
  return {
    success: true,
    status: response.status,
    data: response.data
  }
}

// API 요청 함수들
export const authApi = {
  // 회원가입 API
  register: async (userData) => {
    try {
      const response = await authApi.post('accounts/signup/', userData)
      return handleApiSuccess(response)
    } catch (error) {
      return handleApiError(error)
    }
  },

  // 로그인 API
  login: async (credentials) => {
    try {
      const response = await authApi.post('accounts/login/', credentials)
      
      // 응답에서 토큰 추출하여 헤더에 설정
      if (response.data.key) {
        authApi.defaults.headers.common['Authorization'] = `Token ${response.data.key}`
        localStorage.setItem('token', response.data.key)
      }
      
      return handleApiSuccess(response)
    } catch (error) {
      return handleApiError(error)
    }
  },

  // 로그아웃 API
  logout: async () => {
    try {
      const response = await authApi.post('accounts/logout/')
      
      // 헤더에서 인증 정보 제거
      delete authApi.defaults.headers.common['Authorization']
      localStorage.removeItem('token')
      
      return handleApiSuccess(response)
    } catch (error) {
      // 로그아웃 실패해도 클라이언트에서는 토큰 제거
      delete authApi.defaults.headers.common['Authorization']
      localStorage.removeItem('token')
      
      return handleApiError(error)
    }
  },

  // 사용자 정보 조회 API
  getUserProfile: async () => {
    try {
      const response = await authApi.get('accounts/user/')
      return handleApiSuccess(response)
    } catch (error) {
      return handleApiError(error)
    }
  },
  
  // 사용자 프로필 업데이트 API
  updateUserProfile: async (profileData) => {
    try {
      const response = await authApi.put('accounts/user/', profileData)
      return handleApiSuccess(response)
    } catch (error) {
      return handleApiError(error)
    }
  },
  
  // 비밀번호 변경 API
  changePassword: async (passwordData) => {
    try {
      const response = await authApi.post('accounts/password/change/', passwordData)
      return handleApiSuccess(response)
    } catch (error) {
      return handleApiError(error)
    }
  },
  
  // 토큰 설정 (페이지 새로고침 후 등에 사용)
  setAuthToken: (token) => {
    if (token) {
      authApi.defaults.headers.common['Authorization'] = `Token ${token}`
    } else {
      delete authApi.defaults.headers.common['Authorization']
    }
  },
  
  // 초기화 함수 (앱 시작 시 호출)
  initializeAuth: () => {
    const token = localStorage.getItem('token')
    if (token) {
      authApi.defaults.headers.common['Authorization'] = `Token ${token}`
    }
  }
}

// 앱 시작 시 저장된 토큰으로 인증 초기화
authApi.initializeAuth()

export default authApi
