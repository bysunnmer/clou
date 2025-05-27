<template>
  <div class="diary-modal-overlay" @click.self="closeModal">
    <div class="diary-modal-content">
      <button class="close-button" @click="closeModal">&times;</button>
      
      <h2 class="modal-title">나의 다이어리 📝</h2>
      
      <div class="modal-body">
        <!-- 다이어리 폼이 표시되고 있지 않을 때만 달력 표시 -->
        <div v-if="!showDiaryForm" class="calendar-container">
          <CalendarView 
            @date-click="handleDateClick" 
            @new-diary="handleNewDiary" 
          />
        </div>
        
        <!-- 다이어리 폼 -->
        <div v-if="showDiaryForm" class="diary-form-container">
          <DiaryForm 
            :initial-date="selectedDate" 
            :diary-id="editDiaryId" 
            :lock-date="true"
            @saved="handleDiarySaved"
            @close="handleDiaryClose"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import CalendarView from '@/components/diary/CalendarView.vue'
import DiaryForm from '@/components/diary/DiaryForm.vue'

// Props
const props = defineProps({
  // 필요한 프롭스가 있다면 여기에 정의
})

// Emits
const emit = defineEmits(['close'])

// 상태 관리
const showDiaryForm = ref(false)
const selectedDate = ref(null)
const editDiaryId = ref(null)

// 날짜 클릭 핸들러
function handleDateClick(dateInfo) {
  console.log('날짜 클릭 정보:', dateInfo)
  selectedDate.value = dateInfo.date
  // diaryId가 직접 전달되는지 확인
  editDiaryId.value = dateInfo.diaryId || null
  showDiaryForm.value = true
}

// 다이어리 저장 완료 핸들러
function handleDiarySaved() {
  // 저장 후 달력 보기로 돌아감
  showDiaryForm.value = false
}

// 날짜 형식 변환 함수 (YYYY-MM-DD)
function formatDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 새 다이어리 작성 버튼 클릭 핸들러
function handleNewDiary() {
  console.log('새 다이어리 작성 요청')
  // 오늘 날짜로 설정
  selectedDate.value = formatDate(new Date())
  // 새 다이어리이미로 ID는 null
  editDiaryId.value = null
  // 다이어리 폼 표시
  showDiaryForm.value = true
}

// 다이어리 폼 닫기 핸들러
function handleDiaryClose() {
  // 폼 닫고 달력 보기로 돌아감
  showDiaryForm.value = false
}

// 모달 닫기
function closeModal() {
  // 부모 컴포넌트에 닫기 이벤트 발생
  emit('close')
}
</script>

<style scoped>
.diary-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.diary-modal-content {
  background-color: white;
  border-radius: 12px;
  width: 90%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 2rem;
  position: relative;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.3s ease;
}

.close-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-button:hover {
  background-color: #f2f2f2;
  color: #333;
}

.modal-title {
  text-align: center;
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #333;
  font-size: 1.5rem;
}

.modal-body {
  max-height: calc(90vh - 120px);
  overflow-y: auto;
  padding: 0 1rem;
}

.calendar-container {
  margin-bottom: 2rem;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from { transform: translateY(-20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .diary-modal-content {
    width: 95%;
    padding: 1.5rem;
  }
  
  .modal-title {
    font-size: 1.25rem;
  }
}
</style>
