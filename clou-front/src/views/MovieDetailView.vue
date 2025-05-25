<template>
    <div v-if="movie">
        <h2>{{ movie.title }}</h2>
        <img :src="getImageUrl(movie.poster_path)" :alt="movie.title" />
        <p>개봉일: {{ movie.release_date }}</p>
        <p>평점: {{ movie.vote_average }}</p>
        <p>소개: {{ movie.overview }}</p>
        
        <!-- OST 리스트 -->
        <div v-if="movie.osts && movie.osts.length" class="osts">
            <h3>🎵 OST</h3>
            <ul>
              <li v-for="(ost, index) in movie.osts" :key="index">
                <p>
                  <strong>{{ ost.name }}</strong>
                  <span v-if="ost.artist_name"> - {{ ost.artist_name }}</span>
                </p>
                <a :href="ost.spotify_url" target="_blank">[Spotify]</a><br />
                <audio v-if="ost.preview_url" :src="ost.preview_url" controls></audio>
              </li>
            </ul>
          </div>
        <!-- 🔻 리뷰 섹션 -->
        <div class="reviews">
            <h3>📝 리뷰</h3>
    
            <!-- ✍️ 리뷰 작성 폼 -->
            <div class="review-form">
            <textarea v-model="newReview" placeholder="리뷰를 입력하세요"></textarea>
            <button @click="submitReview">작성하기</button>
            </div>
    
            <!-- 📃 리뷰 목록 -->
            <div v-if="movie.reviews && movie.reviews.length">
            <ul>
                <li v-for="review in movie.reviews" :key="review.id">
                <p><strong>{{ review.username }}</strong>: {{ review.content }}</p>
                <p class="date">{{ formatDate(review.created_at) }}</p>
    
                <!-- 👍 좋아요 -->
                <button class="like-btn" @click="handleLike(review)">
                    {{ review.is_liked ? '👍' : '🤍' }} {{ review.like_count }}
                </button>
    
                <!-- 🗑️ 삭제 (본인만) -->
                <button
                    v-if="review.user_id === currentUserId"
                    class="delete-btn"
                    @click="handleDelete(review.id)"
                >
                    삭제
                </button>
                </li>
            </ul>
            </div>
            <div v-else>
            <p>아직 리뷰가 없습니다.</p>
            </div>
        </div>
    </div>
</template>
  

<script setup>
    import { ref, onMounted } from 'vue'
    import { useRoute } from 'vue-router'
    import axios from 'axios'
    
    const route = useRoute()
    const movie = ref(null)
    const newReview = ref('')
    
    // ✅ (임시) 현재 로그인된 사용자 ID
    const currentUserId = 1 // 실제 구현 시 백엔드에서 받아와야 함
    
    onMounted(async () => {
      const id = route.params.id
      try {
        const response = await axios.get(`http://localhost:8000/api/v1/movies/${id}/`)
        movie.value = response.data
      } catch (error) {
        console.error('영화 불러오기 실패:', error)
      }
    })
    
    // ✅ 포스터 경로
    const getImageUrl = (path) => {
      return path
        ? `https://image.tmdb.org/t/p/w300${path}`
        : 'https://via.placeholder.com/300x450?text=No+Image'
    }
    
    // ✅ 날짜 포맷
    const formatDate = (datetime) => {
      return new Date(datetime).toLocaleString('ko-KR', {
        dateStyle: 'medium',
        timeStyle: 'short'
      })
    }
    
    // ✅ 리뷰 작성
    const submitReview = async () => {
      if (!newReview.value.trim()) return alert('리뷰를 입력하세요')
      try {
        const response = await axios.post(
          `http://localhost:8000/api/v1/movies/${route.params.id}/reviews/`,
          { content: newReview.value },
          { withCredentials: true }
        )
        movie.value.reviews.push(response.data)
        newReview.value = ''
      } catch (error) {
        console.error('리뷰 작성 실패:', error)
        alert('로그인이 필요합니다')
      }
    }
    
    // ✅ 리뷰 삭제
    const handleDelete = async (reviewId) => {
      if (!confirm('정말 삭제할까요?')) return
      try {
        await axios.delete(`http://localhost:8000/api/v1/reviews/${reviewId}/`)
        movie.value.reviews = movie.value.reviews.filter(r => r.id !== reviewId)
      } catch (error) {
        console.error('삭제 실패:', error)
        alert('삭제할 수 없습니다.')
      }
    }
    
    // ✅ 좋아요 토글
    const handleLike = async (review) => {
      try {
        if (review.is_liked) {
          await axios.delete(`http://localhost:8000/api/v1/reviews/${review.id}/like/`)
          review.like_count -= 1
        } else {
          await axios.post(`http://localhost:8000/api/v1/reviews/${review.id}/like/`)
          review.like_count += 1
        }
        review.is_liked = !review.is_liked
      } catch (error) {
        console.error('좋아요 실패:', error)
        alert('로그인이 필요합니다.')
      }
    }
</script>
    

<style scoped>
    .reviews {
      margin-top: 2rem;
    }
    .reviews ul {
      list-style: none;
      padding: 0;
    }
    .reviews li {
      border-bottom: 1px solid #ccc;
      padding: 0.5rem 0;
    }
    .date {
      color: #888;
      font-size: 0.85rem;
    }
    .review-form {
        margin-top: 2rem;
      }
      .review-form textarea {
        width: 100%;
        min-height: 80px;
        padding: 0.5rem;
        font-size: 1rem;
        margin-bottom: 0.5rem;
      }
      .review-form button {
        background-color: #222;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        cursor: pointer;
        font-weight: bold;
      }
      .delete-btn {
        background-color: crimson;
        color: white;
        border: none;
        padding: 0.2rem 0.5rem;
        margin-left: 0.5rem;
        cursor: pointer;
      }
      .like-btn {
        background: none;
        border: none;
        font-size: 1rem;
        color: #444;
        cursor: pointer;
      }
        .emotions {
          margin-top: 2rem;
        }
        .emotion-tags {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .emotion {
          background-color: #f3f3f3;
          border-radius: 1rem;
          padding: 0.3rem 0.8rem;
          font-size: 0.95rem;
        }
        .osts {
          margin-top: 2rem;
        }
        .osts ul {
          list-style: none;
          padding: 0;
        }
        .osts li {
          margin-bottom: 1rem;
        }        
</style>