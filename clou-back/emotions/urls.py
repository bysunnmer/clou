from django.urls import path
from . import views

app_name = 'emotions'

urlpatterns = [
    # 감정 리스트 & 상세
    path('', views.emotion_list, name='emotion_list'),
    path('<int:emotion_id>/', views.emotion_detail, name='emotion_detail'),
    
    # 감정별 영화
    path('<str:emotion_name>/movies/', views.emotion_movie_list, name='emotion_movie_list'),
    
    # 영화의 감정 리스트
    path('movies/<int:tmdb_id>/', views.movie_emotions, name='movie_emotions'),
]