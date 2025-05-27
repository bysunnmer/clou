<template>
  <div class="diary-form-container">
    <!-- 폼 헤더 -->
    <div class="form-header">
      <h2 class="form-title">{{ isEditing ? '다이어리 편집' : '새 다이어리 작성' }}</h2>
      <button 
        class="close-btn" 
        @click="emit('close')"
        aria-label="닫기"
      >
        &times;
      </button>
    </div>
    
    <!-- 날짜 표시 -->
    <div class="form-date-display">
      <span class="current-date-badge">{{ formatDisplayDate(form.date) }}</span>
    </div>

    <form @submit.prevent="handleSubmit">
      <div class="form-group date-group">
        <label for="date" class="form-label">
          <span class="label-icon">📅</span>
          날짜
        </label>
        <input 
          type="date" 
          id="date" 
          v-model="form.date" 
          required 
          :disabled="isDateLocked"
          class="form-control date-picker"
          aria-describedby="date-description"
        >
        <small id="date-description" class="form-text">
          다이어리를 등록할 날짜를 선택해주세요
        </small>
      </div>

      <div class="form-group emotion-group">
        <label for="emotion" class="form-label">
          <span class="label-icon">😊</span>
          오늘의 감정
        </label>
        
        <!-- 감정 칩스 -->
        <div class="emotion-chips">
          <button 
            v-for="emotion in emotions" 
            :key="emotion.id"
            type="button"
            class="emotion-chip" 
            :class="[getEmotionClass(emotion), { active: form.value.emotion === emotion.id }]"
            @click="selectEmotion(emotion.id)"
          >
            <span class="emotion-icon">{{ getEmotionIcon(emotion.id) }}</span>
            <span class="emotion-name">{{ emotion.name }}</span>
          </button>
        </div>
        
        <!-- 감정 셀렉트 -->
        <div class="emotion-selector">
          <select 
            id="emotion"
            v-model="form.emotion"
            class="form-control emotion-select"
          >
            <option value="">감정을 선택해주세요</option>
            <option 
              v-for="emotion in emotions" 
              :key="emotion.id" 
              :value="emotion.id"
            >
              {{ emotion.name }}
            </option>
          </select>
          <div class="emotion-preview">
            {{ getEmotionIcon(form.emotion) }}
          </div>
        </div>
        
        <small class="form-text">오늘 느끼는 감정을 선택해주세요.</small>
      </div>
      
      <!-- 영화 선택 -->
      <div class="form-group">
        <label for="movie" class="form-label">
          <span class="label-icon">🎬</span>
          오늘의 영화
        </label>
        
        <!-- 영화 검색 -->
        <div class="movie-search-container">
          <div class="search-bar" v-if="!form.movie">
            <input 
              type="text" 
              v-model="movieSearchQuery" 
              placeholder="영화 제목을 검색하세요" 
              @input="handleMovieSearch"
              @focus="showMovieResults = true"
              class="form-control"
              aria-label="영화 검색"
            />
            <button 
              type="button" 
              class="search-btn" 
              @click="searchMovies"
              aria-label="영화 검색"
            >
              <span v-if="isSearching" class="spinner"></span>
              <span v-else>🔍</span>
            </button>
          </div>
          
          <!-- 검색 결과 -->
          <div 
            v-if="showMovieResults && movieSearchResults.length > 0" 
            class="movie-search-results"
            role="listbox"
            aria-label="영화 검색 결과"
          >
            <div 
              v-for="movie in movieSearchResults" 
              :key="movie.id" 
              class="search-result-item"
              @click="selectMovie(movie)"
              role="option"
              :aria-selected="false"
              tabindex="0"
              @keydown.enter="selectMovie(movie)"
            >
              <div class="movie-preview">
                <img 
                  v-if="movie.poster_path" 
                  :src="'https://image.tmdb.org/t/p/w92' + movie.poster_path" 
                  :alt="movie.title" 
                  loading="lazy"
                />
                <span v-else class="no-poster">이미지 없음</span>
              </div>
              <div class="movie-info">
                <h4>{{ movie.title }}</h4>
                <p>{{ movie.release_date ? movie.release_date.substring(0, 4) : '개봉일 미정' }}</p>
              </div>
            </div>
          </div>
          
          <!-- 검색 결과 없음 -->
          <div 
            v-if="showMovieResults && movieSearchQuery && movieSearchResults.length === 0 && !isSearching" 
            class="no-results"
          >
            {{ movieSearchError || '검색 결과가 없습니다.' }}
          </div>
          
          <!-- 검색 중 -->
          <div 
            v-if="isSearching" 
            class="searching-indicator"
          >
            <span class="spinner"></span> 영화 검색 중...
          </div>
          
          <!-- 선택한 영화 표시 -->
          <div v-if="form.movie" class="selected-movie">
            <div class="movie-preview">
              <img 
                v-if="selectedMovie && selectedMovie.poster_path" 
                :src="'https://image.tmdb.org/t/p/w92' + selectedMovie.poster_path" 
                :alt="selectedMovie.title"
                loading="lazy"
              />
              <span v-else class="no-poster">이미지 없음</span>
            </div>
            <div class="movie-info">
              <h4>{{ selectedMovie ? selectedMovie.title : '' }}</h4>
              <p>{{ selectedMovie && selectedMovie.release_date ? selectedMovie.release_date.substring(0, 4) : '개봉일 미정' }}</p>
              <button 
                type="button" 
                class="clear-btn" 
                @click="clearSelectedMovie"
                aria-label="영화 선택 취소"
              >
                &times;
              </button>
            </div>
          </div>
        </div>
        
        <small class="form-text">오늘 관람했거나 관련된 영화가 있다면 선택해주세요.</small>
      </div>
      
      <!-- 노트 입력 -->
      <div class="form-group">
        <label for="note" class="form-label">
          <span class="label-icon">✏️</span>
          다이어리 내용
        </label>
        <textarea 
          id="note" 
          v-model="form.note" 
          rows="6" 
          placeholder="오늘의 감정이나 생각을 자유롭게 적어보세요."
          class="form-control note-textarea"
          maxlength="1000"
        ></textarea>
        <small class="form-text text-right">{{ getTextareaCharCount() }}</small>
      </div>
      
      <!-- 성공 메시지 -->
      <div v-if="saveSuccess" class="success-message">
        <span class="success-icon">✅</span>
        {{ isEditing ? '다이어리가 성공적으로 수정되었습니다.' : '다이어리가 성공적으로 저장되었습니다.' }}
      </div>
      
      <!-- 오류 메시지 -->
      <div v-if="error" class="error-message">
        <span class="error-icon">⚠️</span>
        {{ error }}
      </div>
      
      <!-- 액션 버튼 -->
      <div class="form-actions">
        <button 
          v-if="isEditing"
          type="button" 
          class="delete-btn" 
          @click="handleDelete"
          :disabled="isSubmitting"
        >
          <span v-if="isSubmitting" class="spinner"></span>
          <span v-else class="btn-icon">🗑️</span>
          삭제하기
        </button>
        
        <button 
          type="submit" 
          class="submit-btn"
          :disabled="isSubmitting"
        >
          <span v-if="isSubmitting" class="spinner"></span>
          <span v-else class="btn-icon">{{ isEditing ? '✏️' : '💾' }}</span>
          {{ isEditing ? '수정하기' : '저장하기' }}
        </button>
      </div>
    </form>

    <div v-if="error" class="error-message" role="alert">
      <span class="error-icon">⚠️</span> {{ error }}
    </div>
    
    <div v-if="saveSuccess" class="success-message" role="alert">
      <span class="success-icon">✅</span> 다이어리가 성공적으로 저장되었습니다!
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue'
import { useDiaryStore } from '@/stores/diary'
import { useMovieStore } from '@/stores/movie'
import { useEmotionStore } from '@/stores/emotion'

// Props
const props = defineProps({
  diaryId: {
    type: [Number, String],
    default: null
  },
  initialDate: {
    type: String,
    default: () => {
      const today = new Date()
      return today.toISOString().split('T')[0] // YYYY-MM-DD 형식
    }
  },
  lockDate: {
    type: Boolean,
    default: false
  }
})

// 이벤트
const emit = defineEmits(['close', 'saved', 'deleted'])

// 스토어
const diaryStore = useDiaryStore()
const movieStore = useMovieStore()
const emotionStore = useEmotionStore()

// 다이어리 관련 상태
const isEditing = computed(() => !!props.diaryId)
const isDateLocked = computed(() => props.lockDate || isEditing.value)

// 상태
const form = ref({
  date: props.initialDate,
  emotion: '',
  movie: '',
  note: ''
})
const error = ref('')
const isLoading = ref(false)
const isSubmitting = ref(false)
const saveSuccess = ref(false)

// 영화 데이터
const movies = ref([])
const movieSearchQuery = ref('')
const movieSearchResults = ref([])
const showMovieResults = ref(false)
const isSearching = ref(false)
const movieSearchError = ref('')

// 영화 데이터 로드 함수
const loadMovies = async () => {
  try {
    await movieStore.fetchMovies()
    movies.value = movieStore.movies || []
    console.log('영화 데이터 로드 완료:', movies.value.length)
  } catch (err) {
    console.error('영화 데이터 로드 오류:', err)
    error.value = '영화 데이터를 불러오는 중 오류가 발생했습니다.'
  }
}

// 감정 데이터
const emotions = ref([])

// 감정 데이터 로드 함수
const loadEmotions = async () => {
  try {
    await emotionStore.fetchEmotions()
    emotions.value = emotionStore.emotions || []
    console.log('감정 데이터 로드 완료:', emotions.value)
  } catch (err) {
    console.error('감정 데이터 로드 오류:', err)
    error.value = '감정 데이터를 불러오는 중 오류가 발생했습니다.'
  }
}

// 선택된 영화 정보
const selectedMovie = computed(() => {
  if (!form.value.movie) return null
  return movies.value.find(movie => movie.id === parseInt(form.value.movie)) || null
})

// 컴포넌트 마운트 시 데이터 로드
onMounted(async () => {
  try {
    // 데이터 불러오기
    await Promise.all([
      loadMovies(),
      loadEmotions()
    ])
    
    // 편집 모드인 경우 기존 다이어리 데이터 로드
    if (isEditing.value) {
      loadDiaryData()
    }
  } catch (err) {
    console.error('데이터 로드 오류:', err)
    error.value = '초기화 중 오류가 발생했습니다.'
  }
  
  // 바깥을 클릭하면 검색 결과 숨기기
  const handleOutsideClick = (e) => {
    const searchContainer = document.querySelector('.movie-search-container')
    if (searchContainer && !searchContainer.contains(e.target)) {
      showMovieResults.value = false
    }
  }
  
  document.addEventListener('click', handleOutsideClick)
  
  // 이벤트 리스너 제거를 위해 참조 저장
  onBeforeUnmount(() => {
    document.removeEventListener('click', handleOutsideClick)
  })
})

// 다이어리 데이터 로드 (편집 모드)
const loadDiaryData = async () => {
  isLoading.value = true
  error.value = ''
  
  try {
    // 다이어리 정보 조회
    const result = await diaryStore.fetchDiaryById(props.diaryId)
    
    if (result && result.id) {
      // 폼 데이터 설정
      form.value = {
        date: result.date,
        emotion: result.emotion ? result.emotion : '',
        movie: result.movie ? result.movie : '',
        note: result.note || ''
      }
    } else {
      error.value = '다이어리 정보를 불러올 수 없습니다.'
    }
  } catch (err) {
    error.value = err.message || '다이어리 정보를 불러오는 중 오류가 발생했습니다.'
    console.error('다이어리 로드 실패:', err)
  } finally {
    isLoading.value = false
  }
}

// 폼 제출 처리
const handleSubmit = async () => {
  if (isSubmitting.value) return // 이미 제출 중이면 중복 제출 방지
  
  isSubmitting.value = true
  error.value = ''
  saveSuccess.value = false
  
  try {
    // 폼 데이터 검증
    if (!form.value.date) {
      throw new Error('날짜는 필수 입력 항목입니다.')
    }
    
    // 노트가 비어있는지 확인
    if (!form.value.note.trim()) {
      throw new Error('다이어리 내용을 입력해주세요.')
    }
    
    // 제출할 데이터 객체 생성
    const diaryData = {
      date: form.value.date,
      note: form.value.note.trim()
    }
    
    // 감정 ID가 있는 경우 추가
    if (form.value.emotion) {
      diaryData.emotion = form.value.emotion
    }
    
    // 영화 ID가 있는 경우 추가
    if (form.value.movie) {
      diaryData.movie = form.value.movie
    }
    
    let result
    
    // 편집 모드: 기존 다이어리 업데이트
    if (isEditing.value) {
      result = await diaryStore.updateDiaryById(props.diaryId, diaryData)
    } 
    // 작성 모드: 새 다이어리 생성
    else {
      result = await diaryStore.createNewDiary(diaryData)
    }
    
    if (result && result.success) {
      // 성공 메시지 표시
      saveSuccess.value = true
      
      // 약간의 지연 후 창 닫기 (사용자가 성공 메시지를 볼 수 있도록)
      setTimeout(() => {
        // 성공 시 부모 컴포넌트에 이벤트 발생
        emit('saved', result.data)
        emit('close')
      }, 1000)
    } else {
      throw new Error(result?.error || '다이어리 저장에 실패했습니다.')
    }
  } catch (err) {
    error.value = err.message || '다이어리 저장 중 오류가 발생했습니다.'
    console.error('다이어리 저장 실패:', err)
  } finally {
    isSubmitting.value = false
  }
}

// 다이어리 삭제 처리
const handleDelete = async () => {
  if (!confirm('정말로 이 다이어리를 삭제하시겠습니까?\n\n삭제한 다이어리는 복구할 수 없습니다.')) {
    return
  }
  
  isSubmitting.value = true
  error.value = ''
  saveSuccess.value = false
  
  try {
    const result = await diaryStore.deleteDiaryById(props.diaryId)
    
    if (result.success) {
      saveSuccess.value = true
      setTimeout(() => {
        // 성공 시 부모 컴포넌트에 이벤트 발생
        emit('deleted', props.diaryId)
        emit('close')
      }, 1000)
    } else {
      throw new Error(result.error || '다이어리 삭제에 실패했습니다.')
    }
  } catch (err) {
    error.value = err.message || '다이어리 삭제 중 오류가 발생했습니다.'
    console.error('다이어리 삭제 실패:', err)
  } finally {
    isSubmitting.value = false
  }
}

// 폼 닫기
const closeForm = () => {
  emit('close')
}

const getPosterUrl = (posterPath) => {
  return 'https://image.tmdb.org/t/p/w200' + posterPath
}

// 영화 검색 핸들러
const searchMovies = async () => {
  if (!movieSearchQuery.value || movieSearchQuery.value.trim() === '') {
    movieSearchResults.value = []
    showMovieResults.value = false
    return
  }
  
  isSearching.value = true
  showMovieResults.value = true
  movieSearchResults.value = []
  movieSearchError.value = ''
  
  try {
    // 영화 검색 API 호출
    console.log('영화 검색 시작:', movieSearchQuery.value)
    const results = await movieStore.searchMovies(movieSearchQuery.value)
    
    if (results && Array.isArray(results)) {
      console.log('검색 결과:', results.length, '개 검색됨')
      
      if (results.length > 0) {
        // 결과 개수 제한
        movieSearchResults.value = results.slice(0, 10)
      } else {
        movieSearchResults.value = []
        movieSearchError.value = '일치하는 영화를 찾을 수 없습니다.'
      }
    } else if (results && typeof results === 'object') {
      // 단일 객체인 경우 (배열이 아님)
      movieSearchResults.value = [results]
    } else {
      console.warn('유효하지 않은 검색 결과:', results)
      movieSearchResults.value = []
      movieSearchError.value = '검색 결과를 가져올 수 없습니다.'
    }
  } catch (err) {
    console.error('영화 검색 실패:', err)
    movieSearchError.value = '영화 검색에 실패했습니다.'
    movieSearchResults.value = []
  } finally {
    isSearching.value = false
  }
}

// 타이핑 입력에 따른 검색 처리 (디바운스 적용)
let searchTimeout = null
const handleMovieSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  
  if (!movieSearchQuery.value.trim()) {
    movieSearchResults.value = []
    showMovieResults.value = false
    return
  }
  
  searchTimeout = setTimeout(() => {
    searchMovies()
  }, 500) // 0.5초 디바운스
}

// 감정 선택 함수
const selectEmotion = (emotionId) => {
  form.value.emotion = emotionId
  console.log('감정 선택:', emotionId, '선택된 감정:', form.value.emotion)
}

// 영화 선택 함수
const selectMovie = (movie) => {
  form.value.movie = movie.id
  movieSearchQuery.value = movie.title
  showMovieResults.value = false
}

// 선택된 영화 초기화
const clearSelectedMovie = () => {
  form.value.movie = ''
  movieSearchQuery.value = ''
}

// 영화 정보 가져오기 함수
const getMovieDetails = async (movieId) => {
  try {
    // 이미 로드된 영화 첫번째 확인
    const foundMovie = movies.value.find(m => m.id === parseInt(movieId))
    if (foundMovie) return foundMovie
    
    // 영화 상세 정보 가져오기
    const movie = await movieStore.getMovieById(movieId)
    if (movie) {
      movies.value.push(movie) // 로커얼 데이터에 추가
      return movie
    }
    
    return null
  } catch (err) {
    console.error('영화 상세 정보 가져오기 실패:', err)
    return null
  }
}

// 감정 아이콘 반환
const getEmotionIcon = (emotionId) => {
  if (!emotions.value || emotions.value.length === 0) return '📝'
  
  // emotionId가 없는 경우
  if (!emotionId) return '📝'
  
  // 감정 찾기
  const emotion = emotions.value.find(e => e.id === emotionId)
  if (!emotion) return '📝'
  
  // 감정별 이모지 매핑
  const emotionIcons = {
    '기쁨': '😊',
    '슬픔': '😢',
    '분노': '😡',
    '설렘': '😍',
    '불안': '😨',
    '평온': '😌',
    '허탈': '😴',
    '지루함': '😒',
    '놀라움': '😲'
  }
  
  return emotionIcons[emotion.name] || '📝'
}

// 감정별 색상 반환
const getEmotionColor = (emotionName) => {
  if (!emotionName) return ''
  
  const emotionColors = {
    '기쁨': '#FFD700',
    '슬픔': '#4682B4',
    '분노': '#FF6347',
    '설렘': '#FF69B4',
    '불안': '#7B68EE',
    '평온': '#90EE90',
    '허탈': '#C0C0C0'
  }
  
  return emotionColors[emotionName] || ''
}

// 감정에 따른 CSS 클래스 반환
const getEmotionClass = (emotion) => {
  if (!emotion) return 'emotion-none'
  
  // 공통 감정 맵
  const emotionMap = {
    '기쁨': 'emotion-happy',
    '슬픔': 'emotion-sad',
    '분노': 'emotion-angry',
    '설렘': 'emotion-excited',
    '불안': 'emotion-anxious',
    '평온': 'emotion-peaceful',
    '허탈': 'emotion-empty',
    '지루함': 'emotion-bored',
    '놀라움': 'emotion-surprised'
  }
  
  // emotion이 객체인 경우
  if (typeof emotion === 'object' && emotion !== null) {
    return emotionMap[emotion.name] || `emotion-custom-${emotion.id}`
  }
  
  // emotion이 ID인 경우 (숫자 또는 문자열)
  if (!emotions.value || emotions.value.length === 0) return 'emotion-none'
  
  const foundEmotion = emotions.value.find(e => e.id === emotion)
  if (!foundEmotion) return 'emotion-none'
  
  return emotionMap[foundEmotion.name] || `emotion-custom-${emotion}`
}

// 텍스트에리어 문자 수 카운트
const getTextareaCharCount = () => {
  const count = form.value.note.length
  const maxCount = 1000 // 최대 문자 수 (UI용, 백엔드에서 추가 검증 필요)
  
  return `${count}/${maxCount} 문자`
}

// 날짜 포맷팅 (YYYY-MM-DD -> YYYY년 MM월 DD일)
const formatDisplayDate = (dateString) => {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  
  const weekdays = ['일', '월', '화', '수', '목', '금', '토']
  const weekday = weekdays[date.getDay()]
  
  return year + '년 ' + month + '월 ' + day + '일 (' + weekday + ')'
}
</script>

<style scoped>
/* 기본 스타일 */
.diary-form-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.1);
  max-width: 680px;
  margin: 0 auto;
  padding: 25px;
  position: relative;
  overflow: hidden;
}

/* 폼 헤더 */
.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  border-bottom: 2px solid #f5f5f5;
  padding-bottom: 15px;
}

.form-title {
  margin: 0;
  font-size: 1.8rem;
  color: #333;
  font-weight: 600;
  background: linear-gradient(90deg, #6c5ce7, #a29bfe);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.form-date-display {
  margin-bottom: 20px;
  text-align: center;
}

.current-date-badge {
  display: inline-block;
  padding: 8px 16px;
  background-color: #f8f9fa;
  border-radius: 30px;
  font-size: 1.1rem;
  font-weight: 500;
  color: #444;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  border: 1px solid #eee;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 1.8rem;
  cursor: pointer;
  color: #aaa;
  transition: all 0.3s;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.close-btn:hover {
  color: #333;
  background-color: #f5f5f5;
}

/* 폼 그룹 */
.form-group {
  margin-bottom: 25px;
  position: relative;
}

.form-label {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-weight: 600;
  color: #444;
  font-size: 1.05rem;
}

.label-icon {
  margin-right: 8px;
  font-size: 1.2rem;
}

.form-text {
  margin-top: 5px;
  color: #666;
  font-size: 0.85rem;
  display: block;
}

.form-control {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s;
  background-color: #fff;
}

.form-control:focus {
  border-color: #6c5ce7;
  box-shadow: 0 0 0 3px rgba(108, 92, 231, 0.2);
  outline: none;
}

.date-picker {
  color: #444;
  cursor: pointer;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.note-textarea {
  resize: vertical;
  min-height: 120px;
  line-height: 1.5;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

/* 감정 선택기 */
.emotion-selector {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.emotion-select {
  flex: 1;
}

.emotion-preview {
  font-size: 1.8rem;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.emotion-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}

.emotion-chip {
  border: none;
  border-radius: 30px;
  padding: 8px 15px;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.3s;
  background-color: #f5f5f5;
  color: #555;
}

.emotion-chip:hover {
  transform: translateY(-2px);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
}

.emotion-chip.active {
  font-weight: bold;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
}

.emotion-icon {
  margin-right: 5px;
  font-size: 1.2rem;
}

/* 영화 검색 & 선택 */
.movie-search-container {
  position: relative;
}

.search-bar {
  display: flex;
  margin-bottom: 15px;
}

.search-bar input {
  flex: 1;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 8px 0 0 8px;
  font-size: 1rem;
  transition: all 0.3s;
}

.search-bar input:focus {
  border-color: #6c5ce7;
  box-shadow: 0 0 0 3px rgba(108, 92, 231, 0.2);
  outline: none;
}

.search-btn {
  background: #6c5ce7;
  color: white;
  border: none;
  border-radius: 0 8px 8px 0;
  padding: 0 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.search-btn:hover {
  background: #5b4cce;
}

.selected-movie {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 15px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  position: relative;
}

.movie-preview {
  width: 70px;
  height: 100px;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.movie-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.movie-info {
  flex: 1;
}

.movie-info h4 {
  margin: 0 0 5px 0;
  font-size: 1.1rem;
  color: #333;
}

.movie-info p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.clear-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: transparent;
  border: none;
  cursor: pointer;
}

.movie-search-results {
  position: absolute;
  width: 100%;
  max-height: 300px;
  overflow-y: auto;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  z-index: 10;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.movie-result-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  cursor: pointer;
  border-bottom: 1px solid #eee;
  transition: background-color 0.2s;
}

.movie-result-item:hover {
  background-color: #f0f0f0;
}

.movie-result-item:last-child {
  border-bottom: none;
}

.movie-poster-small {
  width: 40px;
  height: 60px;
  background: #f0f0f0;
  border-radius: 3px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.movie-poster-small img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-poster-small {
  color: #aaa;
  font-size: 1.2rem;
}

.movie-result-info {
  flex: 1;
  overflow: hidden;
}

.movie-title {
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.movie-year {
  color: #666;
  font-size: 0.8rem;
}

.no-results {
  padding: 10px;
  text-align: center;
  color: #666;
  background: #f8f9fa;
  border-radius: 4px;
}

.searching-indicator {
  padding: 10px;
  text-align: center;
  color: #666;
  font-style: italic;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.submit-btn {
  background: #6c5ce7;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 20px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-btn:hover {
  background: #5b4cce;
}

.delete-btn {
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 20px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
}

.delete-btn:hover {
  background: #c0392b;
}

.error-message {
  margin-top: 20px;
  padding: 10px;
  background-color: #ffecec;
  color: #e74c3c;
  border-radius: 4px;
  text-align: center;
}

@media (max-width: 768px) {
  .diary-form-container {
    width: 90%;
  }
}

@media (max-width: 480px) {
  .form-actions {
    flex-direction: column;
  }
  
  .submit-btn,
  .delete-btn {
    width: 100%;
  }
}
</style>
