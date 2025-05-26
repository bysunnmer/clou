<template>
    <div class="review-section">
      <h3 class="review-title">📝 리뷰 ({{ reviews.length }})</h3>
      
      <!-- 리뷰 작성 폼 -->
      <div class="review-form">
        <textarea
          v-model="newReview"
          placeholder="리뷰를 입력하세요"
          rows="3"
        ></textarea>
        <button @click="submitReview">리뷰 등록</button>
      </div>
  
      <!-- 리뷰 목록 -->
      <ul class="review-list" v-if="reviews.length">
        <li v-for="review in reviews" :key="review.id" class="review-item">
          <div class="review-main">
            <div class="review-header">
              <span class="username">{{ review.user }}</span>
              <span class="date">{{ formatDate(review.created_at) }}</span>
            </div>
            <p class="content">{{ review.content }}</p>
            
            <!-- 좋아요 & 답글 버튼 -->
            <div class="review-actions">
              <button
                @click="toggleReviewLike(review)"
                :class="{ liked: review.liked }"
              >
                ❤️ {{ review.like_count }}
              </button>
              <button @click="toggleReplyBox(review.id)">💬 답글</button>
            </div>
          </div>
  
          <!-- 답글 입력창 -->
          <div v-if="showReplyBox[review.id]" class="reply-form">
            <input
              v-model="replyInputs[review.id]"
              @keyup.enter="submitReply(review.id)"
              placeholder="답글을 입력하세요"
            />
            <button @click="submitReply(review.id)" class="reply-btn">등록</button>
          </div>
  
          <!-- 답글 목록 -->
          <ul class="reply-list" v-if="review.replies?.length">
            <li v-for="reply in review.replies" :key="reply.id" class="reply-item">
              <div class="reply-header">
                <span class="username">{{ reply.user }}</span>
                <span class="date">{{ formatDate(reply.created_at) }}</span>
              </div>
              <p class="content">{{ reply.content }}</p>
            </li>
          </ul>
        </li>
      </ul>
      <p v-else class="no-review">아직 등록된 리뷰가 없습니다.</p>
  
      <!-- 알림 메시지 -->
      <div v-if="showAlert" class="popup-alert">{{ alertMessage }}</div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import axios from 'axios'
  
  const props = defineProps({
    movieId: {
      type: Number,
      required: true
    }
  })
  
  const reviews = ref([])
  const newReview = ref('')
  const showAlert = ref(false)
  const alertMessage = ref('')
  const replyInputs = ref({})
  const showReplyBox = ref({})
  
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
        const res = await axios.get(`/api/movies/${props.movieId}/reviews/`)
        // 방어 코드: 배열이 아니면 빈 배열로 처리
        reviews.value = Array.isArray(res.data) ? res.data : []
      } catch (error) {
        handleError('리뷰를 불러오지 못했습니다')
        reviews.value = []
      }
    }
    
  
  // 리뷰 작성
  const submitReview = async () => {
    if (!newReview.value.trim()) {
      handleError('리뷰 내용을 입력해주세요')
      return
    }
    try {
      await axios.post(`/api/movies/${props.movieId}/reviews/`, {
        content: newReview.value
      })
      newReview.value = ''
      await fetchReviews()
    } catch (error) {
      handleError('리뷰 작성 실패')
    }
  }
  
  // 답글 작성
  const submitReply = async (reviewId) => {
    const content = replyInputs.value[reviewId]
    if (!content?.trim()) return
    try {
      await axios.post(`/api/reviews/${reviewId}/replies/`, { content })
      replyInputs.value[reviewId] = ''
      await fetchReviews()
    } catch (error) {
      handleError('답글 작성 실패')
    }
  }
  
  // 좋아요 토글
  const toggleReviewLike = async (review) => {
    try {
      const res = await axios.post(`/api/reviews/${review.id}/like/`)
      review.like_count = res.data.like_count
      review.liked = res.data.liked
    } catch (error) {
      handleError('좋아요 처리 실패')
    }
  }
  
  // 답글 입력창 토글
  const toggleReplyBox = (reviewId) => {
    showReplyBox.value[reviewId] = !showReplyBox.value[reviewId]
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
          margin: rem auto;        /* 섹션 전체 위아래 여백 */
          padding: 2rem 1.5rem;
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 0 10px rgba(0,0,0,0.05);
          max-width: 900px;
          width: 90%;
          box-sizing: border-box;
        }
          
        .review-title {
          margin-top: 2rem;         /* 타이틀 위쪽 여백 */
          margin-bottom: 2rem;      /* 타이틀 아래쪽 여백 */
          font-size: 1.3rem;
          font-weight: bold;
          color: #333;
          padding-top: 2rem;
        }
          
          .review-form {
            display: flex;
            flex-direction: column;
            gap: 0.8rem;
            margin-bottom: 2rem;
          }
          
          .review-form textarea {
            width: 100%;
            resize: none;
            padding: 0.8rem;
            border-radius: 8px;
            border: 1px solid #ccc;
            font-size: 0.95rem;
            min-height: 100px;
            box-sizing: border-box;
          }
          
          .review-form button {
            background-color: #00A676;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 9999px;
            cursor: pointer;
            font-weight: bold;
            align-self: flex-start;
            transition: background-color 0.2s ease;
          }
          
          .review-form button:hover {
            background-color: #00885A;
          }
          
          .review-list {
            margin-top: 2rem;
            list-style: none;
            padding: 0;
          }
          
          .review-item {
            background-color: #f8f9fa;
            padding: 1rem 1.25rem;
            border-radius: 12px;
            margin-bottom: 1.2rem;
          }
          
          .review-header,
          .reply-header {
            display: flex;
            justify-content: space-between;
            font-size: 0.85rem;
            color: #666;
            margin-bottom: 0.3rem;
          }
          
          .content {
            font-size: 0.95rem;
            margin: 0.5rem 0;
            color: #333;
          }
          
          .review-actions {
            display: flex;
            gap: 1rem;
            margin-top: 0.5rem;
          }
          
          .review-actions button {
            background: none;
            border: none;
            font-size: 0.95rem;
            cursor: pointer;
          }
          
          .review-actions .liked {
            color: #e63946;
          }
          
          .reply-form {
            display: flex;
            gap: 0.5rem;
            margin-top: 0.8rem;
          }
          
          .reply-form input {
            flex: 1;
            padding: 0.5rem;
            border-radius: 8px;
            border: 1px solid #ccc;
          }
          
          .reply-btn {
            background-color: #FFC1DA;
            color: #333;
            border: none;
            padding: 0.4rem 0.8rem;
            border-radius: 8px;
            font-weight: bold;
            cursor: pointer;
          }
          
          .reply-list {
            margin-top: 0.8rem;
            padding-left: 1rem;
            border-left: 2px solid #eee;
          }
          
          .reply-item {
            background-color: #fff;
            padding: 0.6rem 1rem;
            border-radius: 8px;
            margin-bottom: 0.5rem;
            font-size: 0.9rem;
          }
          
          .no-review {
              text-align: center;
              color: #aaa;
              margin-bottom: 2.5rem;    /* 안내문 아래쪽 여백 */
              font-style: italic;
              font-size: 1rem;
              padding-bottom: 2rem;
            }
          
            .popup-alert {
              position: fixed;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              background-color: #00A676;
              color: #fff;
              padding: 1rem 2rem;
              border-radius: 10px;
              font-weight: bold;
              font-size: 1rem;
              z-index: 9999;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
              animation: fadeInOut 2s ease-in-out;
            }
            
            @keyframes fadeInOut {
              0% {
                opacity: 0;
                transform: translate(-50%, -60%);
              }
              10%, 90% {
                opacity: 1;
                transform: translate(-50%, -50%);
              }
              100% {
                opacity: 0;
                transform: translate(-50%, -60%);
              }
            }
          
          /* 🔥 반응형 미디어 쿼리 (큰 화면부터 작은 화면 순서) */
          @media (max-width: 1200px) {
            .review-section {
              width: calc(100% - 2rem);
              padding: 1.8rem;
            }
          }
          
          @media (max-width: 768px) {
            .review-section {
              width: calc(100% - 1rem);
              margin: 1rem auto;
              padding: 1.2rem;
              border-radius: 12px;
            }
            
            .review-title {
              font-size: 1.1rem;
              margin-bottom: 1.5rem;
            }
            
            .review-form textarea {
              min-height: 80px;
              font-size: 0.9rem;
            }
            
            .no-review {
              font-size: 0.9rem;
              margin: 1.5rem 0;
            }
          }
          
          @media (max-width: 480px) {
              .review-section {
                  margin: 1.5rem auto;
                  padding: 1rem 0.5rem;
                  border-radius: 10px;
                  width: 98vw;
                  max-width: 99vw;
                }
                .review-title {
                  margin-top: 1rem;
                  margin-bottom: 1.2rem;
                  font-size: 1.05rem;
                }
            
            .review-form {
              gap: 0.6rem;
              margin-bottom: 1.5rem;
            }
            
            .review-form textarea {
              min-height: 70px;
              padding: 0.6rem;
            }
            
            .no-review {
              margin-top: 2rem;
              margin-bottom: 1.5rem;
              font-size: 0.95rem;
            }
          } 
  </style>
  