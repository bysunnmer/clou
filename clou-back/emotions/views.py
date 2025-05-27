from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Emotion, MovieEmotion
from movies.models import Movie
from .serializers import (
    EmotionSerializer, 
    EmotionMovieSerializer, 
    MovieEmotionSerializer,
    EmotionWithMoviesSerializer
)

# 감정 리스트 -> 버튼용
@api_view(['GET'])
def emotion_list(request):
    emotions = Emotion.objects.all()
    serializer = EmotionSerializer(emotions, many=True)
    return Response(serializer.data)

# 감정별 영화 리스트
@api_view(['GET'])
def emotion_movie_list(request, emotion_name):
    try:
        emotion = get_object_or_404(Emotion, name=emotion_name)
        
        # 해당 감정과 연결된 영화 가져오기
        movie_emotions = MovieEmotion.objects.filter(emotion=emotion).order_by('-score')
        movies = [me.movie for me in movie_emotions]
        
        serializer = EmotionMovieSerializer(movies, many=True, context={'request': request})
        return Response(serializer.data)
    except Emotion.DoesNotExist:
        return Response(
            {"error": f"감정 '{emotion_name}'을(를) 찾을 수 없습니다."}, 
            status=status.HTTP_404_NOT_FOUND
        )

# 영화의 감정 리스트
@api_view(['GET'])
def movie_emotions(request, tmdb_id):
    movie = get_object_or_404(Movie, tmdb_id=tmdb_id)
    movie_emotions = MovieEmotion.objects.filter(movie=movie).order_by('-score')
    serializer = MovieEmotionSerializer(movie_emotions, many=True)
    return Response(serializer.data)

# 감정과 연결된 영화 상세 정보 (단일 감정)
@api_view(['GET'])
def emotion_detail(request, emotion_id):
    emotion = get_object_or_404(Emotion, id=emotion_id)
    serializer = EmotionWithMoviesSerializer(emotion, context={'request': request})
    return Response(serializer.data)