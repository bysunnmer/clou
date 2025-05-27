<template>
  <div class="emotion-view-wrapper">
    <div class="header-section">
      <h2 class="page-title">🎬 감정으로 찾는 영화</h2>
      <p class="page-description">지금 느끼고 싶은 감정을 선택하여 나에게 딱 맞는 영화를 찾아보세요</p>
    </div>
    
    <div class="emotion-content">
      
      <h2 class="section-title">어떤 감정을 느끼고 싶으세요?</h2>
      
      <!-- 감정 버튼 영역 -->
      <div class="emotion-buttons-container">
        <div class="emotion-buttons">
          <button
            v-for="emotion in emotions"
            :key="emotion.id"
            class="emotion-btn"
            :class="{ 'selected': selectedEmotion === emotion.name }"
            @click="loadEmotionMovies(emotion.name)"
          >
            <span class="emotion-icon">{{ getEmotionIcon(emotion.name) }}</span>
            <span class="emotion-name">{{ emotion.name }}</span>
          </button>
        </div>
      </div>
      
      <!-- 선택된 감정 제목 -->
      <div v-if="selectedEmotion" class="selected-emotion-title">
        <div class="title-icon">{{ getEmotionIcon(selectedEmotion) }}</div>
        <h3>“<span>{{ selectedEmotion }}</span>” 감정을 느끼게 해줄 영화들</h3>
        <p class="emotion-description">지금 당신의 감정에 딱 맞는 영화를 소개합니다.</p>
      </div>

      <!-- 영화 그리드 -->
      <div v-if="movies.length" class="movie-grid">
        <div 
          v-for="movie in movies" 
          :key="movie.id" 
          class="movie-card"
          :class="{ 'pulse-animation': movie.newlyLiked }"
        >
          <div class="poster-wrapper">
            <RouterLink :to="`/movies/${movie.tmdb_id}`">
              <img 
                class="poster" 
                :src="getImageUrl(movie.poster_path)" 
                :alt="movie.title" 
                loading="lazy"
              />
              <div class="overlay">
                <div class="overlay-content">
                  <p class="release-date">{{ formatDate(movie.release_date) }}</p>
                  <p class="overview">{{ truncateOverview(movie.overview) }}</p>
                  <div class="view-detail">상세 보기</div>
                </div>
              </div>
            </RouterLink>
            <div class="badge" v-if="isNewRelease(movie.release_date)">NEW</div>
          </div>
          
          <div class="card-content">
            <RouterLink :to="`/movies/${movie.tmdb_id}`" class="title">
              <h3>{{ movie.title }}</h3>
            </RouterLink>
            
            <div class="movie-meta">
              <div class="rating" v-if="movie.vote_average !== null && movie.vote_average !== undefined">
                <span class="stars">{{ renderStars(movie.vote_average) }}</span>
                <span class="score">{{ Number(movie.vote_average).toFixed(1) }}</span>
              </div>
              <div class="rating" v-else>
                <span class="score">평점 없음</span>
              </div>
              
              <button 
                class="like-btn" 
                @click="toggleLike(movie)"
                :aria-label="movie.is_liked ? '찜 취소하기' : '찜하기'"
              >
                <span class="like-icon">{{ movie.is_liked ? '❤️' : '🤍' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 영화가 없을 때 -->
      <div v-else-if="selectedEmotion" class="no-movies">
        <p>아직 {{ selectedEmotion }} 감정에 연결된 영화가 없습니다.</p>
        <p>다른 감정을 선택해보세요!</p>
      </div>
      
      <!-- 로딩 중이거나 감정 선택 전 -->
      <div v-else-if="!selectedEmotion && !isLoading" class="no-selection">
        <p>위에서 감정을 선택해주세요!</p>
      </div>
      
      <!-- 알림 팝업 -->
      <div v-if="showAlert" class="popup-alert">
        {{ alertMessage }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { fetchEmotions, fetchMoviesByEmotion } from '@/api/emotions'
import { toggleMovieLike } from '@/api/movies'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const emotions = ref([])
const movies = ref([])
const selectedEmotion = ref('')
const isLoading = ref(false)
const showAlert = ref(false)
const alertMessage = ref('')

// 감정 목록 불러오기
onMounted(async () => {
  try {
    const response = await fetchEmotions()
    emotions.value = response.data
  } catch (error) {
    console.error('감정 목록 불러오기 오류:', error)
    handleError('감정 목록을 불러오는 중 오류가 발생했습니다.')
  }
})

// 감정 클릭 시 영화 불러오기
const loadEmotionMovies = async (emotionName) => {
  try {
    isLoading.value = true
    selectedEmotion.value = emotionName
    const response = await fetchMoviesByEmotion(emotionName)
    movies.value = response.data
  } catch (error) {
    console.error('감정 기반 영화 불러오기 오류:', error)
    handleError('영화 목록을 불러오는 중 오류가 발생했습니다.')
  } finally {
    isLoading.value = false
  }
}

// 감정에 따른 아이콘 가져오기
const getEmotionIcon = (emotionName) => {
  const emotionIcons = {
    '행복': '😄',     // 행복: 웃는 이모티콘
    '슬픔': '😢',     // 슬픔: 울고 있는 이모티콘
    '공포': '😱',     // 공포: 무서워하는 이모티콘
    '분노': '😡',     // 분노: 화나있는 이모티콘
    '사랑': '❤️',      // 사랑: 하트
    '놀라움': '😮',   // 놀라움: 소리지르는 이모티콘
    '평온': '😌',     // 평온: 안도감을 느끼는 이모티콘
    '긴장': '😰',     // 긴장: 긴장된 이모티콘
    '감동': '🥹',     // 감동: 울고 있는 이모티콘
    '희망': '✨',       // 희망: 반짝이는 별
    '고독': '😔',     // 고독: 슬픈 이모티콘
    '호기심': '🧐',   // 호기심: 생각하는 이모티콘
    '울적함': '🤤',   // 울적함: 웃음을 참는 이모티콘
    '허전함': '😒',   // 허전함: 실망한 이모티콘
  }
  
  return emotionIcons[emotionName] || '🎭' // 기본 아이콘은 영화관 아이콘
}

// 영화 좋아요 토글
const toggleLike = async (movie) => {
  if (!authStore.isAuthenticated) {
    handleError('좋아요를 하려면 로그인이 필요합니다.')
    return
  }
  
  try {
    const response = await toggleMovieLike(movie.tmdb_id)
    if (response.data && response.data.liked !== undefined) {
      const wasLiked = movie.is_liked
      movie.is_liked = response.data.liked
      
      // 좋아요 클릭 시 펄스 애니메이션 적용
      if (!wasLiked && movie.is_liked) {
        movie.newlyLiked = true
        setTimeout(() => {
          movie.newlyLiked = false
        }, 600) // 애니메이션 지속 시간과 동일하게 설정
      }
      
      handleError(movie.is_liked ? '좋아요를 누르셨습니다!' : '좋아요를 취소하셨습니다.')
    }
  } catch (error) {
    console.error('좋아요 오류:', error)
    handleError('좋아요 처리 중 오류가 발생했습니다.')
  }
}

// 별점 표시 함수
const renderStars = (rating) => {
  if (rating === null || rating === undefined) return ''
  const fullStars = Math.floor(rating / 2)
  const halfStar = rating % 2 >= 1 ? 1 : 0
  const emptyStars = 5 - fullStars - halfStar
  
  return '⭐'.repeat(fullStars) + (halfStar ? '⭐' : '') + '☆'.repeat(emptyStars)
}

// 날짜 포맷팅
const formatDate = (dateString) => {
  if (!dateString) return '날짜 정보 없음';
  
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  const date = new Date(dateString);
  
  return date.toLocaleDateString('ko-KR', options);
}

// 최근 출시작 확인 (3개월 이내)
const isNewRelease = (dateString) => {
  if (!dateString) return false;
  
  const releaseDate = new Date(dateString);
  const now = new Date();
  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
  
  return releaseDate >= threeMonthsAgo;
}

// 설명 줄이기 함수
const truncateOverview = (text) => {
  if (!text) return ''
  return text.length > 150 ? text.substring(0, 150) + '...' : text
}

// 포스터 이미지 주소 가져오기
const getImageUrl = (path) => {
  if (!path) return 'https://via.placeholder.com/300x450?text=No+Image'
  if (path.startsWith('http')) return path
  return `https://image.tmdb.org/t/p/w500${path}`
}

// 알림 표시 함수
const handleError = (message) => {
  alertMessage.value = message
  showAlert.value = true
  setTimeout(() => {
    showAlert.value = false
  }, 3000)
}
</script>

<style scoped>
.emotion-view-wrapper {
  min-height: 100vh;
  overflow-x: hidden;
  background-color: #f8f9fa;
  padding-top: 60px; /* 네비게이션 바 높이만큼 패딩 추가 */
}

/* 헤더 섹션 */
.header-section {
  max-width: 1300px;
  margin: 0 auto;
  padding: 2.5rem 1rem 1.5rem;
  text-align: center;
}

.page-title {
  font-size: 1.8rem;
  margin-bottom: 1rem;
  font-weight: bold;
  color: #333;
  position: relative;
  display: inline-block;
}

.page-title::after {
  content: '';
  display: block;
  width: 60px;
  height: 3px;
  margin: 0.5rem auto 0;
  background-color: #00A676;
  border-radius: 2px;
}

.page-description {
  color: #666;
  font-size: 1.1rem;
  max-width: 600px;
  margin: 0 auto 2rem;
  line-height: 1.5;
}

.emotion-content {
  max-width: 1300px;
  margin: 0 auto;
  padding: 0 1rem 3rem;
  box-sizing: border-box;
  background-color: #f8f9fa;
}

.section-title {
  font-size: 1.5rem;
  text-align: center;
  margin: 2rem 0;
  font-weight: bold;
  color: #333;
  position: relative;
  display: inline-block;
  padding-bottom: 0.5rem;
  left: 50%;
  transform: translateX(-50%);
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background-color: #00A676;
  border-radius: 2px;
}

/* 감정 버튼 영역 */
.emotion-buttons-container {
  margin-bottom: 3rem;
}

.emotion-buttons {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: 16px;
  background-color: white;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  max-width: 900px;
  margin: 0 auto;
}

.emotion-btn {
  padding: 0.6rem 1.2rem;
  background-color: #f5f7fa;
  border: 1px solid transparent;
  border-radius: 30px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  color: #444;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
  display: flex;
  align-items: center;
  gap: 6px;
  position: relative;
  overflow: hidden;
}

.emotion-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(120deg, rgba(0,166,118,0.1), rgba(44,205,163,0.05));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.emotion-icon {
  font-size: 1.3rem;
}

.emotion-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(0,0,0,0.1);
  border-color: rgba(0, 166, 118, 0.3);
}

.emotion-btn:hover::before {
  opacity: 1;
}

.emotion-btn.selected {
  background-color: #00A676;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 166, 118, 0.3);
  border-color: #00A676;
}

.emotion-btn.selected::before {
  opacity: 0;
}

/* 선택된 감정 제목 */
.selected-emotion-title {
  margin: 3rem 0 2rem;
  text-align: center;
  position: relative;
}

.title-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  display: inline-block;
  background-color: #00A676;
  color: white;
  width: 80px;
  height: 80px;
  line-height: 80px;
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(0, 166, 118, 0.2);
}

.selected-emotion-title h3 {
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.selected-emotion-title span {
  color: #00A676;
  font-weight: bold;
  position: relative;
}

.emotion-description {
  color: #666;
  font-size: 1.1rem;
  max-width: 600px;
  margin: 0 auto;
}

/* 영화 그리드 */
.movie-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.movie-card {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.movie-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

/* 영화 카드 콘텐츠 */
.card-content {
  padding: 1rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.title {
  text-decoration: none;
  display: block;
  margin-bottom: 0.5rem;
}

.title h3 {
  font-size: 1rem;
  color: #333;
  font-weight: 500;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.2s;
}

.title:hover h3 {
  color: #00A676;
}

/* 영화 메타 정보 */
.movie-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 0.8rem;
}

.poster-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 2/3;
  overflow: hidden;
  border-radius: 12px 12px 0 0;
}

.poster {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.poster-wrapper:hover .poster {
  transform: scale(1.08);
}

/* 오버레이 (호버 시 표시) */
.overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0) 0%,
    rgba(0, 0, 0, 0.6) 50%,
    rgba(0, 0, 0, 0.9) 100%
  );
  color: white;
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  transform: translateY(10px);
}

.poster-wrapper:hover .overlay {
  opacity: 1;
  transform: translateY(0);
}

.overlay-content {
  padding: 1.5rem;
}

.release-date {
  font-size: 0.8rem;
  opacity: 0.9;
  margin: 0 0 0.5rem;
}

.overview {
  font-size: 0.85rem;
  line-height: 1.5;
  margin: 0.5rem 0;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 5;
  line-clamp: 5;
  -webkit-box-orient: vertical;
}

/* 신규 배지 */
.badge {
  position: absolute;
  top: 0.8rem;
  left: 0.8rem;
  background-color: #e74c3c;
  color: white;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 700;
  z-index: 2;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* Pulse Animation */
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.pulse-animation {
  animation: pulse 0.6s ease-in-out;
}

.view-detail {
  display: inline-block;
  margin-top: 0.8rem;
  padding: 0.4rem 1rem;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  text-align: center;
  width: fit-content;
}

.view-detail:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

.title {
  text-decoration: none;
  margin-bottom: 0.5rem;
}

.title h3 {
  color: #333;
  font-size: 1.1rem;
  margin: 0;
  line-height: 1.4;
  text-overflow: ellipsis;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-clamp: 2;
  display: block;
}

.title h3 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rating {
  padding: 0 0.8rem 0.5rem;
  text-align: center;
  font-size: 0.9rem;
  color: #666;
}

.stars {
  color: #f5c518;
  letter-spacing: 1px;
}

/* 좋아요 버튼 */
.like-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  transition: transform 0.2s ease;
  padding: 0.5rem;
}

.like-btn:hover {
  transform: scale(1.2);
}

.like-icon {
  display: block;
  line-height: 1;
}

/* 알림 팝업 */
.popup-alert {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #333;
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  z-index: 1000;
  opacity: 0.9;
  animation: fadeIn 0.3s ease-in;
}

/* 영화 없을 때 */
.no-movies, .no-selection {
  text-align: center;
  margin: 3rem 0;
  padding: 2rem;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.no-movies p, .no-selection p {
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 0.5rem;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translate(-50%, 20px); }
  to { opacity: 0.9; transform: translate(-50%, 0); }
}

/* 반응형 스타일 */
@media (max-width: 1200px) {
  .movie-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  }
}

@media (max-width: 768px) {
  .emotion-buttons {
    gap: 0.8rem;
    margin-bottom: 2rem;
    padding: 0.5rem;
  }
  
  .emotion-btn {
    padding: 0.6rem 1.2rem;
    font-size: 0.95rem;
  }
  
  .movie-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1.5rem;
  }
  
  .page-title {
    font-size: 1.5rem;
  }
  
  .subtitle {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .emotion-buttons {
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .emotion-btn {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
  }
  
  .movie-grid {
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 1rem;
  }
  
  .title h3 {
    font-size: 0.9rem;
  }
  
  .rating {
    font-size: 0.8rem;
  }
}
</style>