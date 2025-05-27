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
        <div class="movie-info-grid">
          <!-- 영화 기본 정보 (왼쪽 컬럼) -->
          <div class="movie-info-column">
            <div class="info-item">
              <div class="info-label">개봉일</div>
              <div class="info-value">{{ movie.release_date }}</div>
            </div>
            
            <div class="info-item" v-if="movie.vote_average !== null">
              <div class="info-label">평점</div>
              <div class="info-value rating">
                <span class="star">⭐</span> 
                <span class="rating-number">{{ movie.vote_average.toFixed(1) }}</span>
                <span class="rating-max">/ 10</span>
              </div>
            </div>
            
            <div class="info-item">
              <div class="info-label">상영시간</div>
              <div class="info-value">{{ movie.runtime }}분</div>
            </div>
            
            <div class="info-item">
              <div class="info-label">장르</div>
              <div class="info-value">
                <span v-for="(genre, index) in movie.genres?.split(', ')" :key="index" class="genre-tag">
                  {{ genre }}
                </span>
              </div>
            </div>
            
            <div class="info-item">
              <div class="info-label">제작국가</div>
              <div class="info-value">{{ movie.production_countries }}</div>
            </div>
          </div>
          
          <!-- 영화 추가 정보 (오른쪽 컬럼) -->
          <div class="movie-info-column">
            <div class="info-item">
              <div class="info-label">언어</div>
              <div class="info-value">{{ movie.original_language }}</div>
            </div>
            
            <div class="info-item">
              <div class="info-label">감독</div>
              <div class="info-value director">{{ movie.director }}</div>
            </div>
            
            <div class="info-item">
              <div class="info-label">출연진</div>
              <div class="info-value cast-list">
                <span v-for="(actor, index) in movie.cast?.split(', ')" :key="index" class="actor">
                  {{ actor }}
                </span>
              </div>
            </div>
            
            <div class="info-item">
              <div class="info-label">키워드</div>
              <div class="info-value keywords">
                <span v-for="(keyword, index) in movie.keywords?.split(', ')" :key="index" class="keyword-tag">
                  {{ keyword }}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 영화 소개 (전체 너비) -->
        <div class="info-item overview">
          <div class="info-label">소개</div>
          <div class="info-value">{{ movie.overview }}</div>
        </div>

        <button class="like-btn" @click="toggleLike(movie)" :aria-label="movie.is_liked ? '찜 해제' : '찜하기'">
          {{ movie.is_liked ? '❤️ 찜함' : '🤍 찜하기' }}
        </button>
      </div>
    </div>

    <!-- 🎵 OST 섹션 -->
    <div class="ost-section" v-if="movie.osts && movie.osts.length > 0">
      <h2 class="section-title">🎵 영화 OST</h2>
      <div class="ost-container">
        <div class="ost-card" v-for="(ost, index) in movie.osts" :key="index">
          <div class="ost-info">
            <div class="ost-title">{{ ost.title }}</div>
            <div class="ost-artist">{{ ost.artist_name }}</div>
          </div>
          
          <div class="ost-controls">
            <!-- 미리듣기 가능한 경우 오디오 플레이어 표시 -->
            <div v-if="ost.preview_url" class="preview-player">
              <audio 
                :id="`audio-player-${index}`" 
                :src="ost.preview_url"
                preload="none"
                class="audio-player"
              ></audio>
              <button 
                class="play-button" 
                @click="togglePreview(index, ost.preview_url)"
                :class="{ 'playing': isPlaying[index] }"
              >
                <span v-if="!isPlaying[index]">▶️</span>
                <span v-else>⏸️</span>
              </button>
            </div>
            
            <!-- 스포티파이 링크 -->
            <a 
              :href="ost.spotify_url" 
              target="_blank" 
              rel="noopener noreferrer" 
              class="spotify-link"
            >
              <img src="https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_RGB_Green.png" alt="Spotify" class="spotify-logo">
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- 리뷰 섹션 -->
    <ReviewSection :movieId="movie.tmdb_id" />
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { fetchMovieById } from '@/api/movies'
import { useMovieStore } from '@/stores/movie'
import ReviewSection from '@/components/ReviewSection.vue'

const route = useRoute()
const movieStore = useMovieStore()
const movie = ref(null)
const alertMessage = ref('')
const showAlert = ref(false)
const audioPlayers = ref({})
const currentOstPreview = ref(null)
const isPlaying = reactive({})

onMounted(async () => {
  try {
    const res = await fetchMovieById(route.params.id)
    
    if (res.success) {
      movie.value = res.data
      console.log('받아온 영화 데이터:', res.data) // 디버깅용
    } else {
      console.error('영화 정보 가져오기 실패:', res.message)
    }
  } catch (err) {
    console.error('영화 정보 로딩 실패:', err)
  }
})

const toggleLike = async (movieItem) => {
  try {
    // tmdb_id를 사용해야 함 (서버에서 이 필드를 예상함)
    const tmdbId = movieItem.tmdb_id
    console.log('좋아요 요청 ID:', tmdbId) // 디버깅용
    
    if (!tmdbId) {
      throw new Error('TMDB ID가 없습니다')
    }
    
    // 스토어를 통해 좋아요 토글 처리
    const result = await movieStore.toggleLike(movieItem)
    
    if (result.success) {
      // 이전 상태를 기억
      const previousState = movieItem.is_liked
      
      // 좋아요 상태 업데이트
      movieItem.is_liked = !previousState
      
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

const togglePreview = (index, previewUrl) => {
  if (!previewUrl) return
  
  // 현재 오디오 요소 가져오기
  const audio = document.querySelector(`#audio-player-${index}`)
  if (!audio) return
  
  // 현재 재생 중인 다른 모든 오디오 정지
  Object.keys(isPlaying).forEach(key => {
    if (key !== index.toString() && isPlaying[key]) {
      const otherAudio = document.querySelector(`#audio-player-${key}`)
      if (otherAudio) {
        otherAudio.pause()
        otherAudio.currentTime = 0
      }
      isPlaying[key] = false
    }
  })
  
  // 현재 오디오 토글
  if (isPlaying[index]) {
    audio.pause()
    audio.currentTime = 0
    isPlaying[index] = false
  } else {
    audio.play()
    isPlaying[index] = true
    
    // 오디오 종료 시 상태 업데이트
    audio.onended = () => {
      isPlaying[index] = false
    }
  }
}

const getImageUrl = (path) => {
  if (!path) return 'https://via.placeholder.com/300x450?text=No+Image'
  return `https://image.tmdb.org/t/p/w500${path}`
}
</script>

<style scoped>
.detail-wrapper {
  min-height: 100vh;
  overflow-x: hidden;
  background-color: #f8f9fa;
  padding-top: 60px;
}

@media (max-width: 768px) {
  .detail-wrapper {
    padding-top: 0;
  }
}

/* 🎥 Hero 섬션 */
.hero {
  position: relative;
  width: 100%;
  height: 60vh;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.hero-backdrop {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: 0;
  transition: transform 0.5s ease-in-out;
}

.hero:hover .hero-backdrop {
  transform: scale(1.02);
}

.hero-overlay {
  position: relative;
  z-index: 2;
  width: 100%;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.5) 60%, rgba(0, 0, 0, 0.3) 100%);
  color: #fff;
  padding: 3rem 2rem 2rem;
  backdrop-filter: blur(2px);
}

.hero-content {
  max-width: 1300px;
  margin: 0 auto;
  text-align: left;
  padding: 0 1rem;
  box-sizing: border-box;
}

.hero-content .release {
  font-size: 1rem;
  margin-top: 0.5rem;
  color: #e0e0e0;
}

.hero-content .overview-hero {
  font-size: 1.1rem;
  line-height: 1.6;
  margin-top: 1rem;
  color: #f3f3f3;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
  max-width: 800px;
  word-break: break-word;
}

.hero .title {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.6);
  background: linear-gradient(to right, #ffffff, #e0e0e0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero .tagline {
  font-size: 1.2rem;
  font-style: italic;
  opacity: 0.9;
  margin: 1rem 0;
  color: #00A676;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
}

/* 📋 상세 정보 영역 */
.detail-content {
  max-width: 1300px;
  margin: 3rem auto;
  display: flex;
  gap: 3rem;
  padding: 0 2rem;
  flex-wrap: wrap;
  align-items: flex-start;
}

.poster-box {
  flex: 1 1 280px;
  max-width: 320px;
  position: relative;
  transition: transform 0.3s ease;
}

.poster-box:hover {
  transform: translateY(-5px);
}

.poster {
  width: 100%;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);
  transition: all 0.3s ease;
}

.poster:hover {
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.35);
}

.info-box {
  flex: 2 1 500px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background-color: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
}

.movie-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

@media (max-width: 768px) {
  .movie-info-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

.info-item {
  margin-bottom: 0.5rem;
}

.info-label {
  color: #00A676;
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 0.3rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.info-value {
  font-size: 1.05rem;
  color: #333;
  line-height: 1.5;
}

.rating {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.star {
  color: #f8d64e;
}

.rating-number {
  font-weight: 600;
}

.rating-max {
  color: #777;
  font-size: 0.9rem;
}

.genre-tag, .keyword-tag {
  display: inline-block;
  padding: 0.3rem 0.7rem;
  border-radius: 20px;
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.genre-tag {
  background-color: #e9f7f2;
  color: #00A676;
  border: 1px solid rgba(0, 166, 118, 0.2);
}

.genre-tag:hover {
  background-color: #d5f0e9;
  transform: translateY(-2px);
  box-shadow: 0 2px 5px rgba(0, 166, 118, 0.1);
}

.keyword-tag {
  background-color: #f5f5f5;
  color: #555;
  border: 1px solid #e0e0e0;
}

.keyword-tag:hover {
  background-color: #eeeeee;
  transform: translateY(-2px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.actor {
  display: inline-block;
  margin-right: 0.7rem;
  margin-bottom: 0.5rem;
  position: relative;
  font-weight: 500;
}

.actor:not(:last-child):after {
  content: '•';
  position: absolute;
  right: -0.5rem;
  color: #ccc;
  font-weight: normal;
}

.director {
  font-weight: 500;
}

.overview {
  margin-top: 1.5rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  border-top: 1px solid #eee;
  background-color: #f9f9f9;
  border-radius: 8px;
  position: relative;
}

.overview .info-label {
  margin-bottom: 0.5rem;
  font-size: 1rem;
  display: inline-block;
  padding: 0.2rem 0.5rem;
  background-color: #00A676;
  color: white;
  border-radius: 4px;
}

.overview .info-value {
  line-height: 1.7;
  text-align: justify;
  white-space: pre-line;
}

/* 좋아요 버튼 */
.like-btn {
  background-color: #00A676;
  color: white;
  border-radius: 50px;
  padding: 0.7rem 1.5rem;
  font-size: 1.05rem;
  margin-top: 1.5rem;
  cursor: pointer;
  transition: all 0.3s;
  align-self: flex-start;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(255, 71, 87, 0.15);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.like-btn:hover {
  background-color: #ff4757;
  color: white;
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(255, 71, 87, 0.3);
}

.like-btn:active {
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(255, 71, 87, 0.2);
}

/* 리뷰 섹션 */
.review-section {
  max-width: 1300px;
  margin: 3rem auto;
  padding: 0 2rem;
}

.review-title {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: #333;
  font-weight: bold;
  position: relative;
  display: inline-block;
}

.review-title::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 60px;
  height: 3px;
  background-color: #00A676;
  border-radius: 2px;
}

.review-list {
  list-style: none;
  padding: 0;
}

.review-list li {
  background: #fff;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.review-list li:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
}

.review-list .date {
  font-size: 0.9rem;
  color: #888;
  margin-top: 0.5rem;
}

/* 알림 팝업 */
.popup-alert {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 1rem 2rem;
  border-radius: 30px;
  font-weight: 500;
  font-size: 0.95rem;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s ease-out forwards;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translate(-50%, 20px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

/* 반응형 스타일 */
@media (max-width: 1024px) {
  .hero .title {
    font-size: 2rem;
  }
  
  .detail-content {
    padding: 0 1.5rem;
  }
}

@media (max-width: 768px) {
  .hero-content .release {
    display: block;
    font-size: 0.9rem;
    margin-top: 0.3rem;
    color: #f3f3f3;
  }
  
  .hero .tagline,
  .hero-content .overview-hero {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    max-height: 3rem;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .hero {
    height: 45vh;
  }
  
  .hero .title {
    font-size: 1.7rem;
  }
  
  .detail-content {
    flex-direction: column;
    align-items: center;
    gap: 2rem;
    margin-top: 2rem;
  }
  
  .poster-box {
    max-width: 250px;
  }
  
  .detail-content {
    text-align: center;
  }
  
  .info-box {
    align-items: center;
    text-align: center;
  }
}
/* OST 섹션 스타일 */
.ost-section {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 2rem;
}

.section-title {
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  color: #333;
  font-weight: 600;
  position: relative;
  padding-bottom: 0.5rem;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 80px;
  height: 3px;
  background-color: #00A676;
}

.ost-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.ost-card {
  background-color: #f8f9fa;
  border-radius: 10px;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s, box-shadow 0.2s;
}

.ost-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.ost-info {
  flex: 1;
}

.ost-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #333;
}

.ost-artist {
  font-size: 0.9rem;
  color: #666;
}

.ost-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.preview-player {
  display: flex;
  align-items: center;
}

.audio-player {
  display: none;
}

.play-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #00A676;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.2s;
}

.play-button:hover {
  background-color: #008f63;
  transform: scale(1.05);
}

.play-button.playing {
  background-color: #f44336;
}

.spotify-link {
  display: block;
}

.spotify-logo {
  width: 80px;
  height: auto;
  transition: opacity 0.2s;
}

.spotify-logo:hover {
  opacity: 0.8;
}

@media (max-width: 768px) {
  .ost-container {
    grid-template-columns: 1fr;
  }
  
  .ost-card {
    padding: 1.2rem;
  }
}
</style>
