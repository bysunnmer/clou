import { defineStore } from 'pinia'
import { fetchEmotions, fetchMoviesByEmotion } from '@/api/emotions'

export const useEmotionStore = defineStore('emotion', {
  state: () => ({
    emotions: [],
    selectedEmotion: null,
    moviesByEmotion: [],
    loading: false,
    error: null
  }),

  getters: {
    // 로딩 상태
    isLoading: (state) => state.loading,
    
    // 에러 메시지
    getError: (state) => state.error,
    
    // 감정 이름으로 감정 객체 조회
    getEmotionByName: (state) => (name) => {
      return state.emotions.find(emotion => emotion.name === name)
    }
  },

  actions: {
    // 모든 감정 목록 가져오기
    async fetchEmotions() {
      this.loading = true
      this.error = null
      
      try {
        const response = await fetchEmotions()
        this.emotions = response.data
        return response.data
      } catch (error) {
        this.error = error.message || '감정 목록을 불러오는데 실패했습니다.'
        console.error('감정 목록 조회 실패:', error)
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    // 특정 감정에 해당하는 영화 목록 가져오기
    async fetchMoviesByEmotion(emotionName) {
      this.loading = true
      this.error = null
      
      try {
        const response = await fetchMoviesByEmotion(emotionName)
        this.moviesByEmotion = response.data
        
        // 선택된 감정 설정
        const selectedEmotion = this.emotions.find(emotion => emotion.name === emotionName)
        if (selectedEmotion) {
          this.selectedEmotion = selectedEmotion
        }
        
        return response.data
      } catch (error) {
        this.error = error.message || `'${emotionName}' 감정의 영화 목록을 불러오는데 실패했습니다.`
        console.error(`'${emotionName}' 감정의 영화 목록 조회 실패:`, error)
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    // 선택된 감정 설정
    setSelectedEmotion(emotion) {
      this.selectedEmotion = emotion
    },

    // 에러 초기화
    clearError() {
      this.error = null
    }
  }
})
