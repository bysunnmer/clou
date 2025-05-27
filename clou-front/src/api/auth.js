// src/api/auth.js
import { authApi } from './axios'

/**
 * API 응답 처리 유틸리티 함수
 */

// 응답 오류 처리 유틸리티 함수
const handleApiError = (error) => {
  console.error('API 호출 오류:', error);
  
  // 서버 응답이 있는 경우 (서버에서 반환한 오류)
  if (error.response) {
    const { status, data } = error.response
    
    // 401 Unauthorized: 인증 오류
    if (status === 401) {
      return {
        success: false,
        status,
        message: '로그인해주세요.',
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
    
    // 403 Forbidden: 권한 없음
    if (status === 403) {
      return {
        success: false,
        status,
        message: '이 작업을 수행할 권한이 없습니다.',
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

/**
 * 인증 관련 서비스
 * 모든 인증 API 호출과 관련된 작업을 처리합니다.
 */
export const authService = {
  // 회원가입 API
  register: async (userData) => {
    try {
      const response = await authApi.post('/accounts/signup/', userData)
      return handleApiSuccess(response)
    } catch (error) {
      return handleApiError(error)
    }
  },

  // 로그인 API
  login: async (credentials) => {
    try {
      const response = await authApi.post('/accounts/login/', credentials)
      
      // 응답에서 토큰 추출하여 로컬스토리지에 저장
      if (response.data && response.data.key) {
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
      const response = await authApi.post('/accounts/logout/')
      
      // 로컬스토리지에서 토큰 제거
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      
      return handleApiSuccess(response)
    } catch (error) {
      // 네트워크 오류가 있어도 클라이언트에서는 로그아웃 처리
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      return handleApiError(error)
    }
  },
  
  // 사용자 정보 조회 API
  getUserProfile: async () => {
    try {
      const response = await authApi.get('/accounts/user/')
      return handleApiSuccess(response)
    } catch (error) {
      return handleApiError(error)
    }
  },
  
  // 사용자 프로필 업데이트 API
  updateUserProfile: async (profileData) => {
    try {
      const response = await authApi.put('/accounts/user/', profileData)
      return handleApiSuccess(response)
    } catch (error) {
      return handleApiError(error)
    }
  },
  
  // 비밀번호 변경 API
  changePassword: async (passwordData) => {
    try {
      const response = await authApi.post('/accounts/password/change/', passwordData)
      return handleApiSuccess(response)
    } catch (error) {
      return handleApiError(error)
    }
  },
  
  // 사용자 이름 중복 체크
  checkUsernameExists: async (username) => {
    try {
      // GET 대신 POST 메서드 사용
      const response = await authApi.post(`/accounts/check-username/`, { username })
      return handleApiSuccess(response)
    } catch (error) {
      return handleApiError(error)
    }
  },
  
  // 이메일 중복 체크
  checkEmailExists: async (email) => {
    try {
      // GET 대신 POST 메서드 사용
      const response = await authApi.post(`/accounts/check-email/`, { email })
      return handleApiSuccess(response)
    } catch (error) {
      return handleApiError(error)
    }
  },
  
  // 닉네임 중복 체크 - 이 함수가 없어서 추가
  checkNicknameExists: async (nickname) => {
    try {
      const response = await authApi.post(`/accounts/check-nickname/`, { nickname })
      return handleApiSuccess(response)
    } catch (error) {
      return handleApiError(error)
    }
  },
  
  // 인증 상태 확인 (현재 토큰이 유효한지 확인)
  verifyAuth: async () => {
    // 토큰이 없으면 인증되지 않음
    if (!localStorage.getItem('token')) {
      return { success: false, authenticated: false }
    }
    
    try {
      // 사용자 정보를 가져와서 인증 상태 확인
      const response = await authApi.get('/accounts/user/')
      return {
        success: true,
        authenticated: true,
        user: response.data
      }
    } catch (error) {
      // 오류가 발생하면 인증되지 않음
      localStorage.removeItem('token') // 잘못된 토큰 삭제
      return {
        success: false,
        authenticated: false,
        error: handleApiError(error)
      }
    }
  }
};

// 오류 및 성공 처리 함수 외부로 내보내기
export { handleApiError, handleApiSuccess };
