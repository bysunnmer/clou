import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import MovieListView from '../views/MovieListView.vue'
import MovieDetailView from '@/views/MovieDetailView.vue'
import EmotionView from '@/views/EmotionView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/movies', name: 'movies', component: MovieListView },
    { path: '/movies/:id', name: 'movie-detail', component: MovieDetailView },
    { path: '/emotions', name: 'emotions', component: EmotionView },

  ],
})

export default router
