// src/api/movies.js
import api from './axios'
import { handleApiError, handleApiSuccess } from './auth'

/**
 * 영화 API 관련 함수들
 * 모든 함수는 try-catch로 감싸서 일관된 오류 처리를 제공합니다.
 */

// 전체 영화 리스트 조회
export const fetchMovies = async () => {
  try {
    const response = await api.get('/api/v1/movies/')
    return handleApiSuccess(response)
  } catch (error) {
    return handleApiError(error)
  }
}

// 영화 상세 조회
export const fetchMovieById = async (tmdbId) => {
  try {
    const response = await api.get(`/api/v1/movies/${tmdbId}/`)
    return handleApiSuccess(response)
  } catch (error) {
    return handleApiError(error)
  }
}

// 영화 찜하기/해제 토글 (같은 엔드포인트로 토글 기능 제공)
export const toggleMovieLike = async (tmdbId) => {
  try {
    const response = await api.post(`/api/v1/movies/${tmdbId}/like/`)
    return handleApiSuccess(response)
  } catch (error) {
    return handleApiError(error)
  }
}

// 리뷰 작성
export const createReview = async (tmdbId, reviewData) => {
  try {
    const response = await api.post(`/api/v1/movies/${tmdbId}/reviews/`, reviewData)
    return handleApiSuccess(response)
  } catch (error) {
    return handleApiError(error)
  }
}

// 리뷰 목록 조회
export const fetchReviews = async (tmdbId) => {
  try {
    const response = await api.get(`/api/v1/movies/${tmdbId}/reviews/`)
    return handleApiSuccess(response)
  } catch (error) {
    return handleApiError(error)
  }
}

// 리뷰 수정
export const updateReview = async (reviewId, reviewData) => {
  try {
    const response = await api.put(`/api/v1/movies/reviews/${reviewId}/`, reviewData)
    return handleApiSuccess(response)
  } catch (error) {
    return handleApiError(error)
  }
}

// 리뷰 삭제
export const deleteReview = async (reviewId) => {
  try {
    const response = await api.delete(`/api/v1/movies/reviews/${reviewId}/`)
    return handleApiSuccess(response)
  } catch (error) {
    return handleApiError(error)
  }
}

// 리뷰 좋아요/취소 토글
export const toggleReviewLike = async (reviewId) => {
  try {
    const response = await api.post(`/api/v1/movies/reviews/${reviewId}/like/`)
    return handleApiSuccess(response)
  } catch (error) {
    return handleApiError(error)
  }
}

// 리뷰 답글 작성
export const createReviewReply = async (reviewId, content) => {
  try {
    const response = await api.post(`/api/v1/movies/reviews/${reviewId}/replies/`, { content })
    return handleApiSuccess(response)
  } catch (error) {
    return handleApiError(error)
  }
}

// 사용자별 찜한 영화 목록 조회
export const fetchUserLikedMovies = async () => {
  try {
    const response = await api.get('/api/v1/movies/user-liked/')
    return handleApiSuccess(response)
  } catch (error) {
    return handleApiError(error)
  }
}

// 리뷰 답글 수정
export const updateReviewReply = async (replyId, content) => {
  try {
    const response = await api.put(`/api/v1/movies/replies/${replyId}/`, content)
    return handleApiSuccess(response)
  } catch (error) {
    return handleApiError(error)
  }
}

// 리뷰 답글 삭제
export const deleteReviewReply = async (replyId) => {
  try {
    const response = await api.delete(`/api/v1/movies/replies/${replyId}/`)
    return handleApiSuccess(response)
  } catch (error) {
    return handleApiError(error)
  }
}

// ✅ 영화 검색
export const searchMovies = (query) => {
  return api.get(`/movies/search/?query=${encodeURIComponent(query)}`)
}

