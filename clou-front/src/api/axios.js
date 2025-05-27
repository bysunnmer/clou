// src/api/axios.js
import axios from 'axios'

// 기본 URL 설정 (공통 기본 경로)
const BASE_URL = 'http://localhost:8001';

// API v1 엔드포인트를 위한 인스턴스
const api = axios.create({
  baseURL: BASE_URL,  // 기본 URL만 설정
  headers: {
    'Content-Type': 'application/json'
  }
});

// 인증 API를 위한 인스턴스 (accounts 엔드포인트용)
const authApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 모든 axios 인스턴스에 토큰 설정을 위한 인터셉터
const setupAuthInterceptor = (axiosInstance) => {
  // 요청 인터셉터: 토큰을 헤더에 추가
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Token ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // 응답 인터셉터: 인증 오류 처리
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      // 401 오류 처리 (인증 오류)
      if (error.response && error.response.status === 401) {
        console.error('인증 오류가 발생했습니다');
        // 로컬 스토리지에서 토큰 정보 제거 (자동 로그아웃 효과)
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      return Promise.reject(error);
    }
  );
};

// 인터셉터 적용
setupAuthInterceptor(api);
setupAuthInterceptor(authApi);

// 디버깅용 설정 (개발 환경에서만 활성화)
if (process.env.NODE_ENV !== 'production') {
  // 모든 요청과 응답을 콘솔에 출력
  api.interceptors.request.use(request => {
    console.log('API 요청:', request);
    return request;
  });
  api.interceptors.response.use(response => {
    console.log('API 응답:', response);
    return response;
  }, error => {
    console.error('API 오류:', error);
    return Promise.reject(error);
  });
}

// 공통 사용을 위해 둘 다 내보냄
export { authApi };
export default api;
