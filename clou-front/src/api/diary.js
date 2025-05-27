// src/api/diary.js
import api from './axios'

/**
 * 모든 다이어리 항목 조회
 * @returns {Promise} 모든 다이어리 항목
 */
export const fetchDiaries = () => {
  try {
    return api.get('diary/')
  } catch (error) {
    console.error('다이어리 목록 조회 실패:', error)
    throw error
  }
}

/**
 * 월별 다이어리 항목 조회
 * @param {number} year - 연도
 * @param {number} month - 월(1-12)
 * @returns {Promise} 해당 월의 다이어리 항목
 */
export const fetchMonthlyDiaries = (year, month) => {
  try {
    // 월은 1-12 범위로 전달해야 함
    if (month < 1 || month > 12) {
      throw new Error('월은 1부터 12 사이의 값이어야 합니다.')
    }
    return api.get(`diary/monthly/${year}/${month}/`)
  } catch (error) {
    console.error(`${year}년 ${month}월 다이어리 조회 실패:`, error)
    throw error
  }
}

/**
 * 특정 다이어리 항목 조회
 * @param {number} id - 다이어리 ID
 * @returns {Promise} 다이어리 항목 상세 정보
 */
export const fetchDiary = (id) => {
  try {
    return api.get(`diary/${id}/`)
  } catch (error) {
    console.error(`다이어리 #${id} 조회 실패:`, error)
    throw error
  }
}

/**
 * 새 다이어리 항목 생성
 * @param {Object} diaryData - 다이어리 데이터 (date, note, emotion, movie)
 * @returns {Promise} 생성된 다이어리 항목
 */
export const createDiary = (diaryData) => {
  try {
    // date 필드가 있는지 검증
    if (!diaryData.date) {
      throw new Error('날짜(date)는 필수 입력 항목입니다.')
    }
    return api.post('diary/', diaryData)
  } catch (error) {
    console.error('다이어리 생성 실패:', error)
    throw error
  }
}

/**
 * 다이어리 항목 수정
 * @param {number} id - 다이어리 ID
 * @param {Object} diaryData - 수정할 다이어리 데이터
 * @returns {Promise} 수정된 다이어리 항목
 */
export const updateDiary = (id, diaryData) => {
  try {
    return api.put(`diary/${id}/`, diaryData)
  } catch (error) {
    console.error(`다이어리 #${id} 수정 실패:`, error)
    throw error
  }
}

/**
 * 다이어리 항목 삭제
 * @param {number} id - 다이어리 ID
 * @returns {Promise} 응답 객체
 */
export const deleteDiary = (id) => {
  try {
    return api.delete(`diary/${id}/`)
  } catch (error) {
    console.error(`다이어리 #${id} 삭제 실패:`, error)
    throw error
  }
}

/**
 * 인증 오류 처리를 위한 유틸리티 함수
 * API 호출 시 401 오류가 발생하면 사용자에게 알림
 * @param {Error} error - 에러 객체
 * @returns {Object} - 포맷된 에러 응답
 */
export const handleAuthError = (error) => {
  // 인증 오류 (401)
  if (error.response && error.response.status === 401) {
    console.warn('인증이 필요합니다. 로그인 페이지로 이동합니다.')
    // 실제 프로덕션에서는 여기에 로그인 페이지로 리다이렉트 등의 처리를 추가
  }
  
  return {
    success: false,
    message: error.response?.data?.message || '다이어리 API 호출 중 오류가 발생했습니다.',
    error: error.response?.data || error.message
  }
}
