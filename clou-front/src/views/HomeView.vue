<template>
  <div class="home">
    <section class="hero">
      <div
        v-for="(bg, index) in images"
        :key="index"
        class="background"
        :style="{ backgroundImage: `url('${bg}')` }"
        :class="{ active: index === current }"
      ></div>

      <div class="overlay">
        <h1 class="headline">감정을 담은 영화 플랫폼</h1>
        <p class="subtext">나의 무드에 따라, Clou에서 영화를 탐색하세요.</p>
        <div class="cta-buttons">
          <RouterLink to="/movies" class="cta">지금 둘러보기</RouterLink>
          <RouterLink to="/emotions" class="cta alt">감정으로 찾기</RouterLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import { RouterLink } from 'vue-router'
  
  import bg1 from '@/assets/hero-bg1.jpg'
  import bg2 from '@/assets/hero-bg2.jpg'
  import bg3 from '@/assets/hero-bg3.jpg'
  
  const images = [bg1, bg2, bg3]
  const current = ref(0)
  
  onMounted(() => {
    setInterval(() => {
      current.value = (current.value + 1) % images.length
    }, 5000)
  })
</script>

<style scoped>
  .home, .hero {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    position: relative;
  }
  
  .background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
    opacity: 0;
    transition: opacity 1s ease-in-out;
    z-index: 0;
  }
  
  /* ✅ 현재 보여줄 배경 */
  .background.active {
    opacity: 1;
    z-index: 0;
  }
  
  .overlay {
    position: relative;
    z-index: 1;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  
  .headline {
    font-size: clamp(1.8rem, 4vw, 2.5rem);
    font-weight: 700;
    margin-bottom: 1rem;
    color: #DFFFE7;
  }
  
  .subtext {
    font-size: clamp(1rem, 2vw, 1.2rem);
    margin-bottom: 2rem;
    color: #ffffff;
  }
  
  .cta-buttons {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 1rem;
  }
  
  .cta {
    background-color: #00A676;
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 9999px;
    font-weight: bold;
    transition: background-color 0.2s;
    text-decoration: none;
    cursor: pointer;
  }
  
  .cta.alt {
    background-color: transparent;
    border: 2px solid white;
  }
  
  .cta:hover {
    background-color: #00885A;
  }
  
  @media (max-width: 768px) {
    .cta {
      width: 100%;
      text-align: center;
    }
    .cta-buttons {
      flex-direction: column;
    }
  }

</style>
