from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Emotion
from movies.models import Movie
from .serializers import EmotionSerializer, EmotionMovieSerializer

# 감정 리스트 -> 버튼용
@api_view(['GET'])
def emotion_list(request):
    emotions = Emotion.objects.all()
    serializer = EmotionSerializer(emotions, many=True)
    return Response(serializer.data)

# 감정별 영화 리스트
@api_view(['GET'])
def emotion_movie_list(request, emotion_name):
    emotion = get_object_or_404(Emotion, name=emotion_name)
    movies = emotion.movies.all()
    serializer = EmotionMovieSerializer(movies, many=True)
    return Response(serializer.data)