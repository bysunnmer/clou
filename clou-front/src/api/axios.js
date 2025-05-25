// src/api/axios.js
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1/',
//   withCredentials: true,  // 인증 필요 시
})

export default api
