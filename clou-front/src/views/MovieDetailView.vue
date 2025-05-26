<template>
  <div class="detail-wrapper" v-if="movie">
    <!-- 🎬 상단 히어로 섹션 -->
    <div class="hero">
      <div
        class="hero-backdrop"
        :style="{ backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.95) 100%), url('${getImageUrl(movie.poster_path)}')` }"
      ></div>
      <div class="hero-overlay">
        <div class="hero-content">
          <h1 class="title">{{ movie.title }}</h1>
          <p class="release"><strong>개봉일:</strong> {{ movie.release_date }}</p>
          <p class="overview-hero">
            <strong>소개:</strong>
            {{ movie.overview ? movie.overview.slice(0, 100) + (movie.overview.length > 100 ? '...' : '') : '소개 정보가 없습니다.' }}
          </p>
          <p v-if="movie.tagline" class="tagline">“{{ movie.tagline }}”</p>
        </div>
      </div>
    </div>

    <!-- 📄 상세 정보 카드 -->
    <div class="detail-content">
      <div class="poster-box">
        <img :src="getImageUrl(movie.poster_path)" :alt="movie.title" class="poster" />
      </div>
      <div class="info-box">
        <p><strong>개봉일:</strong> {{ movie.release_date }}</p>
        <p v-if="movie.vote_average !== null">
          <strong>평점:</strong> ⭐ {{ movie.vote_average.toFixed(1) }} / 10
        </p>
        <p><strong>상영시간:</strong> {{ movie.runtime }}분</p>
        <p><strong>장르:</strong> {{ movie.genres }}</p>
        <p><strong>제작국가:</strong> {{ movie.production_countries }}</p>
        <p><strong>언어:</strong> {{ movie.original_language }}</p>
        <p><strong>감독:</strong> {{ movie.director }}</p>
        <p><strong>출연진:</strong> {{ movie.cast }}</p>
        <p><strong>키워드:</strong> {{ movie.keywords }}</p>
        <p><strong>소개:</strong> {{ movie.overview }}</p>

        <button class="like-btn" @click="toggleLike(movie)" :aria-label="movie.is_liked ? '찜 해제' : '찜하기'">
          {{ movie.is_liked ? '❤️ 찜함' : '🤍 찜하기' }}
        </button>
      </div>
    </div>

    <!-- 리뷰 섹션
    <div class="review-section" v-if="movie.reviews?.length">
      <h3 class="review-title">📝 리뷰</h3>
      <ul class="review-list">
        <li v-for="review in movie.reviews" :key="review.id">
          <p><strong>{{ review.username }}</strong>: {{ review.content }}</p>
          <p class="date">{{ new Date(review.created_at).toLocaleDateString() }}</p>
        </li>
      </ul>
    </div> -->

    <div v-if="showAlert" class="popup-alert">{{ alertMessage }}</div>
    <ReviewSection :movieId="movie.id" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { fetchMovieById, likeMovie, unlikeMovie } from '@/api/movies'
import ReviewSection from '@/components/ReviewSection.vue' //

const route = useRoute()
const movie = ref(null)
const showAlert = ref(false)
const alertMessage = ref('')

onMounted(async () => {
  try {
    const res = await fetchMovieById(route.params.id)
    movie.value = res.data
  } catch (err) {
    console.error('영화 정보 로딩 실패:', err)
  }
})

const toggleLike = async (movieItem) => {
  try {
    if (movieItem.is_liked) {
      await unlikeMovie(movieItem.id)
    } else {
      await likeMovie(movieItem.id)
    }
    movieItem.is_liked = !movieItem.is_liked
  } catch (err) {
    alertMessage.value = '로그인이 필요합니다!'
    showAlert.value = true
    setTimeout(() => (showAlert.value = false), 2000)
  }
}

const getImageUrl = (path) =>
  path ? `https://image.tmdb.org/t/p/w500${path}` : 'https://placehold.co/300x450?text=No+Image&font=roboto'
</script>

<style scoped>
.detail-wrapper {
  width: 100vw;
  overflow-x: hidden;
  background-color: #f8f9fa;
  padding-top: 4.5rem;
}

.detail-wrapper .hero {
  height: 55vh;
}

/* 🎬 Hero 스타일 */
.hero {
  position: relative;
  width: 100%;
  height: 65vh;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
}
.hero-backdrop {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0; left: 0;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: 0;
}
.hero-overlay {
  position: relative;
  z-index: 2;
  width: 100%;
  background: none;
  color: #fff;
  padding: 3rem 2rem 2rem;
}


.hero-content {
  max-width: 1100px;     /* detail-content와 동일하게 */
  margin: 0 auto;
  text-align: left;
  padding-left: 2rem;    /* detail-content와 동일하게 */
  padding-right: 2rem;
  box-sizing: border-box;
}

.hero-content .overview-hero {
  font-size: 1.05rem;
  line-height: 1.5;
  margin-top: 0.5rem;
  color: #f3f3f3;
  text-shadow: 0 1px 4px rgba(0,0,0,0.5);
  max-width: 700px;
  word-break: break-all;
}

.hero .title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}
.hero .tagline {
  font-size: 1.1rem;
  opacity: 0.85;
  margin-bottom: 0.5rem;
}

/* 📄 상세 정보 */
.detail-content {
  max-width: 1100px;
  margin: 2rem auto;
  display: flex;
  gap: 2rem;
  padding: 0 2rem;
  flex-wrap: wrap;
  align-items: flex-start;
}
.poster-box {
  flex: 1 1 250px;
  max-width: 300px;
}
.poster {
  width: 100%;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}
.info-box {
  flex: 2 1 400px;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.info-box p {
  font-size: 1rem;
  color: #333;
}

.like-btn {
  background-color: #00A676;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 20px;
  font-weight: bold;
  cursor: pointer;
  width: fit-content;
  transition: background-color 0.3s ease;
}
.like-btn:hover {
  background-color: #008b5c;
}

.review-section {
  max-width: 1100px;
  margin: 2rem auto;
  padding: 0 2rem;
}
.review-title {
  font-size: 1.2rem;
  margin-bottom: 1rem;
}
.review-list {
  list-style: none;
  padding: 0;
}
.review-list li {
  background: #fff;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}
.review-list .date {
  font-size: 0.85rem;
  color: #888;
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
    .hero-content .release {
      display: block; /* 개봉일 표시 */
      font-size: 0.9rem;
      margin-top: 0.3rem;
      color: #f3f3f3;
    }
    .hero .tagline,
    .hero-content .overview-hero {
      display: -webkit-box;         /* 보이게 변경 */
      -webkit-line-clamp: 2;        /* 2줄까지만 표시 */
      -webkit-box-orient: vertical;
      max-height: 3rem;             /* 높이 제한 */
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .detail-wrapper {
      padding-top: 4.5rem; 
    }
    .hero {
      height: 40vh; /* 히어로 높이 축소 유지 */
    }
    .detail-content {
      flex-direction: column;
      align-items: center;     /* 수평 중앙 정렬 */
      justify-content: center; /* 수직 중앙 정렬 (옵션) */
      text-align: center;      /* 텍스트 중앙 정렬 */
    }
    .info-box {
      align-items: center;
      text-align: center;
    }
  }
</style>
