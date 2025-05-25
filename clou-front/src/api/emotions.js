import api from './axios'

// 감정 리스트
export const fetchEmotions = () => {
    return api.get('emotions/')
  }

// 감정별 영화 리스트
export const fetchMoviesByEmotion = (emotionName) => {
    return api.get(`emotions/${emotionName}/movies/`)
}
  