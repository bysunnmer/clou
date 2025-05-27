<template>
  <div class="diary-page">
    <h1 class="page-title">나의 감정 다이어리</h1>
    
    <!-- 달력 컴포넌트 -->
    <CalendarView 
      @date-click="handleDateClick" 
      @new-diary="handleNewDiary" 
    />
    
    <!-- 다이어리 상세보기 섹션 (선택된 날짜에 다이어리가 있는 경우) -->
    <div v-if="selectedDiary" class="diary-detail">
      <div class="diary-header">
        <h2>
          {{ formatDate(selectedDiary.date) }} 
          <span v-if="selectedDiary.emotion_detail" class="emotion-badge">
            {{ getEmotionIcon(selectedDiary.emotion_detail) }}
            {{ selectedDiary.emotion_detail.name }}
          </span>
        </h2>
        <button class="edit-btn" @click="openEditForm">수정</button>
      </div>
      
      <div v-if="selectedDiary.movie_detail" class="movie-info">
        <img 
          v-if="selectedDiary.movie_detail.poster_path" 
          :src="getPosterUrl(selectedDiary.movie_detail.poster_path)" 
          :alt="selectedDiary.movie_detail.title" 
          class="movie-poster"
        >
        <div class="movie-detail">
          <h3>{{ selectedDiary.movie_detail.title }}</h3>
          <p v-if="selectedDiary.movie_detail.release_date">
            개봉: {{ formatMovieDate(selectedDiary.movie_detail.release_date) }}
          </p>
        </div>
      </div>
      
      <div class="diary-content">
        <p v-if="selectedDiary.note">{{ selectedDiary.note }}</p>
        <p v-else class="empty-note">작성된 내용이 없습니다.</p>
      </div>
    </div>
    
    <!-- 다이어리 폼 모달 (새 다이어리 작성 또는 편집) -->
    <div v-if="showDiaryForm" class="modal-overlay">
      <div class="modal-content">
        <DiaryForm 
          :diary-id="editDiaryId" 
          :initial-date="initialDate" 
          :lock-date="true"
          @close="closeDiaryForm" 
          @saved="handleDiarySaved" 
          @deleted="handleDiaryDeleted" 
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useDiaryStore } from '@/stores/diary'
import CalendarView from '@/components/diary/CalendarView.vue'
import DiaryForm from '@/components/diary/DiaryForm.vue'

// 다이어리 스토어
const diaryStore = useDiaryStore()

// 상태
const selectedDiary = ref(null)
const showDiaryForm = ref(false)
const editDiaryId = ref(null)
const initialDate = ref('')

// 현재 날짜의 다이어리를 가져오는 함수
const fetchTodayDiary = async () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth() + 1 // JavaScript는 월이 0부터 시작하므로 +1
  
  // 현재 월의 다이어리 데이터 로드
  await diaryStore.setSelectedYearMonth(year, month)
  
  // 오늘 날짜 포맷팅 (YYYY-MM-DD)
  const formattedDate = formatDateForApi(today)
  
  // 오늘 날짜의 다이어리 찾기
  const todayDiary = diaryStore.diaries.find(diary => diary.date === formattedDate)
  
  if (todayDiary) {
    selectedDiary.value = todayDiary
  }
}

// 컴포넌트 마운트 시 초기 데이터 로드
onMounted(() => {
  fetchTodayDiary()
})

// 날짜 클릭 이벤트 핸들러
const handleDateClick = async ({ date, hasEntry }) => {
  if (hasEntry) {
    // 해당 날짜에 다이어리가 있는 경우, 다이어리를 불러옴
    const diary = diaryStore.diaries.find(d => d.date === date)
    if (diary) {
      selectedDiary.value = diary
    }
  } else {
    // 해당 날짜에 다이어리가 없는 경우, 새 다이어리 작성 폼 열기
    initialDate.value = date
    editDiaryId.value = null
    showDiaryForm.value = true
  }
}

// 새 다이어리 작성 버튼 클릭 이벤트 핸들러
const handleNewDiary = (date) => {
  initialDate.value = date
  editDiaryId.value = null
  showDiaryForm.value = true
}

// 다이어리 수정 폼 열기
const openEditForm = () => {
  if (selectedDiary.value) {
    editDiaryId.value = selectedDiary.value.id
    initialDate.value = selectedDiary.value.date
    showDiaryForm.value = true
  }
}

// 다이어리 폼 닫기
const closeDiaryForm = () => {
  showDiaryForm.value = false
  editDiaryId.value = null
  initialDate.value = ''
}

// 다이어리 저장 이벤트 핸들러
const handleDiarySaved = async (diary) => {
  // 현재 선택된 월의 다이어리 다시 로드
  await diaryStore.fetchMonthlyDiaries()
  
  // 저장된 다이어리를 선택 상태로 설정
  selectedDiary.value = diary
}

// 다이어리 삭제 이벤트 핸들러
const handleDiaryDeleted = async (diaryId) => {
  // 현재 선택된 월의 다이어리 다시 로드
  await diaryStore.fetchMonthlyDiaries()
  
  // 선택된 다이어리가 삭제된 경우 선택 상태 초기화
  if (selectedDiary.value && selectedDiary.value.id === diaryId) {
    selectedDiary.value = null
  }
}

// 날짜 포맷 함수 (표시용)
const formatDate = (dateString) => {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  
  const weekdays = ['일', '월', '화', '수', '목', '금', '토']
  const weekday = weekdays[date.getDay()]
  
  return `${year}년 ${month}월 ${day}일 (${weekday})`
}

// 날짜 포맷 함수 (API용)
const formatDateForApi = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 영화 개봉일 포맷 함수
const formatMovieDate = (dateString) => {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  
  return `${year}년 ${month}월 ${day}일`
}

// 영화 포스터 URL 생성
const getPosterUrl = (posterPath) => {
  return `https://image.tmdb.org/t/p/w200${posterPath}`
}

// 감정 아이콘 반환
const getEmotionIcon = (emotion) => {
  if (!emotion) return '📝'
  
  // 감정별 이모지 매핑
  const emotionIcons = {
    '기쁨': '😊',
    '슬픔': '😢',
    '분노': '😡',
    '설렘': '😍',
    '불안': '😨',
    '평온': '😌',
    '허탈': '😔'
  }
  
  return emotionIcons[emotion.name] || '📝'
}
</script>

<style scoped>
.diary-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Arial', sans-serif;
  position: relative;
}

.page-title {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.diary-detail {
  margin-top: 30px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.diary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.diary-header h2 {
  margin: 0;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  gap: 10px;
}

.emotion-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.9rem;
  background: #f0f0f0;
  padding: 5px 10px;
  border-radius: 20px;
}

.edit-btn {
  background: #6c5ce7;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.2s;
}

.edit-btn:hover {
  background: #5b4cce;
}

.movie-info {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.movie-poster {
  width: 100px;
  height: 150px;
  object-fit: cover;
  border-radius: 4px;
}

.movie-detail {
  flex: 1;
}

.movie-detail h3 {
  margin-top: 0;
  margin-bottom: 10px;
}

.diary-content {
  line-height: 1.6;
}

.empty-note {
  color: #999;
  font-style: italic;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  animation: modal-appear 0.3s;
}

@keyframes modal-appear {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .diary-page {
    padding: 10px;
  }
  
  .movie-info {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .movie-poster {
    margin-bottom: 10px;
  }
}
</style>
