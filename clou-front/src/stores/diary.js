import { defineStore } from 'pinia'
import { 
  fetchDiaries, 
  fetchMonthlyDiaries, 
  fetchDiary, 
  createDiary, 
  updateDiary, 
  deleteDiary 
} from '@/api/diary'

export const useDiaryStore = defineStore('diary', {
  // 상태(state)
  state: () => ({
    diaries: [],
    selectedYear: new Date().getFullYear(),
    selectedMonth: new Date().getMonth() + 1, // JavaScript의 월은 0부터 시작하므로 +1
    currentDiary: null,
    loading: false,
    error: null
  }),

  // 게터(getters)
  getters: {
    // 선택된 월의 다이어리만 필터링
    monthlyDiaries: (state) => {
      return state.diaries.filter(diary => {
        const diaryDate = new Date(diary.date)
        return (
          diaryDate.getFullYear() === state.selectedYear && 
          diaryDate.getMonth() + 1 === state.selectedMonth
        )
      })
    },

    // 날짜별로 그룹화된 다이어리
    diariesByDate: (state) => {
      const grouped = {}
      
      state.diaries.forEach(diary => {
        // 날짜만 추출 (YYYY-MM-DD)
        const dateStr = diary.date
        
        if (!grouped[dateStr]) {
          grouped[dateStr] = []
        }
        
        grouped[dateStr].push(diary)
      })
      
      return grouped
    },

    // 선택된 월에 다이어리가 있는 날짜 목록
    datesWithDiaries: (state) => {
      const dates = new Set()
      
      state.diaries.forEach(diary => {
        const diaryDate = new Date(diary.date)
        if (
          diaryDate.getFullYear() === state.selectedYear && 
          diaryDate.getMonth() + 1 === state.selectedMonth
        ) {
          dates.add(diary.date)
        }
      })
      
      return Array.from(dates).sort()
    },

    // 날짜별 감정 맵 (달력 표시용)
    emotionsByDate: (state) => {
      const emotionMap = {}
      
      state.diaries.forEach(diary => {
        if (diary.emotion && diary.date) {
          emotionMap[diary.date] = diary.emotion_detail || { id: diary.emotion }
        }
      })
      
      return emotionMap
    },

    // 로딩 상태
    isLoading: (state) => state.loading,
    
    // 에러 메시지
    getError: (state) => state.error
  },

  // 액션(actions)
  actions: {
    // 현재 선택된 연도와 월 설정
    setSelectedYearMonth(year, month) {
      this.selectedYear = year
      this.selectedMonth = month
      // 월이 변경되면 해당 월의 다이어리를 가져옴
      this.fetchMonthlyDiaries()
    },

    // 모든 다이어리 가져오기
    async fetchAllDiaries() {
      this.loading = true
      this.error = null
      
      try {
        const response = await fetchDiaries()
        this.diaries = response.data
        return response.data
      } catch (error) {
        this.error = error.message || '다이어리 목록을 불러오는데 실패했습니다.'
        console.error('다이어리 목록 조회 실패:', error)
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    // 월별 다이어리 가져오기
    async fetchMonthlyDiaries() {
      this.loading = true
      this.error = null
      
      try {
        // 월은 1-12 범위로 API에 전달
        const response = await fetchMonthlyDiaries(this.selectedYear, this.selectedMonth)
        this.diaries = response.data
        return response.data
      } catch (error) {
        this.error = error.message || `${this.selectedYear}년 ${this.selectedMonth}월 다이어리를 불러오는데 실패했습니다.`
        console.error('월별 다이어리 조회 실패:', error)
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    // 특정 다이어리 가져오기
    async fetchDiaryById(id) {
      this.loading = true
      this.error = null
      
      try {
        const response = await fetchDiary(id)
        this.currentDiary = response.data
        return response.data
      } catch (error) {
        this.error = error.message || `다이어리 #${id}를 불러오는데 실패했습니다.`
        console.error(`다이어리 #${id} 조회 실패:`, error)
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    // 다이어리 생성하기
    async createNewDiary(diaryData) {
      this.loading = true
      this.error = null
      
      try {
        // 날짜 데이터 검증
        if (!diaryData.date) {
          throw new Error('날짜는 필수 입력 항목입니다.')
        }
        
        const response = await createDiary(diaryData)
        
        // 새 다이어리를 목록에 추가
        const newDiary = response.data
        this.diaries.push(newDiary)
        
        // 현재 선택된 다이어리를 새로 생성한 다이어리로 설정
        this.currentDiary = newDiary
        
        return { success: true, data: newDiary }
      } catch (error) {
        this.error = error.message || '다이어리 생성에 실패했습니다.'
        console.error('다이어리 생성 실패:', error)
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    // 다이어리 수정하기
    async updateDiaryById(id, diaryData) {
      this.loading = true
      this.error = null
      
      try {
        const response = await updateDiary(id, diaryData)
        const updatedDiary = response.data
        
        // 다이어리 목록에서 해당 다이어리 업데이트
        const index = this.diaries.findIndex(d => d.id === id)
        if (index !== -1) {
          this.diaries[index] = updatedDiary
        }
        
        // 현재 선택된 다이어리가 수정된 다이어리인 경우 업데이트
        if (this.currentDiary && this.currentDiary.id === id) {
          this.currentDiary = updatedDiary
        }
        
        return { success: true, data: updatedDiary }
      } catch (error) {
        this.error = error.message || `다이어리 #${id} 수정에 실패했습니다.`
        console.error(`다이어리 #${id} 수정 실패:`, error)
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    // 다이어리 삭제하기
    async deleteDiaryById(id) {
      this.loading = true
      this.error = null
      
      try {
        await deleteDiary(id)
        
        // 다이어리 목록에서 삭제된 다이어리 제거
        this.diaries = this.diaries.filter(d => d.id !== id)
        
        // 현재 선택된 다이어리가 삭제된 다이어리인 경우 null로 설정
        if (this.currentDiary && this.currentDiary.id === id) {
          this.currentDiary = null
        }
        
        return { success: true }
      } catch (error) {
        this.error = error.message || `다이어리 #${id} 삭제에 실패했습니다.`
        console.error(`다이어리 #${id} 삭제 실패:`, error)
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    // 선택된 다이어리 설정
    setCurrentDiary(diary) {
      this.currentDiary = diary
    },

    // 에러 초기화
    clearError() {
      this.error = null
    }
  }
})
