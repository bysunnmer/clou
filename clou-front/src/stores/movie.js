import { defineStore } from 'pinia'
import { 
  fetchMovies, 
  fetchMovieById, 
  likeMovie, 
  unlikeMovie,
  searchMovies
} from '@/api/movies'

export const useMovieStore = defineStore('movie', {
  state: () => ({
    movies: [],
    currentMovie: null,
    loading: false,
    error: null
  }),

  getters: {
    // 로딩 상태
    isLoading: (state) => state.loading,
    
    // 에러 메시지
    getError: (state) => state.error,
    
    // 찜한 영화 목록
    likedMovies: (state) => {
      return state.movies.filter(movie => movie.is_liked)
    }
  },

  actions: {
    // 영화 목록 가져오기
    async fetchMovies() {
      this.loading = true
      this.error = null
      
      try {
        const response = await fetchMovies()
        this.movies = response.data
        return response.data
      } catch (error) {
        this.error = error.message || '영화 목록을 불러오는데 실패했습니다.'
        console.error('영화 목록 조회 실패:', error)
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    // 특정 영화 상세 정보 가져오기
    async fetchMovieById(id) {
      this.loading = true
      this.error = null
      
      try {
        const response = await fetchMovieById(id)
        this.currentMovie = response.data
        return response.data
      } catch (error) {
        this.error = error.message || `영화 #${id} 정보를 불러오는데 실패했습니다.`
        console.error(`영화 #${id} 조회 실패:`, error)
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    // 영화 찜하기 토글
    async toggleLike(movie) {
      this.loading = true
      this.error = null
      
      try {
        let response
        
        if (movie.is_liked) {
          // 찜 해제
          response = await unlikeMovie(movie.id)
        } else {
          // 찜하기
          response = await likeMovie(movie.id)
        }
        
        // 영화 목록 업데이트
        const updatedMovie = response.data
        
        // 현재 영화 목록에서 해당 영화 업데이트
        const index = this.movies.findIndex(m => m.id === movie.id)
        if (index !== -1) {
          this.movies[index] = { ...this.movies[index], is_liked: !movie.is_liked }
        }
        
        // 현재 선택된 영화가 있고 그 영화가 토글된 영화라면 업데이트
        if (this.currentMovie && this.currentMovie.id === movie.id) {
          this.currentMovie = { ...this.currentMovie, is_liked: !movie.is_liked }
        }
        
        return { success: true, data: updatedMovie }
      } catch (error) {
        this.error = error.message || '영화 찜하기/해제에 실패했습니다.'
        console.error('영화 찜하기/해제 실패:', error)
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    // 현재 선택된 영화 설정
    setCurrentMovie(movie) {
      this.currentMovie = movie
    },

    // 에러 초기화
    clearError() {
      this.error = null
    },
  
    // 영화 검색
    async searchMovies(query) {
      this.loading = true
      this.error = null
      
      try {
        const response = await searchMovies(query)
        return response.data
      } catch (error) {
        this.error = error.message || '영화 검색에 실패했습니다.'
        console.error('영화 검색 실패:', error)
        return []
      } finally {
        this.loading = false
      }
    }
  }
})
