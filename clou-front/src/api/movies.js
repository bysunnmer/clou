// src/api/movies.js
import api from './axios'

// ✅ 전체 영화 리스트 조회
export const fetchMovies = () => {
  return api.get('/movies/')
}

// ✅ 영화 상세 조회
export const fetchMovieById = (id) => {
  return api.get(`/movies/${id}/`)
}

// ✅ 영화 찜
export const likeMovie = async (movieId) => {
    try {
      return await api.post(`/movies/${movieId}/like/`)
    } catch (err) {
      throw err 
    }
  }

// ✅ 영화 찜 해제
export const unlikeMovie = async (movieId) => {
    try {
      return await api.delete(`/movies/${movieId}/like/`)
    } catch (err) {
      throw err  
    }
  }

// ✅ 리뷰 삭제
export const deleteReview = (reviewId) => {
  return api.delete(`/reviews/${reviewId}/`)
}

// ✅ 리뷰 좋아요/취소
export const toggleReviewLike = (reviewId, liked) => {
  return liked
    ? api.delete(`/reviews/${reviewId}/like/`)
    : api.post(`/reviews/${reviewId}/like/`)
}

// ✅ 영화 검색
export const searchMovies = (query) => {
  return api.get(`/movies/search/?query=${encodeURIComponent(query)}`)
}

