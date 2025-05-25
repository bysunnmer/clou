<template>
    <div>
        <h2>🎭 감정 기반 영화 탐색</h2>
        <p>감정을 선택하면 해당 분위기의 영화를 추천해드릴게요!</p>
        <div class="emotion-list">
            <button
              v-for="emotion in emotions"
              :key="emotion.id"
              class="emotion-btn"
              @click="loadEmotionMovies(emotion.name)"
            >
              {{ emotion.name }}
            </button>
        </div>
        <!-- 감정 제목 출력 -->
        <div v-if="selectedEmotion" class="selected-title">
            <h3>🎬 감정: {{ selectedEmotion }}</h3>
        </div>
  
        <!-- 영화 리스트 -->
        <div v-if="movies.length" class="movie-list">
            <div v-for="movie in movies" :key="movie.id" class="movie-card">
            <RouterLink :to="`/movies/${movie.tmdb_id}`">
                <img :src="getImageUrl(movie.poster_path)" :alt="movie.title" />
                <h4>{{ movie.title }}</h4>
            </RouterLink>
            <p>⭐ {{ movie.vote_average }}</p>
            </div>
        </div>
    
        <div v-else-if="selectedEmotion">
            <p>해당 감정에 연결된 영화가 없습니다.</p>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { fetchEmotions, fetchMoviesByEmotion } from '@/api/emotions'

const emotions = ref([])
const movies = ref([])
const selectedEmotion = ref('')

// 감정 목록 불러오기
onMounted(async () => {
  const response = await fetchEmotions()
  emotions.value = response.data
})

// 감정 클릭 시 영화 불러오기
const loadEmotionMovies = async (emotionName) => {
  selectedEmotion.value = emotionName
  const response = await fetchMoviesByEmotion(emotionName)
  movies.value = response.data
}

// 포스터 이미지 주소
const getImageUrl = (path) => {
  return path
    ? `https://image.tmdb.org/t/p/w300${path}`
    : 'https://via.placeholder.com/300x450?text=No+Image'
}
</script>

<style scoped>
    .emotion-list {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
        margin-bottom: 1rem;
      }
      .emotion-btn {
        background-color: #f0f0f0;
        border: none;
        border-radius: 1rem;
        padding: 0.5rem 1rem;
        font-weight: bold;
        cursor: pointer;
      }
      .selected-title {
        margin-top: 1rem;
        font-weight: bold;
      }
      .movie-list {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        margin-top: 1rem;
      }
      .movie-card {
        width: 150px;
        text-align: center;
      }
      .movie-card img {
        width: 100%;
        border-radius: 8px;
      }
</style>