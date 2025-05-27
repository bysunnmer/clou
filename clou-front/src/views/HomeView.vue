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
        <div class="content-wrapper">
          <div class="content-container">
            <div class="text-content">
              <h1 class="headline">CLOU</h1>
              <h2 class="sub-headline">감정으로 연결되는 영화 경험</h2>
              <p class="subtext">지금 당신의 감정에 딱 맞는 영화를 찾아보세요. <br>
                다양한 감정에 따라 선택할 수 있는 특별한 컬렉션을 제공합니다.</p>
              <div class="cta-container">
                <div class="cta-buttons">
                  <RouterLink to="/movies" class="cta primary">영화 탐색하기</RouterLink>
                  <RouterLink to="/emotions" class="cta secondary">감정으로 찾기</RouterLink>
                </div>
              </div>
            </div>
          </div>
          <div class="scroll-indicator">
            <div class="mouse">
              <div class="wheel"></div>
            </div>
            <div class="arrow">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
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
    box-sizing: border-box;
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
    transition: opacity 1.2s ease-in-out, transform 4s ease-in-out;
    transform: scale(1.05);
    z-index: 0;
    filter: brightness(0.85) saturate(1.1);
  }
  
  .background.active {
    opacity: 1;
    transform: scale(1);
    z-index: 0;
  }
  
  .overlay {
    position: relative;
    z-index: 1;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      to right,
      rgba(0, 0, 0, 0.8) 0%,
      rgba(0, 0, 0, 0.6) 50%,
      rgba(0, 0, 0, 0.4) 100%
    );
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .content-wrapper {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    box-sizing: border-box;
    position: relative;
  }

  .content-container {
    width: 90%;
    max-width: 1200px;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    position: relative;
    padding: 0 2rem;
    box-sizing: border-box;
  }

  .text-content {
    max-width: 600px;
  }
  
  .headline {
    font-size: clamp(2.5rem, 8vw, 4rem);
    font-weight: 900;
    margin-bottom: 0.5rem;
    color: white;
    letter-spacing: -1px;
    font-family: 'Montserrat', sans-serif;
  }
  
  .sub-headline {
    font-size: clamp(1.2rem, 3vw, 1.8rem);
    font-weight: 500;
    margin-bottom: 1.5rem;
    color: #00A676;
    letter-spacing: -0.5px;
  }
  
  .subtext {
    font-size: clamp(1rem, 1.5vw, 1.1rem);
    line-height: 1.6;
    margin-bottom: 2.5rem;
    color: rgba(255, 255, 255, 0.9);
    max-width: 500px;
  }
  
  .cta-container {
    width: 100%;
    display: flex;
    justify-content: center;
    margin-bottom: 2rem;
  }
  
  .cta-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: center;
    max-width: 450px;
  }
  
  .cta {
    padding: 0.9rem 2rem;
    border-radius: 50px;
    font-weight: 600;
    font-size: 1rem;
    transition: all 0.3s ease;
    text-decoration: none;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    letter-spacing: 0.5px;
    min-width: 180px;
    text-align: center;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    box-sizing: border-box;
  }

  .cta::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(120deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transform: translateX(-100%);
    transition: transform 0.8s;
  }

  .cta:hover::before {
    transform: translateX(100%);
  }
  
  .cta.primary {
    background-color: #00A676;
    color: white;
  }
  
  .cta.secondary {
    background-color: transparent;
    border: 2px solid rgba(255, 255, 255, 0.8);
    color: white;
  }
  
  .cta.primary:hover {
    background-color: #00885A;
    transform: translateY(-3px);
    box-shadow: 0 7px 20px rgba(0, 0, 0, 0.3);
  }

  .cta.secondary:hover {
    background-color: rgba(255, 255, 255, 0.1);
    transform: translateY(-3px);
    box-shadow: 0 7px 20px rgba(0, 0, 0, 0.2);
  }

  /* 스크롤 인디케이터 */
  .scroll-indicator {
    position: absolute;
    bottom: 3rem;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    opacity: 0.7;
    transition: opacity 0.3s;
  }

  .scroll-indicator:hover {
    opacity: 1;
  }

  .mouse {
    width: 26px;
    height: 40px;
    border: 2px solid white;
    border-radius: 20px;
    position: relative;
    margin-bottom: 0.5rem;
  }

  .wheel {
    width: 4px;
    height: 8px;
    background-color: white;
    position: absolute;
    top: 6px;
    left: 50%;
    transform: translateX(-50%);
    border-radius: 2px;
    animation: scroll 1.5s ease-in-out infinite;
  }

  @keyframes scroll {
    0% { transform: translate(-50%, 0); opacity: 1; }
    100% { transform: translate(-50%, 15px); opacity: 0; }
  }

  .arrow {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }

  .arrow span {
    display: block;
    width: 8px;
    height: 8px;
    border-bottom: 2px solid white;
    border-right: 2px solid white;
    transform: rotate(45deg);
  }
  
  @media (max-width: 768px) {
    .home, .hero {
      width: 100%;
      overflow-x: hidden;
    }
    
    .overlay {
      background: linear-gradient(
        to bottom,
        rgba(0, 0, 0, 0.7) 0%,
        rgba(0, 0, 0, 0.6) 50%,
        rgba(0, 0, 0, 0.7) 100%
      );
      padding: 0;
    }
    
    .content-wrapper {
      align-items: center;
      padding: 0 1rem;
    }

    .content-container {
      width: 100%;
      max-width: 100%;
      align-items: center;
      padding: 0;
      margin: 0 auto;
    }

    .text-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      width: 100%;
      max-width: 100%;
    }
    
    .headline, .sub-headline, .subtext {
      text-align: center;
      max-width: 100%;
      width: 100%;
      margin-left: auto;
      margin-right: auto;
    }
    
    .cta {
      width: 100%;
      min-width: 200px;
      justify-content: center;
      text-align: center;
      margin: 0 auto;
    }
    
    .cta-buttons {
      flex-direction: column;
      width: 100%;
      max-width: 300px;
      align-items: center;
      margin-left: auto;
      margin-right: auto;
    }

    .scroll-indicator {
      position: absolute;
      bottom: 2rem;
      left: 50%;
      transform: translateX(-50%);
      width: auto;
      margin: 0 auto;
    }
  }
</style>
