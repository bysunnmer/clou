<template>
 <div class="mypage-container">
  <h2>
   마이페이지 👤
  </h2>
  <div v-if="loading">
   <p>
    로딩 중...
   </p>
  </div>
  <div v-else-if="error">
   <p class="error-message">
    {{ error }}
   </p>
  </div>
  <div class="profile-container" v-else="">
   <!-- 프로필 정보 섹션 -->
   <div class="profile-section">
    <div class="profile-image-container">
     <img :src="user.profile_image || '/default-profile.jpg'" alt="프로필 이미지" class="profile-image"/>
    </div>
    <div class="profile-info">
     <h3>
      {{ user.nickname || user.username }}
     </h3>
     <p class="bio">
      {{ user.bio || '소개가 없습니다.' }}
     </p>
    </div>
   </div>
   <!-- 나의 다이어리 섹션 -->
   <div class="section diary-section">
    <h3>
     나의 다이어리 📝
    </h3>
    <button @click="showDiaryModal = true" class="diary-button">
     <span class="icon">
      📅
     </span>
     다이어리 열기
    </button>
   </div>
   <!-- 인생 영화 섹션 -->
   <div class="section">
    <h3>
     인생 영화
    </h3>
    <div class="favorite-movie" v-if="user.favorite_movie">
     <img :src="getMoviePosterUrl(user.favorite_movie.poster_path)" alt="영화 포스터" class="movie-poster"/>
     <div class="movie-info">
      <h4>
       {{ user.favorite_movie.title }}
      </h4>
     </div>
    </div>
    <p v-else="">
     아직 인생 영화를 선택하지 않았습니다.
    </p>
   </div>
   <!-- 활동 목록 섹션 -->
   <div class="tabs">
    <button :class="{ active: activeTab === 'reviews' }" @click="activeTab = 'reviews'">
     내 리뷰
    </button>
    <button :class="{ active: activeTab === 'liked' }" @click="activeTab = 'liked'">
     찜한 영화
    </button>
   </div>
   <!-- 리뷰 목록 -->
   <div class="section" v-if="activeTab === 'reviews'">
    <h3>
     내 리뷰 목록
    </h3>
    <div class="empty-message" v-if="reviews.length === 0">
     <p>
      작성한 리뷰가 없습니다.
     </p>
    </div>
    <div class="reviews-list" v-else="">
     <div 
      :key="review.id" 
      class="review-item" 
      v-for="review in reviews"
      @click="goToMovieDetail(review.movie.tmdb_id)"
     >
      <div class="review-header">
       <div class="review-movie-info">
        <img :src="getMoviePosterUrl(review.movie.poster_path)" alt="영화 포스터" class="review-movie-poster" />
        <div>
         <h4>
          {{ review.movie.title }}
         </h4>
         <span class="date">
          {{ formatDate(review.created_at) }}
         </span>
        </div>
       </div>
       <div class="review-like-info">
        <span class="review-likes">❤️ {{ review.like_count || 0 }}</span>
       </div>
      </div>
      <p class="review-content">
       {{ review.content }}
      </p>
     </div>
    </div>
   </div>
   <!-- 찜한 영화 목록 -->
   <div class="section" v-if="activeTab === 'liked'">
    <h3>
     찜한 영화 목록
    </h3>
    <div class="empty-message" v-if="movieStore.getLikedMovies.length === 0">
     <p>
      찜한 영화가 없습니다.
     </p>
    </div>
    <div class="movie-grid" v-else>
     <div :key="movie.tmdb_id" class="movie-card" v-for="movie in movieStore.getLikedMovies">
      <RouterLink :to="`/movies/${movie.tmdb_id}`">
       <img :src="getMoviePosterUrl(movie.poster_path)" alt="영화 포스터" class="movie-poster"/>
       <h4>
        {{ movie.title }}
       </h4>
      </RouterLink>
     </div>
    </div>
   </div>
  </div>
 </div>
 <!-- 다이어리 모달 -->
 <diarymodal @close="showDiaryModal = false" v-if="showDiaryModal">
 </diarymodal>
</template>
<script setup="">
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
    const response = await fetchUserReviews()
    
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
<style scoped="">
 .mypage-container {
  max-width: 900px;
  margin: 2rem auto;
  padding: 1rem;
}

.error-message {
  color: #e74c3c;
  text-align: center;
  padding: 1rem;
  background-color: #fdecea;
  border-radius: 4px;
}

.profile-section {
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.profile-image-container {
  margin-right: 2rem;
}

.profile-image {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.profile-info h3 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  font-size: 1.5rem;
}

.bio {
  color: #666;
  font-style: italic;
  max-width: 500px;
}

.section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.section h3 {
  margin-top: 0;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
}

.favorite-movie {
  display: flex;
  align-items: center;
}

.movie-poster {
  width: 100px;
  height: 150px;
  object-fit: cover;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  margin-right: 1rem;
}

.tabs {
  display: flex;
  margin-bottom: 1rem;
}

.tabs button {
  padding: 0.75rem 1.5rem;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  font-size: 1rem;
  font-weight: bold;
  color: #555;
  cursor: pointer;
  margin-right: 1rem;
  transition: all 0.3s;
}

.tabs button.active {
  color: #1a73e8;
  border-bottom-color: #1a73e8;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.review-item {
  padding: 1.2rem;
  border-radius: 8px;
  background-color: #f9f9f9;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  cursor: pointer;
  border-left: 3px solid transparent;
}

.review-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  background-color: #f0f5ff;
  border-left: 3px solid #1a73e8;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.review-movie-info {
  display: flex;
  align-items: flex-start;
}

.review-movie-poster {
  width: 60px;
  height: 90px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.review-header h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
}

.review-header h4 a {
  color: #1a73e8;
  text-decoration: none;
}

.review-header h4 a:hover {
  text-decoration: underline;
}

.date {
  font-size: 0.8rem;
  color: #777;
  display: block;
}

.review-like-info {
  display: flex;
  align-items: center;
}

.review-likes {
  font-size: 0.9rem;
  color: #e74c3c;
  display: flex;
  align-items: center;
}

.review-content {
  margin-top: 0.5rem;
  line-height: 1.5;
  color: #333;
}

.movie-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1.5rem;
}

.movie-card {
  text-align: center;
}

.movie-card h4 {
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: #333;
}

.empty-message {
  text-align: center;
  padding: 2rem;
  color: #777;
  background-color: #f9f9f9;
  border-radius: 4px;
}

/* 다이어리 섹션 스타일 */
.diary-section {
  background-color: #f3f8ff;
  border-left: 4px solid #4c84ff;
}

.diary-button {
  display: flex;
  align-items: center;
  padding: 0.8rem 1.5rem;
  background-color: #4c84ff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.diary-button:hover {
  background-color: #3a70e3;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.diary-button .icon {
  margin-right: 8px;
  font-size: 1.2rem;
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
</style>
