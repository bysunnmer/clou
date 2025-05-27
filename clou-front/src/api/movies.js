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
    console.log('[API] toggleMovieLike 호출:', tmdbId)
    const response = await api.post(`/api/v1/movies/${tmdbId}/like/`)
    console.log('[API] toggleMovieLike 응답:', response.data)
    return handleApiSuccess(response)
  } catch (error) {
    console.error('[API] toggleMovieLike 오류:', error)
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

// 사용자별 찜한 영화 목록 조회 (전체 영화 목록에서 좋아요 표시된 영화만 필터링)
export const fetchUserLikedMovies = async () => {
  try {
    console.log('[API] fetchUserLikedMovies 호출 - 전체 영화 목록을 가져와서 필터링')
    try {
      // 전체 영화 목록을 가져옵니다
      const response = await api.get('/api/v1/movies/')
      // 응답이 배열인지 확인 (데이터 형식 오류 방지)
      const movies = Array.isArray(response.data) ? response.data : []
      // 응답에서 is_liked가 true인 영화만 필터링합니다
      const likedMovies = movies.filter(movie => movie.is_liked === true)
      console.log('[API] fetchUserLikedMovies 필터링된 결과:', likedMovies.length)
      return {
        success: true,
        data: likedMovies
      }
    } catch (apiError) {
      console.warn('[API] 영화 목록 API 호출 실패, 빈 결과 반환:', apiError)
      // API 호출 실패 시에도 빈 배열 반환하여 UI 렌더링은 가능하게 함
      return {
        success: true,
        data: []
      }
    }
  } catch (error) {
    console.error('[API] fetchUserLikedMovies 치명적 오류:', error)
    // 치명적 오류가 발생해도 빈 배열을 반환하여 UI 표시는 가능하도록 함
    return { 
      success: false, 
      data: [], 
      message: '찜한 영화를 불러오는 중 오류가 발생했습니다.'
    }
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

// 사용자 리뷰 목록 조회 - 백엔드 API 활용
export const fetchUserReviews = async (username = null) => {
  try {
    console.log('[API] fetchUserReviews 호출 - 백엔드 API 사용')
    
    // 사용자 정보 확인
    const userData = localStorage.getItem('user')
    if (!userData && !username) {
      console.warn('[API] 로그인 정보가 없습니다.')
      return { success: false, data: [], message: '로그인이 필요합니다.' }
    }
    
    try {
      // 사용자별 리뷰 API 엔드포인트 결정
      let apiUrl = '/api/v1/movies/user/reviews/'; // 현재 로그인한 사용자의 리뷰
      
      if (username) {
        apiUrl = `/api/v1/movies/user/${username}/reviews/`; // 특정 사용자의 리뷰
        console.log(`[API] 사용자 ${username}의 리뷰 조회`);
      } else {
        console.log('[API] 현재 로그인한 사용자의 리뷰 조회');
      }
      
      // 백엔드 API 호출
      const response = await api.get(apiUrl);
      const reviews = response.data || [];
      
      console.log(`[API] 사용자 리뷰 ${reviews.length}개 발견`);
      
      // 리뷰 데이터 처리 - 영화 정보가 필요한 경우 추가 처리
      const processedReviews = reviews.map(review => {
        let processedReview = { ...review };
        
        // 백엔드에서 영화 정보가 포함되어 있는지 확인
        if (review.movie_info && (!review.movie || !review.movie.tmdb_id)) {
          // movie_info를 movie로 변환
          processedReview.movie = review.movie_info;
          console.log('[API] 영화 정보 연결:', processedReview.movie);
        } else if (!review.movie) {
          // 영화 정보가 없는 경우 (방어 코드)
          processedReview.movie = {
            tmdb_id: review.movie_id || 0,
            title: '정보 없음',
            poster_path: null
          };
          console.warn('[API] 리뷰에 영화 정보가 없습니다:', review);
        }
        
        return processedReview;
      });
      
      if (processedReviews.length > 0) {
        console.log('[API] 첫 번째 사용자 리뷰 예시:', processedReviews[0]);
      } else {
        console.log('[API] 사용자 리뷰가 없습니다.');
      }
      
      return {
        success: true,
        data: processedReviews
      };
    } catch (apiError) {
      console.error('[API] 사용자 리뷰 API 호출 실패:', apiError);
      
      // 백엔드 API 호출 실패 시 빈 배열 반환
      return {
        success: false,
        data: [],
        message: '리뷰를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
      };
    }
  } catch (error) {
    console.error('[API] fetchUserReviews 오류:', error);
    return { 
      success: false, 
      data: [], 
      message: '리뷰를 불러오는 중 오류가 발생했습니다.'
    };
  }
}

