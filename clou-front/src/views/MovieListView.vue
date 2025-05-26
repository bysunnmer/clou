<template>
  <div class="movie-list-wrapper">
    <div class="movie-list" v-if="movies && movies.length">
      <h2 class="page-title">👀 지금 이 영화 어때요?</h2>
      <div class="movie-grid">
        <div v-for="movie in movies" :key="movie.tmdb_id" class="movie-card">
          <div class="poster-wrapper">
            <RouterLink :to="`/movies/${movie.tmdb_id}`">
              <img class="poster" :src="getImageUrl(movie.poster_path)" :alt="movie.title" />
              <div class="overlay"> <!-- 🎯 수정: 마우스 오버 시 overview 표시 -->
                <p class="overview">{{ truncateOverview(movie.overview) }}</p>
                <!-- <p class="overview">여기 설명이 나와야 합니다</p> -->
              </div>
            </RouterLink>
          </div>
          <RouterLink :to="`/movies/${movie.tmdb_id}`" class="title">
            <h3>{{ movie.title }}</h3>
          </RouterLink>
          <div class="rating" v-if="movie.vote_average !== null && movie.vote_average !== undefined">
            <span class="stars">{{ renderStars(movie.vote_average) }}</span>
            <span class="score">({{ movie.vote_average.toFixed(1) }})</span>
          </div>
          <div class="rating" v-else>
            <span class="score">평점 없음</span>
          </div>
          <button class="like-btn" @click="toggleLike(movie)">
            {{ movie.is_liked ? '❤️' : '🤍' }}
          </button>
        </div>
      </div>
      <div v-if="showAlert" class="popup-alert">
        {{ alertMessage }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { fetchMovies, likeMovie, unlikeMovie } from '@/api/movies'

const movies = ref([])
const showAlert = ref(false)
const alertMessage = ref('')

onMounted(async () => {
  try {
    const res = await fetchMovies()
    movies.value = res.data
    // 👇 overview 값이 실제로 있는지 확인
    console.log(
      movies.value.map(m => ({
        title: m.title,
        overview: m.overview
      }))
    )
  } catch (err) {
    console.error('영화 불러오기 실패:', err)
  }
})

const toggleLike = async (movie) => {
  try {
    if (movie.is_liked) {
      await unlikeMovie(movie.id)
    } else {
      await likeMovie(movie.id)
    }
    movie.is_liked = !movie.is_liked
  } catch (err) {
    alertMessage.value = '로그인이 필요합니다!'
    showAlert.value = true
    setTimeout(() => (showAlert.value = false), 2000)
  }
}

const getImageUrl = (path) =>
  path ? `https://image.tmdb.org/t/p/w300${path}` : 'https://via.placeholder.com/300x450?text=No+Image'

const truncateOverview = (text) => {
  if (!text || typeof text !== 'string') return ''
  return text.length > 300 ? text.slice(0, 300) + '...' : text
}

const renderStars = (rating) => {
  const outOfFive = Math.round((rating / 10) * 5)
  const stars = Math.min(Math.max(outOfFive, 0), 5)
  return '⭐️'.repeat(stars) + '☆'.repeat(5 - stars)
}


</script>

<style scoped>
.movie-list-wrapper {
  width: 100vw;
  overflow-x: hidden;
  background-color: #f8f9fa;
}

.movie-list {
  max-width: 1300px;
  margin: 0 auto;
  padding-top: 6.5rem;
  padding-bottom: 3rem;
  padding-left: 1rem;
  padding-right: 1rem;
  box-sizing: border-box;
}

.page-title {
  font-size: 1.5rem;
  text-align: center;
  margin-bottom: 2rem;
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

.movie-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 2rem;
}

.movie-card {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  transition: transform 0.3s ease;
}
.movie-card:hover {
  transform: translateY(-5px);
}

.poster-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 2/3;
  border-radius: 10px;
  overflow: hidden;
}
.poster {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}
.poster-wrapper:hover .poster {
  transform: scale(1.05);
}

/* 🎯 수정: 마우스 오버 시 overview 아래서 나타나게 */
.overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0) 0%,
    rgba(0, 0, 0, 0.7) 70%,
    rgba(0, 0, 0, 0.9) 100%
  ); /* 그라데이션 추가 */
  color: white;
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); /* 부드러운 이징 */
  padding: 1.5rem;
  display: flex;
  justify-content: flex-end; /* 텍스트 하단 정렬 */
  align-items: flex-end;
  transform: translateY(10px); /* 초기 위치 조정 */
}
.poster-wrapper:hover .overlay {
  opacity: 1;
  transform: translateY(0); /* 호버 시 원위치 */
}

/* 🎯 수정: 설명 텍스트 스타일 개선 */
.overview {
  font-size: 0.95rem;
  line-height: 1.6;
  max-height: 150px; /* 최대 높이 제한 */
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 5; /* 최대 5줄 표시 */
  -webkit-box-orient: vertical;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5); /* 텍스트 쉐도우 */
  margin-bottom: 0.5rem;
  transition: transform 0.3s ease;
}

.title {
  font-size: 1rem;
  font-weight: bold;
  color: #333;
  text-align: center;
  text-decoration: none;
}

.rating {
  font-size: 0.85rem;
  text-align: center;
  color: #666;
}

.like-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  margin-top: 0.3rem;
  text-align: center;
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

@media (max-width: 768px) {
  .movie-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 1.5rem;
  }
  .page-title {
    font-size: 1.3rem;
  }
  .movie-list {
    padding-top: 2.5rem;
  }
}

@media (max-width: 1024px) {
  .movie-list {
    padding-top: 6rem;
  }
  .page-title {
    font-size: 1.3rem;
  }
}
</style>
