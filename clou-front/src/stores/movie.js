import { defineStore } from 'pinia'
import { 
  fetchMovies, 
  fetchMovieById, 
  toggleMovieLike,
  searchMovies,
  fetchUserLikedMovies
} from '@/api/movies'

export const useMovieStore = defineStore('movie', {
  state: () => ({
    movies: [],
    currentMovie: null,
    likedMovies: [],
    loading: false,
    error: null
  }),

  getters: {
    // 로딩 상태
    isLoading: (state) => state.loading,
    
    // 에러 메시지
    getError: (state) => state.error,
    
    // 찜한 영화 목록
    getLikedMovies: (state) => {
      console.log('[STORE] getLikedMovies getter 호출, 길이:', state.likedMovies.length)
      return state.likedMovies.length > 0 ? state.likedMovies : state.movies.filter(movie => movie.is_liked)
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
      
      console.log('[STORE] toggleLike 시작:', movie)
      
      try {
        // movie.id가 아닌 movie.tmdb_id 사용해야 함
        const tmdbId = movie.tmdb_id
        
        if (!tmdbId) {
          throw new Error('TMDB ID가 없습니다')
        }
        
        // toggleMovieLike API 호출 (백엔드에서 현재 상태를 기반으로 토글 처리함)
        const response = await toggleMovieLike(tmdbId)
        
        console.log('[STORE] toggleLike API 응답:', response)
        
        if (response.success) {
          const liked = response.data.liked
          console.log('[STORE] 토글 결과:', liked ? '찜 추가' : '찜 제거')
          
          // 찜 상태를 변경할 영화 준비
          const updatedMovie = { ...movie, is_liked: liked }
          
          // 1. 현재 영화 목록에서 해당 영화 업데이트
          this.movies = this.movies.map(m => {
            if (m.tmdb_id === tmdbId) {
              console.log('[STORE] 영화 목록 업데이트:', m.title)
              return { ...m, is_liked: liked }
            }
            return m
          })
          
          // 2. 현재 선택된 영화가 있고 그 영화가 토글된 영화라면 업데이트
          if (this.currentMovie && this.currentMovie.tmdb_id === tmdbId) {
            console.log('[STORE] 현재 영화 업데이트:', this.currentMovie.title)
            this.currentMovie = { ...this.currentMovie, is_liked: liked }
          }
          
          // 3. 찜한 영화 목록 업데이트
          if (liked) {
            // 찜했을 경우: 목록에 없으면 추가
            if (!this.likedMovies.some(m => m.tmdb_id === tmdbId)) {
              console.log('[STORE] 찜한 영화 목록에 추가:', updatedMovie.title)
              this.likedMovies.push(updatedMovie)
            }
          } else {
            // 찜 취소했을 경우: 목록에서 제거
            console.log('[STORE] 찜한 영화 목록에서 제거:', updatedMovie.title)
            this.likedMovies = this.likedMovies.filter(m => m.tmdb_id !== tmdbId)
          }
          
          console.log('[STORE] 찜한 영화 목록 현재 길이:', this.likedMovies.length)
          return { success: true, data: updatedMovie }
        } else {
          throw new Error(response.message || '영화 찜하기/해제에 실패했습니다.')
        }
      } catch (error) {
        this.error = error.message || '영화 찜하기/해제에 실패했습니다.'
        console.error('[STORE] 영화 찜하기/해제 실패:', error)
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
    },
    
    // 찜한 영화 목록 가져오기
    async fetchLikedMovies() {
      this.loading = true
      this.error = null
      console.log('[STORE] fetchLikedMovies 시작')
      try {
        const response = await fetchUserLikedMovies()
        console.log('[STORE] fetchLikedMovies 응답:', response)
        if (response.success) {
          this.likedMovies = response.data
          
          // 전체 영화 목록에서 찜한 영화 상태 업데이트 필요한 경우 업데이트
          if (this.movies.length > 0) {
            // likedMovies의 tmdb_id 목록 추출
            const likedMovieIds = this.likedMovies.map(movie => movie.tmdb_id)
            
            // 전체 영화 목록에서 찜한 영화 상태 업데이트
            this.movies = this.movies.map(movie => ({
              ...movie,
              is_liked: likedMovieIds.includes(movie.tmdb_id)
            }))
          }
        } else {
          throw new Error(response.message || '좋아요 목록을 가져오지 못했습니다')
        }
      } catch (error) {
        console.error('[STORE] 좋아요 목록 조회 실패:', error)
        this.error = error.message || '좋아요 목록을 가져오지 못했습니다'
      } finally {
        this.loading = false
      }
    }
  }
})
