<template>
    <div>
      <h2>🎬 영화 목록</h2>
      <div class="movie-grid">
        <div v-for="movie in movies" :key="movie.id" class="movie-card">
            <RouterLink :to="`/movies/${movie.tmdb_id}`">
                <img class="poster" :src="getImageUrl(movie.poster_path)" :alt="movie.title" />
            </RouterLink>
            <RouterLink :to="`/movies/${movie.tmdb_id}`" class="title">
                <h3>{{ movie.title }}</h3>
            </RouterLink>
          <div class="rating">
            <span class="stars">{{ renderStars(movie.vote_average) }}</span>
            <span class="score">({{ movie.vote_average.toFixed(1) }})</span>
          </div>
          <button class="like-btn" @click="toggleLike(movie)">
            {{ movie.is_liked ? '❤️' : '🤍' }}
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { fetchMovies, likeMovie, unlikeMovie } from '@/api/movies'
  
  const movies = ref([])
  
  onMounted(async () => {
    try {
      const response = await fetchMovies()
      movies.value = response.data
    } catch (err) {
      console.error('영화 불러오기 실패:', err)
    }
  })
  
  const renderStars = (rating) => {
    const rounded = Math.round(rating)
    return '⭐️'.repeat(rounded) + '☆'.repeat(5 - rounded)
  }
  
  const getImageUrl = (path) => {
    if (!path) return 'https://via.placeholder.com/300x450?text=No+Image'
    return `https://image.tmdb.org/t/p/w300${path}`
  }
  
  const toggleLike = async (movie) => {
    try {
      if (movie.is_liked) {
        await unlikeMovie(movie.id)
      } else {
        await likeMovie(movie.id)
      }
      movie.is_liked = !movie.is_liked
    } catch (err) {
      console.error('찜 실패:', err)
      alert('로그인이 필요합니다!')
    }
  }
  </script>
  
  <style scoped>
  .like-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    margin-top: 0.3rem;
  }
  </style>
  