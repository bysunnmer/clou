<template>
 <div class="mypage-wrapper">
  <div class="mypage-container">
   <div class="header-section">
    <h2 class="page-title">👤 마이페이지</h2>
    <p class="page-description">나의 영화 활동과 프로필을 관리하세요</p>
   </div>
   
   <!-- 로딩 표시 -->
   <div v-if="loading" class="loading-container">
    <div class="loading-spinner"></div>
    <p>프로필 정보를 불러오는 중...</p>
   </div>
   <!-- 에러 메시지 -->
   <div v-else-if="error" class="error-container">
    <p class="error-message">{{ error }}</p>
   </div>
   
   <!-- 프로필 컨텐츠 -->
   <div class="profile-content" v-else>
     <!-- 프로필 정보 섹션 -->
     <div class="profile-section">
      <div class="profile-image-container">
       <!-- 사용자 프로필 이미지가 있는 경우 -->
       <img 
        v-if="user.profile_image" 
        :src="user.profile_image" 
        alt="프로필 이미지" 
        class="profile-image"
       />
       <!-- 프로필 이미지가 없는 경우 리뷰 섹션과 동일한 표시 -->
       <div v-else class="profile-avatar user-avatar">
        {{ (user.nickname || user.username).charAt(0) }}
       </div>
      </div>
      <div class="profile-info">
       <h3 class="username">{{ user.nickname || user.username }}</h3>
       <p class="bio">{{ user.bio || '소개가 없습니다.' }}</p>
      
      <!-- 다이어리 버튼 -->
      <button @click="openDiaryModal" class="diary-button">
       <span class="icon">📝</span>
       <span>다이어리 열기</span>
      </button>
     </div>
    </div>
    <!-- 인생 영화 섹션 -->
    <div class="section favorite-movie-section">
     <h3 class="section-title">✨ 인생 영화</h3>
     <div class="favorite-movie" v-if="user.favorite_movie">
      <div class="poster-wrapper">
       <img 
        :src="getMoviePosterUrl(user.favorite_movie.poster_path)" 
        alt="영화 포스터" 
        class="movie-poster"
       />
       <div class="overlay">
        <div class="overlay-content">
         <div class="view-detail">상세 보기</div>
        </div>
       </div>
      </div>
      <div class="movie-info">
       <h4>{{ user.favorite_movie.title }}</h4>
      </div>
     </div>
     <div class="empty-favorite" v-else>
      <p>아직 인생 영화를 선택하지 않았습니다.</p>
      <p class="small-text">영화 상세 페이지에서 설정할 수 있어요!</p>
     </div>
    </div>
    <!-- 활동 탭 -->
    <div class="activity-tabs">
     <button 
       :class="['tab-btn', { active: activeTab === 'reviews' }]" 
       @click="activeTab = 'reviews'"
     >
       <span class="tab-icon">✍️</span>
       <span>내 리뷰</span>
     </button>
     <button 
       :class="['tab-btn', { active: activeTab === 'liked' }]" 
       @click="activeTab = 'liked'"
     >
       <span class="tab-icon">❤️</span>
       <span>찜한 영화</span>
     </button>
    </div>

    <!-- 리뷰 목록 -->
    <div class="section" v-if="activeTab === 'reviews'">
     <h3 class="section-title">✍️ 내 리뷰 목록</h3>
     
     <div class="empty-message" v-if="reviews.length === 0">
      <div class="empty-icon">📝</div>
      <p>작성한 리뷰가 없습니다.</p>
      <p class="small-text">영화 상세 페이지에서 리뷰를 작성해보세요!</p>
     </div>
     
     <div class="reviews-list" v-else>
      <div 
       v-for="review in reviews" 
       :key="review.id" 
       class="review-card"
      >
        <!-- 새로운 레이아웃: 포스터 왼쪽, 내용 오른쪽 -->
        <div class="review-card-content">
         <!-- 영화 포스터 (왼쪽) -->
         <div class="poster-container" @click="goToMovieDetail(review.movie.tmdb_id)">
          <img 
           :src="getMoviePosterUrl(review.movie.poster_path)" 
           alt="영화 포스터" 
           class="review-movie-poster" 
          />
          <div class="poster-overlay">
           <span>영화 보기</span>
          </div>
         </div>
         
         <!-- 리뷰 내용 (오른쪽) -->
         <div class="review-details">
          <div class="review-header">
           <h4 class="movie-title" @click="goToMovieDetail(review.movie.tmdb_id)">{{ review.movie.title }}</h4>
           <div class="review-metadata">
            <span class="date">{{ formatDate(review.created_at) }}</span>
            <span class="review-likes">❤️ {{ review.like_count || 0 }}</span>
           </div>
          </div>
          <p class="review-content">{{ review.content }}</p>
         </div>
        </div>
       </div>
      </div>
    </div>
    <!-- 찜한 영화 목록 -->
    <div class="section" v-if="activeTab === 'liked'">
     <h3 class="section-title">❤️ 찜한 영화 목록</h3>
     
     <div class="empty-message" v-if="movieStore.getLikedMovies.length === 0">
      <div class="empty-icon">🍿</div>
      <p>찜한 영화가 없습니다.</p>
      <p class="small-text">마음에 드는 영화를 찜해보세요!</p>
     </div>
     
     <div class="movie-grid" v-else>
      <div 
       v-for="movie in movieStore.getLikedMovies" 
       :key="movie.tmdb_id" 
       class="movie-card"
      >
       <div class="poster-wrapper">
        <RouterLink :to="`/movies/${movie.tmdb_id}`">
         <img 
          class="poster" 
          :src="getMoviePosterUrl(movie.poster_path)" 
          :alt="movie.title" 
          loading="lazy"
         />
         <div class="overlay">
          <div class="overlay-content">
           <div class="view-detail">상세 보기</div>
          </div>
         </div>
        </RouterLink>
       </div>
       <div class="card-content">
        <RouterLink :to="`/movies/${movie.tmdb_id}`" class="title">
         <h4>{{ movie.title }}</h4>
        </RouterLink>
        <div class="movie-meta">
         <div class="rating" v-if="movie.vote_average !== null && movie.vote_average !== undefined">
          <span class="stars">{{ renderStars(movie.vote_average) }}</span>
          <span class="score">{{ Number(movie.vote_average).toFixed(1) }}</span>
         </div>
        </div>
       </div>
      </div>
     </div>
    </div>
   </div>
  </div>
 </div>
  <!-- 다이어리 모달 -->
  <DiaryModal 
    v-if="showDiaryModal" 
    @close="closeDiaryModal" 
    :user-id="authStore.getUser?.id"
    :username="user.username"
  />
  
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { fetchUserReviews } from '@/api/movies';
import { useMovieStore } from '@/stores/movie';
import axios from 'axios'
// 다이어리 모달 컴포넌트 추가
import DiaryModal from '@/components/diary/DiaryModal.vue'

const router = useRouter()
const authStore = useAuthStore()

const user = ref({})
const reviews = ref([]);
const movieStore = useMovieStore();
// likedMovies will now be a computed property or directly accessed from movieStore.state
const loading = ref(true)
const error = ref(null)
const activeTab = ref('reviews')
const showDiaryModal = ref(false)

// 다이어리 모달 관리 함수
const openDiaryModal = () => {
  // 로그인 상태 확인
  if (!authStore.isAuthenticated) {
    alert('다이어리를 사용하려면 로그인이 필요합니다.')
    router.push('/login')
    return
  }
  
  console.log('다이어리 모달 열기')
  showDiaryModal.value = true
  document.body.style.overflow = 'hidden' // 모달 열린 동안 스크롤 방지
}

const closeDiaryModal = () => {
  console.log('다이어리 모달 닫기')
  showDiaryModal.value = false
  document.body.style.overflow = '' // 스크롤 다시 활성화
}

// 평점 별표 렌더링
const renderStars = (rating) => {
  const outOfFive = Math.round((rating / 10) * 5)
  const stars = Math.min(Math.max(outOfFive, 0), 5)
  return '⭐️'.repeat(stars) + '☆'.repeat(5 - stars)
}

onMounted(async () => {
  // 인증 확인
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }

  console.log('[MyPageView] 마운트됨 - 데이터 로딩 시작')

  try {
    loading.value = true
    error.value = null

    // 사용자 정보 불러오기
    await fetchUserProfile();
    
    console.log('[MyPageView] 찜한 영화 및 리뷰 로딩 시작')
    
    // 병렬로 데이터 로딩 (liked movies는 movieStore에서 관리)
    await Promise.all([
      getUserReviews(),
      movieStore.fetchLikedMovies() // Fetch liked movies via store
    ]);
    
    console.log('[MyPageView] 찜한 영화 개수:', movieStore.getLikedMovies.length)
  } catch (err) {
    console.error('[MyPageView] 마이페이지 데이터 로딩 오류:', err)
    error.value = '데이터를 불러오는 중 오류가 발생했습니다.'
  } finally {
    loading.value = false
  }
  
  // 기본 탭은 '내 리뷰'로 설정
  activeTab.value = 'reviews'
})

// 사용자 프로필 정보 가져오기
async function fetchUserProfile() {
  try {
    const { success, data } = await authStore.fetchUserProfile()
    if (success) {
      user.value = data
    } else {
      throw new Error('사용자 정보를 불러올 수 없습니다.')
    }
  } catch (err) {
    console.error('프로필 로딩 오류:', err)
    throw err
  }
}

// 사용자 리뷰 목록 가져오기
async function getUserReviews() {
  try {
    console.log('[MyPageView] 사용자 리뷰 목록 가져오기 시작')
    
    // 인증 스토어에서 사용자 정보 가져오기
    const currentUser = authStore.getUser
    
    if (!currentUser || !currentUser.username) {
      console.warn('[MyPageView] 로그인 정보가 없습니다.')
      reviews.value = []
      return
    }
    
    console.log(`[MyPageView] ${currentUser.username} 사용자의 리뷰 조회 시작`)
    
    // username 파라미터 전달하여 API 호출
    const response = await fetchUserReviews(currentUser.username)
    
    if (response.success) {
      console.log('[MyPageView] 사용자 리뷰 목록 가져오기 성공:', response.data)
      reviews.value = response.data
    } else {
      throw new Error(response.message || '리뷰를 불러오는데 실패했습니다.')
    }
  } catch (err) {
    console.error('[MyPageView] 리뷰 목록 조회 실패:', err)
    reviews.value = [] // 에러 시 빈 배열로 설정
  }
}

// 찜한 영화 목록 가져오기
async function refreshLikedMovies() {
  console.log('[MyPageView] 찜한 영화 새로고침 요청')
  try {
    await movieStore.fetchLikedMovies()
    console.log('[MyPageView] 찜한 영화 새로고침 완료:', movieStore.getLikedMovies.length)
  } catch (err) {
    console.error('[MyPageView] 찜한 영화 새로고침 오류:', err)
  }
}

// 포스터 URL 생성 함수
function getMoviePosterUrl(posterPath) {
  return posterPath
    ? `https://image.tmdb.org/t/p/w300${posterPath}`
    : '/no-poster.jpg'
}

// 날짜 포맷 함수
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 영화 상세 페이지로 이동하는 함수
const goToMovieDetail = (tmdb_id) => {
  if (tmdb_id) {
    router.push(`/movies/${tmdb_id}`)
  }
}
</script>
<style scoped>
.mypage-wrapper {
  min-height: 100vh;
  padding-top: 80px;
  overflow-x: hidden;
  background-color: #f8f9fa;
}

.mypage-container {
  max-width: 1300px;
  margin: 0 auto;
  padding: 2rem 1rem;
  box-sizing: border-box;
}

/* 헤더 섹션 */
.header-section {
  margin-bottom: 2rem;
  text-align: center;
}

.page-title {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: #333;
}

.page-description {
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 2rem;
}

/* 로딩 애니메이션 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 166, 118, 0.2);
  border-top-color: #00A676;
  border-radius: 50%;
  animation: spin 1s infinite linear;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 에러 메시지 */
.error-container {
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.error-message {
  background-color: #fdecea;
  color: #e74c3c;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 6px rgba(231, 76, 60, 0.2);
}

/* 프로필 섹션 */
.profile-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 2rem;
  text-align: center;
}

@media (min-width: 768px) {
  .profile-section {
    flex-direction: row;
    text-align: left;
  }
}

.profile-image-container {
  margin-bottom: 1.5rem;
}

@media (min-width: 768px) {
  .profile-image-container {
    margin-right: 2rem;
    margin-bottom: 0;
  }
}

.profile-image-container {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 리뷰 섹션과 동일한 아바타 스타일 */
.profile-avatar.user-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, #00A676 0%, #4ecdc4 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 3rem;
  box-shadow: 0 4px 10px rgba(0, 166, 118, 0.25);
  position: relative;
  overflow: hidden;
  transform: rotate(-5deg);
  transition: all 0.3s ease;
}

.profile-avatar.user-avatar::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 70% 30%, rgba(255, 255, 255, 0.2) 0%, transparent 70%);
  top: 0;
  left: 0;
}

.profile-image-container:hover .profile-avatar.user-avatar {
  transform: rotate(0deg) scale(1.05);
}

.profile-info {
  flex: 1;
}

.profile-info h3 {
  font-size: 1.8rem;
  margin-top: 0;
  margin-bottom: 0.75rem;
  color: #333;
}

.bio {
  color: #666;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  max-width: 500px;
}

/* 다이어리 버튼 */
.diary-button {
  background-color: #00A676;
  color: white;
  border: none;
  border-radius: 30px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 166, 118, 0.3);
}

.diary-button:hover {
  background-color: #008f66;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 166, 118, 0.4);
}

.diary-button .icon {
  margin-right: 0.5rem;
  font-size: 1.2rem;
}

/* 섹션 스타일 */
.section {
  background-color: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.section-title {
  font-size: 1.5rem;
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #333;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.75rem;
}

/* 인생 영화 섹션 */
.favorite-movie {
  display: flex;
  align-items: center;
}

.poster-wrapper {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.3s;
  width: 100%;
}

.movie-poster, .poster {
  width: 100%;
  aspect-ratio: 2/3; /* 영화 포스터 표준 비율 */
  object-fit: cover;
  display: block;
  border-radius: 8px;
}

.poster-wrapper:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
}

.poster-wrapper:hover .overlay {
  opacity: 1;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.overlay-content {
  color: white;
  text-align: center;
  padding: 1rem;
}

.view-detail {
  display: inline-block;
  background: #00A676;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  margin-top: 0.5rem;
}

.movie-info {
  margin-left: 1.5rem;
}

.movie-info h4 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  font-size: 1.2rem;
}

.empty-favorite {
  text-align: center;
  padding: 2rem 0;
  color: #666;
}

.small-text {
  font-size: 0.9rem;
  color: #888;
  margin-top: 0.5rem;
}

/* 탭 버튼 */
.activity-tabs {
  display: flex;
  margin-bottom: 1.5rem;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.tab-btn {
  flex: 1;
  background: white;
  border: none;
  padding: 1rem;
  font-size: 1rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 3px solid transparent;
}

.tab-btn.active {
  color: #00A676;
  border-bottom-color: #00A676;
  background-color: #f0fffa;
}

.tab-btn:hover {
  background-color: #f5f5f5;
}

.tab-btn.active:hover {
  background-color: #f0fffa;
}

.tab-icon {
  margin-right: 0.5rem;
  font-size: 1.2rem;
}

/* 리뷰 목록 */
.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.review-card {
  border-radius: 12px;
  background-color: #f8f9fa;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
  overflow: hidden;
  border-left: 3px solid transparent;
}

.review-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
  border-left: 3px solid #00A676;
}

/* 새로운 레이아웃 스타일 */
.review-card-content {
  display: flex;
  min-height: 160px;
}

/* 포스터 컨테이너 (왼쪽) */
.poster-container {
  position: relative;
  flex: 0 0 auto;
  width: 120px;
  cursor: pointer;
  overflow: hidden;
}

.review-movie-poster {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.poster-container:hover .review-movie-poster {
  transform: scale(1.05);
}

.poster-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.poster-overlay span {
  color: white;
  font-size: 0.9rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  background: rgba(0, 166, 118, 0.8);
}

.poster-container:hover .poster-overlay {
  opacity: 1;
}

/* 리뷰 내용 (오른쪽) */
.review-details {
  flex: 1;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
}

.review-header {
  margin-bottom: 1rem;
}

.movie-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
  cursor: pointer;
  color: #333;
}

.movie-title:hover {
  color: #00A676;
  text-decoration: underline;
}

.review-metadata {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.date {
  font-size: 0.85rem;
  color: #777;
}

.review-likes {
  font-size: 0.9rem;
  background: #fff;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.review-content {
  line-height: 1.6;
  color: #333;
  margin: 0;
  flex: 1;
}

/* 영화 그리드 */
.movie-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.movie-card {
  transition: transform 0.3s;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 8px;
  background-color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.movie-card:hover {
  transform: translateY(-5px);
}

.card-content {
  padding: 0.75rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-content h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.title {
  text-decoration: none;
  color: inherit;
}

.movie-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.rating {
  display: flex;
  flex-direction: column;
  font-size: 0.85rem;
}

.stars {
  margin-bottom: 0.2rem;
}

.score {
  color: #777;
}

/* 빈 메시지 스타일 */
.empty-message {
  text-align: center;
  padding: 3rem 0;
  color: #666;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

/* 애니메이션 */
.pulse-animation {
  animation: pulse 1s;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.refresh-btn {
  margin-left: 10px;
  background-color: #f0f0f0;
  border: none;
  border-radius: 4px;
  padding: 5px 10px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
}

.refresh-btn:hover {
  background-color: #e0e0e0;
}

.diary-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #00A676 0%, #4ecdc4 100%);
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 1rem;
  box-shadow: 0 4px 10px rgba(0, 166, 118, 0.25);
  position: relative;
  overflow: hidden;
}

.diary-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: 0.5s;
}

.diary-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(0, 166, 118, 0.3);
}

.diary-button:hover::before {
  left: 100%;
}

.diary-button .icon {
  font-size: 1.2rem;
}
</style>
