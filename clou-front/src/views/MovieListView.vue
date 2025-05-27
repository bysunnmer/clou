<template>
  <div class="movie-list-wrapper">
    <div class="movie-list">
      <div class="header-section">
        <h2 class="page-title">👀 지금 이 영화 어때요?</h2>
        
        <!-- 검색 섹션 -->
        <div class="search-container">
          <div class="search-input-wrapper">
            <input 
              type="text" 
              v-model="searchQuery" 
              @input="searchMovies"
              placeholder="영화 제목 검색..." 
              class="search-input"
            />
            <button class="search-btn" @click="searchMovies">
              <span class="search-icon">🔍</span>
            </button>
          </div>
        </div>
        
        <!-- 필터 및 정렬 섹션 -->
        <div class="filter-sort-container">
          <div class="filter-buttons">
            <button 
              v-for="category in categories" 
              :key="category.value" 
              :class="['filter-btn', { active: activeCategory === category.value }]"
              @click="setCategory(category.value)"
            >
              {{ category.label }}
            </button>
          </div>
          
          <div class="sort-dropdown">
            <select v-model="sortOption" @change="sortMovies" class="sort-select">
              <option value="popularity">인기순</option>
              <option value="rating">평점순</option>
              <option value="date">최신순</option>
              <option value="title">제목순</option>
            </select>
          </div>
        </div>
      </div>
      
      <!-- 로딩 표시 -->
      <div v-if="isLoading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>영화 정보를 불러오는 중...</p>
      </div>
      
      <!-- 영화 그리드 -->
      <div v-else-if="filteredMovies.length" class="movie-grid">
        <div 
          v-for="movie in filteredMovies" 
          :key="movie.tmdb_id" 
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
                <span class="score">{{ movie.vote_average.toFixed(1) }}</span>
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
      
      <!-- 검색 결과 없음 -->
      <div v-else class="no-results">
        <div class="no-results-icon">🎬</div>
        <h3>영화를 찾을 수 없습니다</h3>
        <p>다른 카테고리를 선택해보세요</p>
      </div>
      
      <!-- 알림 메시지 -->
      <div v-if="showAlert" class="popup-alert">
        {{ alertMessage }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { fetchMovies } from '@/api/movies'
import { useMovieStore } from '@/stores/movie'

// 상태 관리
const movieStore = useMovieStore()
const movies = ref([])
const filteredMovies = ref([])
const isLoading = ref(true)
const showAlert = ref(false)
const alertMessage = ref('')
const activeCategory = ref('all')
const sortOption = ref('popularity')
const searchQuery = ref('')
const allMovies = ref([]) // 원본 데이터 보관용

// 필터링 카테고리
const categories = [
  { label: '전체', value: 'all' },
  { label: '액션', value: 'action' },
  { label: '로맨스', value: 'romance' },
  { label: '코미디', value: 'comedy' },
  { label: '스릴러', value: 'thriller' },
  { label: 'SF', value: 'sci-fi' },
  { label: '드라마', value: 'drama' }
]

// 초기 데이터 불러오기
onMounted(async () => {
  try {
    isLoading.value = true
    const res = await fetchMovies()
    
    // 응답 데이터 처리
    if (res.data && Array.isArray(res.data)) {
      // 추가 필드 설정
      const processedMovies = res.data.map(movie => ({
        ...movie,
        newlyLiked: false, // 애니메이션을 위한 플래그
        categories: getRandomCategories() // 임시 카테고리 추가 (실제로는 API에서 가져와야 함)
      }))
      
      // 원본 데이터 보관
      allMovies.value = [...processedMovies]
      movies.value = [...processedMovies]
      
      // 초기 필터링 및 정렬 적용
      applyFiltersAndSort()
    }
  } catch (err) {
    console.error('영화 불러오기 실패:', err)
    alertMessage.value = '영화 정보를 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.'
    showAlert.value = true
  } finally {
    isLoading.value = false
  }
})

// 임의의 카테고리 생성 (실제 구현에서는 API 값 사용)
const getRandomCategories = () => {
  const allCategories = ['action', 'romance', 'comedy', 'thriller', 'sci-fi', 'drama']
  const numCategories = Math.floor(Math.random() * 3) + 1 // 1에서 3개 사이
  const shuffled = [...allCategories].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, numCategories)
}

// 카테고리 설정
const setCategory = (category) => {
  activeCategory.value = category
  applyFiltersAndSort()
}

// 영화 검색 함수
const searchMovies = () => {
  // 검색어가 없으면 원본 데이터로 초기화
  if (!searchQuery.value.trim()) {
    movies.value = [...allMovies.value]
  } else {
    const query = searchQuery.value.toLowerCase().trim()
    // 제목에서 검색
    movies.value = allMovies.value.filter(movie => 
      movie.title && movie.title.toLowerCase().includes(query)
    )
  }
  
  // 필터링 및 정렬 다시 적용
  applyFiltersAndSort()
  
  // 검색 결과가 없을 경우 알림 표시
  if (movies.value.length === 0 && searchQuery.value.trim()) {
    alertMessage.value = `'${searchQuery.value}'에 대한 검색 결과가 없습니다`
    showAlert.value = true
    setTimeout(() => (showAlert.value = false), 2000)
  }
}

// 필터링 및 정렬 적용
const applyFiltersAndSort = () => {
  // 필터링
  let result = [...movies.value]
  
  if (activeCategory.value !== 'all') {
    result = result.filter(movie => 
      movie.categories && movie.categories.includes(activeCategory.value)
    )
  }
  
  // 정렬
  switch (sortOption.value) {
    case 'rating':
      result.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0))
      break
    case 'date':
      result.sort((a, b) => new Date(b.release_date || 0) - new Date(a.release_date || 0))
      break
    case 'title':
      result.sort((a, b) => a.title.localeCompare(b.title))
      break
    case 'popularity':
    default:
      // 기본적으로 인기순 (이미 정렬되어 있다고 가정)
      break
  }
  
  filteredMovies.value = result
}

// 정렬 옵션 변경 시
const sortMovies = () => {
  applyFiltersAndSort()
}

// 좋아요 토글
const toggleLike = async (movie) => {
  try {
    // tmdb_id 사용
    const tmdbId = movie.tmdb_id
    
    if (!tmdbId) {
      throw new Error('TMDB ID가 없습니다')
    }
    
    // 스토어를 통해 좋아요 토글 처리
    const result = await movieStore.toggleLike(movie)
    
    if (result.success) {
      // 이전 상태를 기억
      const previousState = movie.is_liked
      
      // 서버 응답에 따라 좋아요 상태 업데이트
      movie.is_liked = !previousState
      
      // 좋아요를 누른 경우에만 애니메이션 표시
      if (!previousState && movie.is_liked) {
        movie.newlyLiked = true
        setTimeout(() => {
          movie.newlyLiked = false
        }, 1000)
      }
      
      // 찜한 영화 목록 다시 불러오기
      movieStore.fetchLikedMovies()
    } else {
      throw new Error(result.error || '오류가 발생했습니다')
    }
  } catch (err) {
    console.error('영화 찜하기 오류:', err)
    alertMessage.value = err.message || '로그인이 필요합니다!'
    showAlert.value = true
    setTimeout(() => (showAlert.value = false), 2000)
  }
}

// 영화 포스터 URL 가져오기
const getImageUrl = (path) =>
  path ? `https://image.tmdb.org/t/p/w342${path}` : 'https://via.placeholder.com/342x513?text=No+Image'

// 영화 설명 줄임
const truncateOverview = (text) => {
  if (!text || typeof text !== 'string') return '설명이 없습니다'
  return text.length > 150 ? text.slice(0, 150) + '...' : text
}

// 평점 별표 렌더링
const renderStars = (rating) => {
  const outOfFive = Math.round((rating / 10) * 5)
  const stars = Math.min(Math.max(outOfFive, 0), 5)
  return '⭐️'.repeat(stars) + '☆'.repeat(5 - stars)
}

// 날짜 포맷팅
const formatDate = (dateString) => {
  if (!dateString) return '기록 없음'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return '기록 없음'
  
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date)
}

// 최근 출시작 확인 (3개월 이내)
const isNewRelease = (dateString) => {
  if (!dateString) return false
  const releaseDate = new Date(dateString)
  if (isNaN(releaseDate.getTime())) return false
  
  const now = new Date()
  const threeMonthsAgo = new Date(now)
  threeMonthsAgo.setMonth(now.getMonth() - 3)
  
  return releaseDate >= threeMonthsAgo
}
</script>

<style scoped>
.movie-list-wrapper {
  min-height: 100vh;
  padding-top: 80px; /* 네비게이션 공간 더 확보 */
  overflow-x: hidden;
  background-color: #f8f9fa;
}

.movie-list {
  max-width: 1300px;
  margin: 0 auto;
  padding: 2rem 1rem;
  box-sizing: border-box;
}

/* 헤더 섹션 스타일 */
.header-section {
  margin-bottom: 2rem;
}

/* 검색 컨테이너 스타일 */
.search-container {
  max-width: 600px;
  margin: 1.5rem auto 2rem;
}

.search-input-wrapper {
  display: flex;
  position: relative;
  height: 50px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-radius: 30px;
  overflow: hidden;
}

.search-input {
  flex: 1;
  border: none;
  padding: 0 1.5rem;
  font-size: 1rem;
  outline: none;
  height: 100%;
  background-color: white;
}

.search-btn {
  width: 50px;
  height: 100%;
  background-color: #00A676;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-btn:hover {
  background-color: #008f66;
}

.search-icon {
  font-size: 1.2rem;
  color: white;
}

.page-title {
  font-size: 1.8rem;
  text-align: center;
  margin-bottom: 1.5rem;
  font-weight: bold;
  color: #222;
  position: relative;
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

/* 필터 및 정렬 컨테이너 */
.filter-sort-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 1.5rem 0;
  flex-wrap: wrap;
  gap: 1rem;
}

.filter-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  border: 1px solid #ddd;
  background-color: white;
  color: #555;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-btn:hover {
  border-color: #00A676;
  color: #00A676;
}

.filter-btn.active {
  background-color: #00A676;
  color: white;
  border-color: #00A676;
}

.sort-dropdown {
  position: relative;
}

.sort-select {
  padding: 0.5rem 2rem 0.5rem 1rem;
  border-radius: 20px;
  border: 1px solid #ddd;
  background-color: white;
  color: #555;
  font-size: 0.9rem;
  appearance: none;
  cursor: pointer;
  outline: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23555' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  background-size: 1rem;
}

.sort-select:focus {
  border-color: #00A676;
}

/* 로딩 스피너 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
  color: #666;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #00A676;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 결과 없음 상태 */
.no-results {
  text-align: center;
  padding: 4rem 0;
  color: #666;
}

.no-results-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #999;
}

/* 영화 그리드 */
.movie-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 2rem;
  margin-top: 1rem;
}

/* 영화 카드 스타일 */
.movie-card {
  background-color: white;
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.movie-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
}

/* 펄스 애니메이션 (좋아요 시) */
.pulse-animation {
  animation: pulse 1s cubic-bezier(0.4, 0, 0.6, 1);
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

/* 포스터 래퍼 */
.poster-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 2/3;
  overflow: hidden;
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
  line-clamp: 5; /* 표준 속성 추가 */
  -webkit-box-orient: vertical;
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

/* 카드 콘텐츠 */
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

.rating {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #555;
}

.stars {
  line-height: 1;
  letter-spacing: -2px;
}

.score {
  font-weight: 500;
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
  background-color: rgba(51, 51, 51, 0.9);
  color: white;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  z-index: 1000;
  font-size: 0.9rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: fadeIn 0.3s, fadeOut 0.3s 1.7s;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translate(-50%, 20px); }
  to { opacity: 1; transform: translate(-50%, 0); }
}

@keyframes fadeOut {
  from { opacity: 1; transform: translate(-50%, 0); }
  to { opacity: 0; transform: translate(-50%, 20px); }
}

/* 반응형 스타일 */
@media (max-width: 992px) {
  .movie-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1.5rem;
  }
}

@media (max-width: 768px) {
  .filter-sort-container {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-buttons {
    justify-content: center;
  }
  
  .sort-dropdown {
    align-self: center;
    margin-top: 0.5rem;
  }
  
  .movie-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1.2rem;
  }
  
  .page-title {
    font-size: 1.5rem;
  }
  
  .title h3 {
    font-size: 0.9rem;
  }
}
</style>
