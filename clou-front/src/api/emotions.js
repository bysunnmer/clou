import api from './axios'

// 감정 리스트
export const fetchEmotions = () => {
    return api.get('api/v1/emotions/')
}

// 감정별 영화 리스트
export const fetchMoviesByEmotion = (emotionName) => {
    return api.get(`api/v1/emotions/${emotionName}/movies/`)
}

// 영화의 감정 리스트
export const fetchMovieEmotions = (tmdbId) => {
    return api.get(`api/v1/emotions/movies/${tmdbId}/`)
}
  