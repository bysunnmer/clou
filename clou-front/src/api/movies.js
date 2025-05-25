// src/api/movies.js
import api from './axios'

// 조회 기능
export const fetchMovies = () => {
  return api.get('movies/')
}

// 찜 기능
export const likeMovie = (movieId) => {
    return api.post(`movies/${movieId}/like/`)
}

// 찜 제거 기능
export const unlikeMovie = (movieId) => {
    return api.delete(`movies/${movieId}/like/`)
}

export const deleteReview = (reviewId) => {
    return api.delete(`reviews/${reviewId}/`)
}
  
// 리뷰 좋아요
export const toggleReviewLike = (reviewId, liked) => {
return liked
    ? api.delete(`reviews/${reviewId}/like/`)
    : api.post(`reviews/${reviewId}/like/`)
}
