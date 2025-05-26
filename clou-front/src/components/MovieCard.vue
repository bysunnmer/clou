<template>
    <div class="movie-card">
        <div class="poster-wrapper">
          <img :src="posterUrl" :alt="movie.title" class="poster" />
          <div class="overlay">
            <p class="overview">{{ truncatedOverview }}</p>
          </div>
        </div>
        <h3 class="title">{{ movie.title }}</h3>
        <p class="rating">⭐ {{ movie.vote_average.toFixed(1) }}</p>
      </div>
</template>

<script setup>
    defineProps({
        movie: Object
      })
      
      // TMDB 이미지 기본 URL
      const posterUrl = `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      
      const truncatedOverview = movie.overview.length > 300
        ? movie.overview.slice(0, 300) + '...'
        : movie.overview
</script>

<style scoped>
    .movie-card {
        width: 180px;
        display: flex;
        flex-direction: column;
        margin: 1rem;
      }
      
      .poster-wrapper {
        position: relative;
        width: 100%;
        aspect-ratio: 2/3;
        overflow: hidden;
        border-radius: 10px;
      }
      
      .poster {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        border-radius: 10px;
        transition: 0.3s ease;
      }
      
      /* 오버레이 */
      .overlay {
        position: absolute;
        inset: 0;
        background-color: rgba(0, 0, 0, 0.8);
        color: #fff;
        padding: 1rem;
        opacity: 0;
        transition: opacity 0.3s ease;
        display: flex;
        justify-content: center;
        align-items: center;
        text-align: left;
      }
      
      .poster-wrapper:hover .overlay {
        opacity: 1;
      }
      
      .overview {
        font-size: 0.85rem;
        line-height: 1.4;
        max-height: 100%;
        overflow: hidden;
      }
      
      /* 텍스트 */
      .title {
        margin: 0.5rem 0 0.2rem;
        font-size: 1rem;
        font-weight: 600;
        text-align: center;
      }
      
      .rating {
        font-size: 0.85rem;
        text-align: center;
        color: #666;
      }
</style>