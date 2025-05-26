<template>
  <div class="mypage-container">
    <h2>마이페이지 👤</h2>
    <div v-if="loading">
      <p>로딩 중...</p>
    </div>
    <div v-else-if="error">
      <p class="error-message">{{ error }}</p>
    </div>
    <div v-else class="profile-container">
      <!-- 프로필 정보 섹션 -->
      <div class="profile-section">
        <div class="profile-image-container">
          <img
            :src="user.profile_image || '/default-profile.jpg'"
            alt="프로필 이미지"
            class="profile-image"
          />
        </div>
        <div class="profile-info">
          <h3>{{ user.nickname || user.username }}</h3>
          <p class="bio">{{ user.bio || '소개가 없습니다.' }}</p>
        </div>
      </div>

      <!-- 인생 영화 섹션 -->
      <div class="section">
        <h3>인생 영화</h3>
        <div v-if="user.favorite_movie" class="favorite-movie">
          <img
            :src="getMoviePosterUrl(user.favorite_movie.poster_path)"
            alt="영화 포스터"
            class="movie-poster"
          />
          <div class="movie-info">
            <h4>{{ user.favorite_movie.title }}</h4>
          </div>
        </div>
        <p v-else>아직 인생 영화를 선택하지 않았습니다.</p>
      </div>

      <!-- 활동 목록 섹션 -->
      <div class="tabs">
        <button
          :class="{ active: activeTab === 'reviews' }"
          @click="activeTab = 'reviews'"
        >
          내 리뷰
        </button>
        <button
          :class="{ active: activeTab === 'liked' }"
          @click="activeTab = 'liked'"
        >
          찜한 영화
        </button>
      </div>

      <!-- 리뷰 목록 -->
      <div v-if="activeTab === 'reviews'" class="section">
        <h3>내 리뷰 목록</h3>
        <div v-if="reviews.length === 0" class="empty-message">
          <p>작성한 리뷰가 없습니다.</p>
        </div>
        <div v-else class="reviews-list">
          <div v-for="review in reviews" :key="review.id" class="review-item">
            <div class="review-header">
              <h4>{{ review.movie.title }}</h4>
              <span class="date">{{ formatDate(review.created_at) }}</span>
            </div>
            <p class="review-content">{{ review.content }}</p>
          </div>
        </div>
      </div>

      <!-- 찜한 영화 목록 -->
      <div v-if="activeTab === 'liked'" class="section">
        <h3>찜한 영화 목록</h3>
        <div v-if="likedMovies.length === 0" class="empty-message">
          <p>찜한 영화가 없습니다.</p>
        </div>
        <div v-else class="movie-grid">
          <div v-for="movie in likedMovies" :key="movie.id" class="movie-card">
            <RouterLink :to="`/movies/${movie.tmdb_id}`">
              <img
                :src="getMoviePosterUrl(movie.poster_path)"
                alt="영화 포스터"
                class="movie-poster"
              />
              <h4>{{ movie.title }}</h4>
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import axios from 'axios'

const router = useRouter()
const authStore = useAuthStore()

const user = ref({})
const reviews = ref([])
const likedMovies = ref([])
const loading = ref(true)
const error = ref(null)
const activeTab = ref('reviews')

onMounted(async () => {
  // 인증 확인
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }

  try {
    loading.value = true
    error.value = null

    // 사용자 정보 불러오기
    await fetchUserProfile()
    
    // 리뷰 및 찜한 영화 목록 불러오기
    await Promise.all([
      fetchUserReviews(),
      fetchLikedMovies()
    ])
  } catch (err) {
    console.error('마이페이지 데이터 로딩 오류:', err)
    error.value = '데이터를 불러오는 중 오류가 발생했습니다.'
  } finally {
    loading.value = false
  }
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
async function fetchUserReviews() {
  try {
    // 실제 구현 시에는 사용자 ID 기반 리뷰 API 호출 필요
    const response = await axios.get(`http://localhost:8000/api/v1/users/reviews/`, {
      headers: { Authorization: `Token ${authStore.getToken}` }
    })
    reviews.value = response.data
  } catch (err) {
    console.error('리뷰 로딩 오류:', err)
    reviews.value = [] // 에러 시 빈 배열로 설정
  }
}

// 찜한 영화 목록 가져오기
async function fetchLikedMovies() {
  try {
    // 실제 구현 시에는 사용자 ID 기반 찜한 영화 API 호출 필요
    const response = await axios.get(`http://localhost:8000/api/v1/users/liked-movies/`, {
      headers: { Authorization: `Token ${authStore.getToken}` }
    })
    likedMovies.value = response.data
  } catch (err) {
    console.error('찜한 영화 로딩 오류:', err)
    likedMovies.value = [] // 에러 시 빈 배열로 설정
  }
}

// 포스터 URL 생성 함수
function getMoviePosterUrl(posterPath) {
  return posterPath
    ? `https://image.tmdb.org/t/p/w300${posterPath}`
    : '/no-poster.jpg'
}

// 날짜 포맷 함수
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<style scoped>
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
  padding: 1rem;
  border-radius: 4px;
  background-color: #f9f9f9;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.review-header h4 {
  margin: 0;
}

.date {
  font-size: 0.8rem;
  color: #777;
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
</style>
