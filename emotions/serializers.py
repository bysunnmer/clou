from rest_framework import serializers
from movies.models import Movie
from .models import Emotion

### 영화 리스트(간략한 정보만)
class EmotionMovieSerializer(serializers.ModelSerializer):
    class Meta:
        model = Movie
        fields = ['id', 'tmdb_id', 'title', 'poster_path', 'vote_average']

### 감정
class EmotionSerializer(serializers.ModelSerializer):
    movies = EmotionMovieSerializer(many=True, read_only=True)

    class Meta:
        model = Emotion
        fields = ['id', 'name','movies']