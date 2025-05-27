<template>
  <div class="review-section">
    <!-- 리뷰 헤더 -->
    <div class="review-header-main">
      <h2 class="review-title">리뷰 <span class="review-count">{{ reviews.length }}+</span></h2>
      <div class="review-sorting">
        <button class="sort-button active">최신순</button>
        <button class="sort-button">좋아요순</button>
      </div>
    </div>
    
    <!-- 리뷰 작성 폼 -->
    <div class="review-form">
      <textarea
        v-model="newReview"
        placeholder="이 영화에 대한 리뷰를 작성해보세요"
        rows="3"
      ></textarea>
      <div class="review-form-footer">
        <div class="review-rating">
          <span>평점: </span>
          <div class="star-rating">
            <span v-for="i in 5" :key="i" class="star" @click="setReviewRating(i)">{{ i <= (reviewRating || 0) ? '⭐' : '☆' }}</span>
          </div>
        </div>
        <button @click="submitReview" class="submit-review">리뷰 작성</button>
      </div>
    </div>

    <!-- 리뷰 목록 -->
    <div class="review-list-container">
      <ul class="review-list" v-if="reviews.length">
        <li v-for="review in reviews" :key="review.id" class="review-item">
          <!-- 리뷰 헤더 -->
          <div class="review-header">
            <div class="user-profile">
              <div class="user-avatar profile-link" @click="goToUserProfile(review.user)">
                {{ review.user.charAt(0) }}
              </div>
              <div class="user-info">
                <div class="username">
                  <span class="profile-link" @click="goToUserProfile(review.user)">{{ review.user }}</span>
                  <span v-if="isMyReview(review)" class="author-badge">내 리뷰</span>
                </div>
                <div class="rating-date">
                  <span class="stars">{{ '⭐'.repeat(Math.round(review.rating || 4.5)) }}</span>
                  <span class="rating-value">{{ review.rating || 4.5 }}</span>
                </div>
              </div>
            </div>
            <!-- 내 리뷰에만 수정/삭제 버튼 표시 -->
            <div v-if="isMyReview(review)" class="review-controls">
              <button @click="startEditReview(review)" class="edit-btn">
                <span class="edit-emoji">✏️</span>
              </button>
              <button @click="confirmDelete(review.id)" class="delete-btn">
                <span class="delete-emoji">🗑️</span>
              </button>
            </div>
          </div>
          
          <!-- 리뷰 내용 (수정 모드에 따라 다르게 표시) -->
          <div v-if="editingReview && editingReview.id === review.id" class="review-edit-form">
            <textarea 
              v-model="editReviewContent" 
              class="edit-review-textarea"
              rows="3"
            ></textarea>
            <div class="review-form-footer">
              <div class="review-rating">
                <span>평점: </span>
                <div class="star-rating">
                  <span v-for="i in 5" :key="i" class="star" @click="setEditReviewRating(i)">
                    {{ i <= (editReviewRating || 0) ? '⭐' : '☆' }}
                  </span>
                </div>
              </div>
              <div class="edit-buttons">
                <button @click="cancelEditReview()" class="cancel-edit-btn">취소</button>
                <button @click="saveEditReview(review.id)" class="save-edit-btn">
                  <span class="save-icon">💾</span> 저장
                </button>
              </div>
            </div>
          </div>
          <p v-else class="review-content">{{ review.content }}</p>
          
          <!-- 리뷰 풋터 -->
          <div class="review-footer">
            <div class="review-stats">
              <span class="likes">좋아요 {{ review.like_count }}</span>
              <span class="replies">댓글 {{ review.replies?.length || 0 }}</span>
              <span class="date">{{ formatDate(review.created_at) }}</span>
            </div>
            <div class="review-actions">
              <button
                @click="toggleReviewLike(review)"
                :class="{ 'btn-liked': review.liked }"
                class="btn-action"
              >
                <span class="action-icon">{{ review.liked ? '❤️' : '👍' }}</span>
              </button>
              <button @click="toggleReplyBox(review.id)" class="btn-action">
                <span class="action-icon">💬</span>
              </button>
            </div>
          </div>

          <!-- 답글 영역 -->
          <div class="reply-section" v-if="showReplyBox[review.id] || review.replies?.length">
            <!-- 답글 입력창 -->
            <div v-if="showReplyBox[review.id]" class="reply-form">
              <div class="user-avatar reply-avatar">
                {{ authStore.user?.username?.charAt(0) || 'U' }}
              </div>
              <div class="reply-input-wrapper">
                <input
                  v-model="replyInputs[review.id]"
                  @keyup.enter="submitReply(review.id)"
                  placeholder="답글을 입력하세요..."
                  class="reply-input"
                />
                <button @click="submitReply(review.id)" class="reply-btn">등록</button>
              </div>
            </div>

            <!-- 답글 목록 -->
            <ul class="reply-list" v-if="review.replies?.length">
              <li v-for="reply in review.replies" :key="reply.id" class="reply-item">
                <div class="reply-header">
                  <div class="user-avatar reply-avatar profile-link" @click="goToUserProfile(reply.user)">
                    {{ reply.user.charAt(0) }}
                  </div>
                  <div class="reply-content-wrapper">
                    <div class="reply-user-info">
                      <span class="username">
                        <span class="profile-link" @click="goToUserProfile(reply.user)">{{ reply.user }}</span>
                        <span v-if="isMyReply(reply)" class="author-badge">내 답글</span>
                      </span>
                      <span class="date">{{ formatDate(reply.created_at) }}</span>
                      
                      <!-- 내 답글에만 수정/삭제 버튼 표시 -->
                      <div v-if="isMyReply(reply)" class="reply-controls">
                        <button @click="startEditReply(reply, review.id)" class="edit-btn edit-reply-btn">
                          <span class="edit-emoji">✏️</span>
                        </button>
                        <button @click="confirmDeleteReply(reply.id, review.id)" class="delete-btn delete-reply-btn">
                          <span class="delete-emoji">🗑️</span>
                        </button>
                      </div>
                    </div>
                    
                    <!-- 답글 내용 (수정 모드에 따라 다르게 표시) -->
                    <div v-if="editingReply && editingReply.id === reply.id" class="reply-edit-form">
                      <input 
                        v-model="editReplyContent" 
                        class="edit-reply-input"
                        @keyup.enter="saveEditReply(reply.id, review.id)"
                      />
                      <div class="reply-edit-buttons">
                        <button @click="cancelEditReply()" class="cancel-edit-btn">취소</button>
                        <button @click="saveEditReply(reply.id, review.id)" class="save-edit-btn">
                          <span class="save-icon">💾</span> 저장
                        </button>
                      </div>
                    </div>
                    <p v-else class="reply-content">{{ reply.content }}</p>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </li>
      </ul>
      <div v-else class="no-review">
        <div class="no-review-icon">💭</div>
        <p>아직 등록된 리뷰가 없습니다</p>
        <p>처음으로 리뷰를 작성해보세요!</p>
      </div>
    </div>

    <!-- 알림 메시지 -->
    <div v-if="showAlert" class="popup-alert">{{ alertMessage }}</div>
    
    <!-- 리뷰 삭제 확인 모달 팝업 -->
    <div v-if="Object.values(showDeleteConfirm).some(v => v)" class="modal-overlay">
      <div class="modal-content">
        <h3>리뷰 삭제</h3>
        <p>작성하신 리뷰를 삭제하시겠습니까?</p>
        <div class="modal-buttons">
          <button @click="deleteReview(currentDeleteId)" class="confirm-yes">삭제하기</button>
          <button @click="cancelDelete(currentDeleteId)" class="confirm-no">취소</button>
        </div>
      </div>
    </div>
    
    <!-- 답글 삭제 확인 모달 팝업 -->
    <div v-if="Object.values(showDeleteReplyConfirm).some(v => v)" class="modal-overlay">
      <div class="modal-content">
        <h3>답글 삭제</h3>
        <p>작성하신 답글을 삭제하시겠습니까?</p>
        <div class="modal-buttons">
          <button @click="deleteReply(currentDeleteReplyId, currentDeleteReplyReviewId)" class="confirm-yes">삭제하기</button>
          <button @click="cancelDeleteReply(currentDeleteReplyId)" class="confirm-no">취소</button>
        </div>
      </div>
    </div>
  </div>
</template>
  
<script setup>
import { ref, onMounted, computed } from 'vue'
import { fetchReviews as fetchMovieReviews, createReview, toggleReviewLike as toggleReviewLikeApi, createReviewReply, deleteReview as deleteReviewApi, updateReview, updateReviewReply, deleteReviewReply } from '@/api/movies'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const props = defineProps({
  movieId: {
    type: Number,
    required: true
  }
})

const authStore = useAuthStore()
const router = useRouter()
const reviews = ref([])
const newReview = ref('')
const reviewRating = ref(5) // 기본 평점 5점
const showAlert = ref(false)
const alertMessage = ref('')
const replyInputs = ref({})
const showReplyBox = ref({})
const showDeleteConfirm = ref({})
const currentDeleteId = ref(null) // 현재 삭제할 리뷰 ID

// 리뷰 수정 관련 상태 변수
const editingReview = ref(null) // 현재 수정 중인 리뷰
const editReviewContent = ref('') // 수정 중인 리뷰 내용
const editReviewRating = ref(5) // 수정 중인 리뷰 평점

// 답글 수정 관련 상태 변수
const editingReply = ref(null) // 현재 수정 중인 답글
const editReplyContent = ref('') // 수정 중인 답글 내용
const showDeleteReplyConfirm = ref({}) // 답글 삭제 확인 상태
const currentDeleteReplyId = ref(null) // 현재 삭제할 답글 ID
const currentDeleteReplyReviewId = ref(null) // 현재 삭제할 답글이 속한 리뷰 ID

// 인증 스토어에서 현재 사용자 정보 가져오기
const currentUser = computed(() => authStore.user)

// 사용자 프로필로 이동
const goToUserProfile = (username) => {
  router.push(`/profile/${username}`)
}

// 평점 설정 함수
const setReviewRating = (rating) => {
  reviewRating.value = rating
}

// 수정 모드에서 평점 설정
const setEditReviewRating = (rating) => {
  editReviewRating.value = rating
}

// 날짜 포맷팅
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return isNaN(date) ? '' : date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 리뷰 목록 불러오기
const fetchReviews = async () => {
  try {
    const result = await fetchMovieReviews(props.movieId)
    
    if (result.success) {
      // 방어 코드: 배열이 아니면 빈 배열로 처리
      reviews.value = Array.isArray(result.data) ? result.data : []
    } else {
      throw new Error(result.message || '리뷰를 불러오지 못했습니다')
    }
  } catch (error) {
    console.error('리뷰 불러오기 오류:', error)
    handleError('리뷰를 불러오지 못했습니다')
    reviews.value = []
  }
}

// 리뷰 작성
const submitReview = async () => {
  try {
    if (!newReview.value.trim()) {
      return handleError('리뷰 내용을 입력해주세요.')
    }

    // 영화 ID, 리뷰 내용, 평점 전송
    const response = await createReview(props.movieId, {
      content: newReview.value,
      rating: reviewRating.value
    })

    if (response.success) {
      // 새 리뷰 추가 및 폼 초기화
      reviews.value.unshift(response.data) // 가장 새 리뷰를 리스트 상단에 추가
      newReview.value = ''
      reviewRating.value = 5 // 평점 초기화
    } else {
      handleError(response.message || '리뷰 작성 중 오류가 발생했습니다')
    }
  } catch (error) {
    console.error('리뷰 작성 오류:', error)
    handleError('로그인이 필요하거나 서버 오류가 발생했습니다')
  }
}

// 답글 작성
const submitReply = async (reviewId) => {
  const content = replyInputs.value[reviewId]
  if (!content?.trim()) return
  try {
    const result = await createReviewReply(reviewId, content)
    
    if (result.success) {
      replyInputs.value[reviewId] = ''
      await fetchReviews()
    } else {
      throw new Error(result.message || '답글 작성 실패')
    }
  } catch (error) {
    console.error('답글 작성 오류:', error)
    handleError(error.message || '답글 작성 실패')
  }
}

// 리뷰 좋아요 토글
const toggleReviewLike = async (review) => {
  try {
    const result = await toggleReviewLikeApi(review.id)
    
    if (result.success) {
      // 서버에서 반환한 상태로 업데이트
      review.liked = result.data.liked
      review.like_count = result.data.like_count
    } else {
      throw new Error(result.message || '좋아요 처리 실패')
    }
  } catch (error) {
    console.error('리뷰 좋아요 처리 오류:', error)
    handleError(error.message || '좋아요 처리 실패')
  }
}

// 답글 입력창 토글
const toggleReplyBox = (reviewId) => {
  showReplyBox.value[reviewId] = !showReplyBox.value[reviewId]
}

// 현재 사용자가 작성한 리뷰인지 확인
const isMyReview = (review) => {
  if (!currentUser.value || !review) return false
  
  // 리뷰 작성자와 현재 사용자 이름 비교
  return currentUser.value.username === review.user
}

// 현재 사용자가 작성한 답글인지 확인
const isMyReply = (reply) => {
  if (!authStore.user) return false
  return reply.user === authStore.user.username
}

// 삭제 확인 대화상자 표시
const confirmDelete = (reviewId) => {
  currentDeleteId.value = reviewId
  showDeleteConfirm.value[reviewId] = true
}

// 답글 삭제 확인 대화상자 표시
const confirmDeleteReply = (replyId, reviewId) => {
  currentDeleteReplyId.value = replyId
  currentDeleteReplyReviewId.value = reviewId
  showDeleteReplyConfirm.value[replyId] = true
}

// 답글 삭제 취소
const cancelDeleteReply = (replyId) => {
  if (showDeleteReplyConfirm.value[replyId]) {
    showDeleteReplyConfirm.value[replyId] = false
  }
  currentDeleteReplyId.value = null
  currentDeleteReplyReviewId.value = null
}

// 답글 수정 시작
const startEditReply = (reply, reviewId) => {
  editingReply.value = reply
  editReplyContent.value = reply.content
}

// 답글 수정 취소
const cancelEditReply = () => {
  editingReply.value = null
  editReplyContent.value = ''
}

// 답글 수정 저장
const saveEditReply = async (replyId, reviewId) => {
  try {
    if (!editReplyContent.value.trim()) {
      return handleError('답글 내용을 입력해주세요.')
    }
    
    // 답글 수정 API 호출
    const response = await updateReviewReply(replyId, { content: editReplyContent.value })
    
    if (response.success) {
      // 리뷰 목록에서 해당 답글 업데이트
      const reviewIndex = reviews.value.findIndex(r => r.id === reviewId)
      if (reviewIndex !== -1 && reviews.value[reviewIndex].replies) {
        const replyIndex = reviews.value[reviewIndex].replies.findIndex(r => r.id === replyId)
        if (replyIndex !== -1) {
          reviews.value[reviewIndex].replies[replyIndex].content = editReplyContent.value
        }
      }
      
      // 수정 모드 종료
      cancelEditReply()
    } else {
      handleError(response.message || '답글 수정 중 오류가 발생했습니다')
    }
  } catch (error) {
    console.error('답글 수정 오류:', error)
    handleError('서버 오류가 발생했습니다')
  }
}

// 답글 삭제
const deleteReply = async (replyId, reviewId) => {
  try {
    const response = await deleteReviewReply(replyId)
    
    if (response.success) {
      // 리뷰 목록에서 해당 답글 삭제
      const reviewIndex = reviews.value.findIndex(r => r.id === reviewId)
      if (reviewIndex !== -1 && reviews.value[reviewIndex].replies) {
        reviews.value[reviewIndex].replies = reviews.value[reviewIndex].replies.filter(r => r.id !== replyId)
      }
      
      // 삭제 확인 대화상자 닫기
      cancelDeleteReply(replyId)
    } else {
      handleError(response.message || '답글 삭제 중 오류가 발생했습니다')
    }
  } catch (error) {
    console.error('답글 삭제 오류:', error)
    handleError('서버 오류가 발생했습니다')
  }
}

// 삭제 취소
const cancelDelete = (reviewId) => {
  if (showDeleteConfirm.value[reviewId]) {
    showDeleteConfirm.value[reviewId] = false
  }
  currentDeleteId.value = null
}

// 리뷰 수정 시작
const startEditReview = (review) => {
  editingReview.value = review
  editReviewContent.value = review.content
  editReviewRating.value = review.rating || 5
}

// 리뷰 수정 취소
const cancelEditReview = () => {
  editingReview.value = null
  editReviewContent.value = ''
  editReviewRating.value = 5
}

// 리뷰 수정 저장
const saveEditReview = async (reviewId) => {
  try {
    if (!editReviewContent.value.trim()) {
      return handleError('리뷰 내용을 입력해주세요.')
    }
    
    // 리뷰 수정 API 호출
    const response = await updateReview(reviewId, {
      content: editReviewContent.value,
      rating: editReviewRating.value
    })
    
    if (response.success) {
      // 리뷰 목록에서 해당 리뷰 업데이트
      const index = reviews.value.findIndex(r => r.id === reviewId)
      if (index !== -1) {
        reviews.value[index].content = editReviewContent.value
        reviews.value[index].rating = editReviewRating.value
      }
      
      // 수정 모드 종료
      cancelEditReview()
    } else {
      handleError(response.message || '리뷰 수정 중 오류가 발생했습니다')
    }
  } catch (error) {
    console.error('리뷰 수정 오류:', error)
    handleError('서버 오류가 발생했습니다')
  }
}

// 리뷰 삭제
const deleteReview = async (reviewId) => {
  try {
    const result = await deleteReviewApi(reviewId)
    
    if (result.success) {
      handleError('리뷰가 삭제되었습니다')
      await fetchReviews()
    } else {
      throw new Error(result.message || '리뷰 삭제에 실패했습니다')
    }
  } catch (error) {
    console.error('리뷰 삭제 오류:', error)
    handleError(error.message || '리뷰 삭제에 실패했습니다')
  } finally {
    showDeleteConfirm.value[reviewId] = false
  }
}

// 에러 처리
const handleError = (message) => {
  alertMessage.value = message
  showAlert.value = true
  setTimeout(() => (showAlert.value = false), 2000)
}

// 초기 데이터 로드
onMounted(fetchReviews)
</script>

<style scoped>
.review-section {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background-color: transparent;
  box-sizing: border-box;
  position: relative;
}

/* 상단 선 제거됨 */

/* 리뷰 헤더 */
.review-header-main {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
  position: relative;
  gap: 1rem;
}

.review-title {
  font-size: 1.6rem;
  font-weight: 700;
  color: #222;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.review-title::before {
  content: '💬';
  font-size: 1.4rem;
}

.review-title span {
  color: #666;
  font-size: 1rem;
  font-weight: 500;
  background-color: #f5f5f5;
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  margin-left: 0.5rem;
}

.review-count {
  color: #00A676;
  font-weight: 700;
  margin-left: 0.4rem;
}

.review-sorting {
  display: flex;
  gap: 0.5rem;
  position: relative;
}

.review-sorting::before {
  content: '🔍';
  font-size: 0.9rem;
  position: absolute;
  left: -1.5rem;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0.7;
}

.sort-button {
  background: none;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 0.4rem 0.8rem;
  font-size: 0.85rem;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.sort-button:hover {
  background-color: #f5f5f5;
}

.sort-button.active {
  background-color: #00A676;
  color: white;
  border-color: transparent;
}

/* 리뷰 작성 폼 */
.review-form {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 1.2rem;
  margin-bottom: 2rem;
  border: 1px solid #eee;
}

.review-form textarea {
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  font-size: 0.95rem;
  resize: none;
  margin-bottom: 1rem;
  transition: border-color 0.2s;
  box-sizing: border-box;
  font-family: inherit;
  line-height: 1.5;
}

.review-form textarea:focus {
  outline: none;
  border-color: #00A676;
}

.review-form textarea::placeholder {
  color: #aaa;
}

.review-form-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.5rem;
  border-top: 1px dashed #eee;
}

.review-rating {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #555;
  font-size: 0.9rem;
}

.review-rating span:first-child {
  font-weight: 600;
}

.star-rating {
  display: flex;
  gap: 0.2rem;
}

.star {
  cursor: pointer;
  font-size: 1rem;
  transition: transform 0.2s;
}

.star:hover {
  transform: scale(1.2);
}

.submit-review {
  background-color: #00A676;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.6rem 1.2rem;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.submit-review:hover {
  background-color: #008f66;
}

/* 리뷰 목록 */
.review-list-container {
  margin-top: 2rem;
}

.review-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.review-item {
  border-bottom: 1px solid #f0f0f0;
  padding: 2rem 1.5rem;
  transition: all 0.25s ease;
  margin: 1rem 0;
  border-radius: 12px;
  position: relative;
}

.review-item:hover {
  background-color: #f8fbfa;
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.04);
}

.review-item::after {
  content: '💬';
  position: absolute;
  right: 1.5rem;
  bottom: 1.5rem;
  font-size: 1.5rem;
  opacity: 0.05;
  transform: rotate(-10deg);
}

.review-item:last-child {
  border-bottom: none;
}

.review-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.2rem;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00A676 0%, #4ecdc4 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.4rem;
  box-shadow: 0 4px 10px rgba(0, 166, 118, 0.25);
  position: relative;
  overflow: hidden;
  transform: rotate(-5deg);
  transition: all 0.3s ease;
}

.user-avatar::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 70% 30%, rgba(255, 255, 255, 0.2) 0%, transparent 70%);
  top: 0;
  left: 0;
}

.user-profile:hover .user-avatar {
  transform: rotate(0deg) scale(1.05);
}

.user-info {
  display: flex;
  flex-direction: column;
}

.username {
  font-weight: 700;
  font-size: 1.05rem;
  color: #222;
  display: flex;
  align-items: center;
  letter-spacing: 0.01em;
  position: relative;
}

.username::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(to right, #00A676, transparent);
  transition: width 0.3s ease;
}

.user-profile:hover .username::after {
  width: 100%;
}

.author-badge {
  background-color: #f0f7ff;
  color: #1a73e8;
  padding: 0.15rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  margin-left: 0.5rem;
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(26, 115, 232, 0.1);
  position: relative;
  overflow: hidden;
}

.author-badge::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%);
  transform: rotate(30deg);
  animation: shineEffect 3s infinite;
  pointer-events: none;
}

@keyframes shineEffect {
  0% { transform: translateX(-100%) rotate(30deg); }
  100% { transform: translateX(100%) rotate(30deg); }
}

.rating-date {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.stars {
  font-size: 1rem;
  letter-spacing: 0px;
  line-height: 1;
  display: inline-block;
  position: relative;
}

.stars span {
  display: inline-block;
  transition: transform 0.2s ease;
}

.stars:hover span {
  animation: starPulse 1s infinite alternate;
}

@keyframes starPulse {
  0% { transform: scale(1); }
  100% { transform: scale(1.15); }
}

.rating-value {
  font-size: 0.9rem;
  color: #555;
  font-weight: 600;
  background-color: #f5f5f5;
  padding: 0.2rem 0.5rem;
  border-radius: 8px;
}

.review-content {
  font-size: 1.1rem;
  line-height: 1.7;
  color: #333;
  margin: 1rem 0 1.4rem;
  white-space: pre-wrap;
  padding: 0.5rem 1rem;
  background-color: rgba(245, 250, 248, 0.7);
  border-radius: 10px;
  border-left: 3px solid #00A676;
  transition: all 0.2s ease;
  position: relative;
}

.review-content:hover {
  background-color: rgba(245, 250, 248, 1);
  transform: translateX(5px);
}

/* 리뷰 푸터 */
.review-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.2rem;
  padding: 0.5rem 0;
  border-top: 1px dashed #f0f0f0;
  padding-top: 1rem;
}

.review-stats {
  display: flex;
  gap: 1.2rem;
  color: #555;
  font-size: 0.9rem;
}

.likes, .replies, .date {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.likes::before {
  content: '❤️';
  font-size: 0.9rem;
  opacity: 0.7;
}

.replies::before {
  content: '💬';
  font-size: 0.9rem;
  opacity: 0.7;
}

.date::before {
  content: '📅';
  font-size: 0.9rem;
  opacity: 0.7;
}

.review-actions {
  display: flex;
  gap: 0.8rem;
}

.btn-action {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  color: #555;
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-action:hover {
  background-color: #f5f5f5;
  transform: translateY(-2px);
}

.btn-liked {
  color: #e41b17;
}

.action-icon {
  font-size: 1.2rem;
}

/* 답글 영역 */
.reply-section {
  margin-top: 1.5rem;
  padding-top: 1.2rem;
  background-color: #fafafa;
  border-radius: 12px;
  padding: 1.2rem 1.5rem;
  margin-bottom: 0.5rem;
}

.reply-form {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  align-items: flex-start;
}

.reply-avatar {
  width: 36px;
  height: 36px;
  font-size: 1rem;
  box-shadow: 0 2px 6px rgba(0, 166, 118, 0.15);
}

.reply-input-wrapper {
  flex: 1;
  display: flex;
  gap: 0.5rem;
  position: relative;
}

.reply-input {
  flex: 1;
  border: 1px solid #e0e0e0;
  border-radius: 24px;
  padding: 0.7rem 1.2rem;
  font-size: 0.95rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  transition: all 0.2s;
}

.reply-input:focus {
  outline: none;
  border-color: #00A676;
  box-shadow: 0 0 0 2px rgba(0, 166, 118, 0.1);
}

.reply-btn {
  background-color: #00A676;
  color: white;
  border: none;
  border-radius: 24px;
  padding: 0.7rem 1.2rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  box-shadow: 0 2px 6px rgba(0, 166, 118, 0.2);
  transition: all 0.2s;
}

.reply-btn:hover {
  background-color: #008f66;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 166, 118, 0.3);
}

.reply-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.reply-item {
  margin-bottom: 1.2rem;
  padding-left: 3rem;
  position: relative;
}

.reply-item:last-child {
  margin-bottom: 0;
}

.reply-item::before {
  content: '';
  position: absolute;
  left: 1.2rem;
  top: 0.6rem;
  height: calc(100% - 0.6rem);
  width: 1px;
  background-color: #e0e0e0;
}

.reply-header {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.6rem;
}

.reply-content-wrapper {
  flex: 1;
  background-color: white;
  padding: 0.8rem 1rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.reply-user-info {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 0.4rem;
}

.reply-user-info .username {
  font-weight: 600;
  color: #333;
}

.reply-user-info .date {
  font-size: 0.8rem;
  color: #888;
  position: relative;
  padding-left: 0.8rem;
}

.reply-user-info .date::before {
  content: '•';
  position: absolute;
  left: 0.2rem;
  top: 0;
  color: #ccc;
}

.reply-content {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.5;
  color: #444;
}

/* 삭제 버튼 스타일 */
.delete-btn, .edit-btn {
  color: #9e9e9e;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0;
  margin-left: 0.5rem;
  opacity: 0.5;
  transition: opacity 0.2s;
}

.delete-btn:hover, .edit-btn:hover {
  opacity: 1;
}

.review-edit-form {
  margin-bottom: 1rem;
  width: 100%;
}

.edit-review-textarea {
  width: 100%;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px;
  font-size: 1rem;
  resize: vertical;
  font-family: inherit;
  margin-bottom: 0.5rem;
  transition: border-color 0.3s;
}

.edit-review-textarea:focus {
  outline: none;
  border-color: var(--color-primary);
}

.edit-buttons {
  display: flex;
  gap: 10px;
  margin-left: auto;
}

.cancel-edit-btn, .save-edit-btn {
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 80px;
  height: 36px;
}

.cancel-edit-btn {
  background-color: #f5f5f5;
  color: #757575;
  border: 1px solid #e0e0e0;
}

.save-edit-btn {
  background-color: #4CAF50; /* 초록색으로 변경 */
  color: white;
  border: none;
  font-weight: bold;
  font-size: 1rem;
  gap: 5px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.cancel-edit-btn:hover {
  background-color: #e0e0e0;
}

.save-edit-btn:hover {
  background-color: var(--color-primary-dark, #1976d2);
}

/* 답글 수정 스타일 */
.reply-controls {
  display: flex;
  gap: 5px;
  margin-left: 10px;
}

.edit-reply-btn, .delete-reply-btn {
  font-size: 0.9rem;
  padding: 0;
  margin-left: 0.3rem;
}

.reply-edit-form {
  margin-top: 5px;
  width: 100%;
}

.edit-reply-input {
  width: 100%;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 0.9rem;
  font-family: inherit;
  margin-bottom: 5px;
  transition: border-color 0.3s;
}

.edit-reply-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.reply-edit-buttons {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.reply-user-info {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

/* 프로필 링크 스타일 */
.profile-link {
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.user-avatar.profile-link:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.username .profile-link {
  color: #2c3e50;
  font-weight: 500;
}

.username .profile-link:hover {
  color: var(--color-primary, #4CAF50);
}

.username .profile-link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 1px;
  background-color: var(--color-primary, #4CAF50);
  transition: width 0.2s ease;
}

.username .profile-link:hover::after {
  width: 100%;
}

.material-icons {
  font-size: 1.2rem;
}

/* 모달 스타일 */
.modal-overlay {
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
}

.modal-content {
  background-color: white;
  padding: 2rem;
  border-radius: 12px;
  max-width: 400px;
  width: 90%;
  text-align: center;
}

.modal-content h3 {
  margin-top: 0;
  color: #333;
}

.modal-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
}

.modal-buttons button {
  padding: 0.7rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.confirm-yes {
  background-color: #e41b17;
  color: white;
  border: none;
}

.confirm-yes:hover {
  background-color: #c61a17;
}

.confirm-no {
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
}

.confirm-no:hover {
  background-color: #e9e9e9;
}

/* 알림 팝업 */
.popup-alert {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(51, 51, 51, 0.9);
  color: white;
  padding: 1rem 2rem;
  border-radius: 8px;
  z-index: 1000;
  animation: fadeIn 0.3s, fadeOut 0.3s 1.7s;
  font-size: 0.95rem;
}

/* 리뷰 없음 상태 */
.no-review {
  text-align: center;
  padding: 3rem 0;
  color: #888;
}

.no-review-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

/* 애니메이션 */
@keyframes fadeIn {
  from { opacity: 0; transform: translate(-50%, 20px); }
  to { opacity: 1; transform: translate(-50%, 0); }
}

@keyframes fadeOut {
  from { opacity: 1; transform: translate(-50%, 0); }
  to { opacity: 0; transform: translate(-50%, 20px); }
}

/* 반응형 스타일 */
@media (max-width: 768px) {
  .review-form-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .submit-review {
    align-self: flex-end;
  }
  
  .review-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.8rem;
  }
  
  .review-actions {
    align-self: flex-end;
  }
}
</style>