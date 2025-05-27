<template>
  <div class="calendar-container">
    <!-- 달력 헤더 -->
    <div class="calendar-header">
      <div class="month-navigation">
        <button class="nav-btn" @click="goToPreviousMonth" aria-label="이전 달로 이동">
          <span>&laquo; 이전 달</span>
        </button>
        <h2>{{ currentYearMonth }}</h2>
        <button class="nav-btn" @click="goToNextMonth" aria-label="다음 달로 이동">
          <span>다음 달 &raquo;</span>
        </button>
      </div>
      <button class="new-diary-btn" @click="openNewDiaryForm" aria-label="새 다이어리 작성">
        <span class="btn-icon">✏️</span> 새 다이어리 작성
      </button>
    </div>
    
    <!-- 감정 범례 -->
    <div class="emotion-legend">
      <div class="legend-title">감정 범례:</div>
      <div class="legend-items">
        <div class="legend-item">
          <div class="legend-color emotion-happy"></div>
          <span>기쁨</span>
        </div>
        <div class="legend-item">
          <div class="legend-color emotion-sad"></div>
          <span>슬픔</span>
        </div>
        <div class="legend-item">
          <div class="legend-color emotion-angry"></div>
          <span>분노</span>
        </div>
        <div class="legend-item">
          <div class="legend-color emotion-excited"></div>
          <span>설렘</span>
        </div>
        <div class="legend-item">
          <div class="legend-color emotion-anxious"></div>
          <span>불안</span>
        </div>
      </div>
    </div>

    <!-- 달력 그리드 -->
    <div class="calendar-grid">
      <!-- 요일 헤더 -->
      <div v-for="day in weekdays" :key="day" class="day-header">
        {{ day }}
      </div>

      <!-- 날짜 셀 그리드 -->
      <div
        v-for="{ date, isCurrentMonth, hasEntry, emotion } in calendarDays"
        :key="date.toISOString()"
        class="day-cell"
        :class="{
          'current-month': isCurrentMonth,
          'other-month': !isCurrentMonth,
          'has-entry': hasEntry,
          [getEmotionClass(emotion)]: hasEntry && emotion
        }"
        @click="handleDateClick(date, hasEntry)"
        :aria-label="getDateAriaLabel(date, hasEntry, emotion)"
        tabindex="0"
        @keydown.enter="handleDateClick(date, hasEntry)"
      >
        <div class="date-number">{{ date.getDate() }}</div>
        <!-- 감정 표시 (있는 경우) -->
        <div v-if="hasEntry" class="emotion-indicator" :class="getEmotionClass(emotion)">
          {{ getEmotionIcon(emotion) }}
        </div>
        <div v-if="hasEntry" class="entry-marker"></div>
      </div>
    </div>

    <!-- 로딩 인디케이터 -->
    <div v-if="diaryStore.isLoading" class="loading-overlay">
      <div class="loading-spinner">로딩 중...</div>
    </div>

    <!-- 에러 메시지 -->
    <div v-if="diaryStore.error" class="error-message">
      {{ diaryStore.error }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useDiaryStore } from '@/stores/diary'

// 다이어리 스토어
const diaryStore = useDiaryStore()

// 요일 라벨
const weekdays = ['일', '월', '화', '수', '목', '금', '토']

// 선택된 연도와 월 관리
const selectedYear = ref(new Date().getFullYear())
const selectedMonth = ref(new Date().getMonth())  // 0-11 범위

// 현재 표시되는 연도와 월 문자열
const currentYearMonth = computed(() => {
  return `${selectedYear.value}년 ${selectedMonth.value + 1}월`
})

// 달력에 표시할 날짜 계산
const calendarDays = computed(() => {
  const days = []
  
  // 현재 달의 첫 날과 마지막 날
  const firstDayOfMonth = new Date(selectedYear.value, selectedMonth.value, 1)
  const lastDayOfMonth = new Date(selectedYear.value, selectedMonth.value + 1, 0)
  
  // 달력의 시작일: 현재 달의 첫 날이 속한 주의 일요일
  const startDate = new Date(firstDayOfMonth)
  startDate.setDate(startDate.getDate() - startDate.getDay())
  
  // 달력의 종료일: 현재 달의 마지막 날이 속한 주의 토요일
  const endDate = new Date(lastDayOfMonth)
  if (endDate.getDay() < 6) {
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()))
  }
  
  // 날짜별 다이어리 항목 매핑 (Map으로 빠른 조회 가능)
  const entriesByDate = new Map()
  const emotionsByDate = diaryStore.emotionsByDate
  
  diaryStore.monthlyDiaries.forEach(diary => {
    const dateStr = diary.date
    entriesByDate.set(dateStr, diary)
  })
  
  // 날짜 셀 정보 생성
  const currentDate = new Date(startDate)
  while (currentDate <= endDate) {
    const dateStr = formatDate(currentDate)
    const hasEntry = entriesByDate.has(dateStr)
    
    days.push({
      date: new Date(currentDate),
      isCurrentMonth: currentDate.getMonth() === selectedMonth.value,
      hasEntry,
      emotion: hasEntry ? emotionsByDate[dateStr] : null
    })
    
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  return days
})

// 날짜 형식 변환 함수 (YYYY-MM-DD)
const formatDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 이전 달로 이동
const goToPreviousMonth = () => {
  if (selectedMonth.value === 0) {
    selectedYear.value--
    selectedMonth.value = 11
  } else {
    selectedMonth.value--
  }
  loadMonthData()
}

// 다음 달로 이동
const goToNextMonth = () => {
  if (selectedMonth.value === 11) {
    selectedYear.value++
    selectedMonth.value = 0
  } else {
    selectedMonth.value++
  }
  loadMonthData()
}

// 현재 선택된 월의 다이어리 데이터 로드
const loadMonthData = () => {
  // Pinia 스토어에 저장된 월과 API 호출용 월 조정 (JavaScript 월은 0부터 시작)
  diaryStore.setSelectedYearMonth(selectedYear.value, selectedMonth.value + 1)
}

// 감정에 따른 CSS 클래스 반환
const getEmotionClass = (emotion) => {
  if (!emotion) return 'emotion-none'
  
  // 감정 ID나 이름에 따라 클래스 반환
  // 기본 감정들에 대한 클래스 매핑
  const emotionMap = {
    '기쁨': 'emotion-happy',
    '슬픔': 'emotion-sad',
    '분노': 'emotion-angry',
    '설렘': 'emotion-excited',
    '불안': 'emotion-anxious',
    '평온': 'emotion-peaceful',
    '허탈': 'emotion-empty'
  }
  
  // 감정 이름이 있으면 해당 클래스 반환, 없으면 ID 기반 클래스 반환
  return emotionMap[emotion.name] || `emotion-${emotion.id}`
}

// 날짜 셀의 접근성 라벨 생성
const getDateAriaLabel = (date, hasEntry, emotion) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dateStr = `${year}년 ${month}월 ${day}일`;
  
  if (!hasEntry) {
    return `${dateStr} - 다이어리 없음`;
  }
  
  let emotionName = '감정 없음';
  if (emotion && emotion.name) {
    emotionName = emotion.name;
  }
  
  return `${dateStr} - ${emotionName} 다이어리 있음. 클릭하여 열기`;
}

// 감정에 따른 아이콘 반환
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

// 날짜 클릭 이벤트 핸들러
const handleDateClick = (date, hasEntry) => {
  // 현재 월의 날짜가 아닌 경우 무시
  if (date.getMonth() !== selectedMonth.value) return
  
  // 날짜 정보를 YYYY-MM-DD 형식으로 변환
  const formattedDate = formatDate(date)
  
  // 해당 날짜에 다이어리가 있는지 확인하고 ID 찾기
  let diaryId = null
  if (hasEntry) {
    const diariesForDate = diaryStore.diaries.filter(d => d.date === formattedDate)
    if (diariesForDate.length > 0) {
      diaryId = diariesForDate[0].id
    }
  }
  
  // 부모 컴포넌트에 날짜 클릭 이벤트 발생 (다이어리 ID 포함)
  emit('date-click', { date: formattedDate, hasEntry, diaryId })
}

// 새 다이어리 작성 폼 열기
const openNewDiaryForm = () => {
  // 오늘 날짜로 새 다이어리 작성 이벤트 발생
  const today = new Date()
  emit('new-diary', formatDate(today))
}

// emit 정의
const emit = defineEmits(['date-click', 'new-diary'])

// 컴포넌트 마운트 시 현재 월 데이터 로드
onMounted(() => {
  loadMonthData()
})

// 선택된 년/월이 변경될 때 데이터 다시 로드
watch([selectedYear, selectedMonth], () => {
  loadMonthData()
})
</script>

<style scoped>
.calendar-container {
  max-width: 900px;
  margin: 0 auto;
  font-family: 'Arial', sans-serif;
  position: relative;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 20px;
  overflow: hidden;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 10px 0;
  border-bottom: 2px solid #f0f0f0;
}

.month-navigation {
  display: flex;
  align-items: center;
  gap: 15px;
}

.month-navigation h2 {
  margin: 0;
  font-size: 1.8rem;
  min-width: 180px;
  text-align: center;
  color: #333;
  font-weight: 600;
}

.nav-btn {
  background: #f0f0f0;
  border: none;
  border-radius: 8px;
  padding: 10px 15px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s ease;
  color: #555;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-btn:hover {
  background: #e0e0e0;
  transform: translateY(-2px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.nav-btn:focus {
  outline: 2px solid #6c5ce7;
  outline-offset: 2px;
}

.new-diary-btn {
  background: #6c5ce7;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 18px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.25s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 2px 5px rgba(108, 92, 231, 0.3);
}

.new-diary-btn:hover {
  background: #5b4cce;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(108, 92, 231, 0.4);
}

.new-diary-btn:focus {
  outline: 2px solid #fff;
  outline-offset: 2px;
}

.btn-icon {
  font-size: 1.2rem;
}

/* 감정 범례 */
.emotion-legend {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 15px;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 8px;
  gap: 10px;
}

.legend-title {
  font-weight: bold;
  margin-right: 10px;
  color: #555;
}

.legend-items {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: inline-block;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 5px;
}

.day-header {
  text-align: center;
  font-weight: bold;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

/* 일요일(첫번째 열) 색상 */
.day-header:first-child {
  color: #e74c3c;
}

/* 토요일(마지막 열) 색상 */
.day-header:last-child {
  color: #3498db;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  border-radius: 8px;
  overflow: hidden;
}

.day-header {
  text-align: center;
  font-weight: bold;
  padding: 12px 5px;
  background-color: #f8f9fa;
  border-radius: 6px;
  font-size: 1rem;
  letter-spacing: 0.5px;
}

.day-cell {
  min-height: 100px;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 8px;
  position: relative;
  cursor: pointer;
  transition: all 0.25s ease;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.day-cell:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
  z-index: 1;
}

.day-cell:focus {
  outline: 2px solid #6c5ce7;
  outline-offset: 2px;
}

.day-cell.has-entry {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.date-number {
  font-weight: bold;
  margin-bottom: 5px;
  font-size: 1.1rem;
  z-index: 2;
  color: #333;
}

.current-month {
  background-color: white;
}

.other-month {
  background-color: #f8f9fa;
  color: #aaa;
}

.has-entry {
  border-width: 2px;
  border-color: #a29bfe;
}

.entry-marker {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #6c5ce7;
}

.emotion-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 1.8rem;
  text-align: center;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  z-index: 1;
}

/* 날짜 셀에 감정 배경 적용 */
.day-cell.emotion-happy {
  background-color: rgba(255, 215, 0, 0.15);
  border-color: rgba(255, 215, 0, 0.5);
}

.day-cell.emotion-sad {
  background-color: rgba(70, 130, 180, 0.15);
  border-color: rgba(70, 130, 180, 0.5);
}

.day-cell.emotion-angry {
  background-color: rgba(255, 99, 71, 0.15);
  border-color: rgba(255, 99, 71, 0.5);
}

.day-cell.emotion-excited {
  background-color: rgba(255, 105, 180, 0.15);
  border-color: rgba(255, 105, 180, 0.5);
}

.day-cell.emotion-anxious {
  background-color: rgba(123, 104, 238, 0.15);
  border-color: rgba(123, 104, 238, 0.5);
}

.day-cell.emotion-peaceful {
  background-color: rgba(144, 238, 144, 0.15);
  border-color: rgba(144, 238, 144, 0.5);
}

.day-cell.emotion-empty {
  background-color: rgba(192, 192, 192, 0.15);
  border-color: rgba(192, 192, 192, 0.5);
}

/* 감정별 스타일 */
.emotion-happy {
  background-color: #FFD700; /* 기쁨: 밝은 노란색 */
  color: #806C00;
}

.emotion-sad {
  background-color: #4682B4; /* 슬픔: 스틸블루 */
  color: white;
}

.emotion-angry {
  background-color: #FF6347; /* 분노: 토마토 레드 */
  color: white;
}

.emotion-excited {
  background-color: #FF69B4; /* 설렘: 핫 핑크 */
  color: white;
}

.emotion-anxious {
  background-color: #7B68EE; /* 불안: 미디엄 슬레이트 블루 */
  color: white;
}

.emotion-peaceful {
  background-color: #90EE90; /* 평온: 라이트 그린 */
  color: #2E642E;
}

.emotion-empty {
  background-color: #C0C0C0; /* 허탈: 실버 */
  color: white;
}

.emotion-none {
  background-color: #E0E0E0; /* 감정 없음: 연한 회색 */
  color: #666;
}

/* 범례 색상 */
.legend-color.emotion-happy {
  background-color: #FFD700;
}

.legend-color.emotion-sad {
  background-color: #4682B4;
}

.legend-color.emotion-angry {
  background-color: #FF6347;
}

.legend-color.emotion-excited {
  background-color: #FF69B4;
}

.legend-color.emotion-anxious {
  background-color: #7B68EE;
}

/* 로딩 인디케이터 */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
}

.loading-spinner {
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.error-message {
  margin-top: 20px;
  padding: 10px;
  background-color: #ffecec;
  color: #e74c3c;
  border-radius: 4px;
  text-align: center;
}

/* 로딩 및 에러 스타일 */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 20;
  border-radius: 12px;
}

.loading-spinner {
  padding: 20px 30px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  font-weight: 500;
  color: #6c5ce7;
  display: flex;
  align-items: center;
  gap: 10px;
}

.loading-spinner::before {
  content: '';
  display: inline-block;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 3px solid #6c5ce7;
  border-top-color: transparent;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-message {
  margin-top: 20px;
  padding: 15px;
  background-color: #ffecec;
  color: #e74c3c;
  border-radius: 8px;
  text-align: center;
  font-weight: 500;
  box-shadow: 0 2px 5px rgba(231, 76, 60, 0.2);
}

/* 반응형 스타일 */
@media (max-width: 768px) {
  .calendar-container {
    padding: 15px;
    margin: 0 10px;
  }
  
  .calendar-header {
    flex-direction: column;
    gap: 15px;
  }
  
  .month-navigation {
    width: 100%;
    justify-content: space-between;
  }
  
  .month-navigation h2 {
    font-size: 1.5rem;
    min-width: 140px;
  }
  
  .new-diary-btn {
    width: 100%;
    justify-content: center;
  }
  
  .calendar-grid {
    gap: 5px;
  }
  
  .day-cell {
    min-height: 70px;
    padding: 5px;
  }
  
  .emotion-indicator {
    font-size: 1.4rem;
    width: 40px;
    height: 40px;
  }
  
  .emotion-legend {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .legend-items {
    width: 100%;
    justify-content: space-between;
  }
}

@media (max-width: 480px) {
  .calendar-container {
    padding: 10px;
    border-radius: 8px;
  }
  
  .nav-btn span {
    display: none;
  }
  
  .nav-btn::before {
    content: "<";
    font-size: 1.2rem;
    font-weight: bold;
  }
  
  .nav-btn:last-child::before {
    content: ">";
  }
  
  .month-navigation h2 {
    font-size: 1.3rem;
    min-width: 120px;
  }
  
  .day-header {
    font-size: 0.8rem;
    padding: 8px 5px;
  }
  
  .day-cell {
    min-height: 50px;
    border-radius: 6px;
  }
  
  .date-number {
    font-size: 0.9rem;
  }
  
  .emotion-indicator {
    font-size: 1.1rem;
    width: 30px;
    height: 30px;
  }
  
  .entry-marker {
    width: 6px;
    height: 6px;
  }
  
  .legend-items {
    gap: 8px;
    flex-wrap: wrap;
  }
  
  .legend-item {
    font-size: 0.9rem;
  }
}
</style>
