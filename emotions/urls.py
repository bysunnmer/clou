from django.urls import path
from . import views

app_name = 'emotions'

urlpatterns = [
    path('', views.emotion_list, name='emotion_list'),
    path('<str:emotion_name>/movies/', views.emotion_movie_list, name='emotion_movie_list'),
]