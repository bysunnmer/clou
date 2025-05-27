from rest_framework import serializers
from movies.models import Movie
from .models import Emotion, MovieEmotion

### 영화 리스트(간략한 정보만)
class EmotionMovieSerializer(serializers.ModelSerializer):
    is_liked = serializers.SerializerMethodField()
    
    class Meta:
        model = Movie
        fields = ['id', 'tmdb_id', 'title', 'poster_path', 'vote_average', 'overview', 'is_liked']
    
    def get_is_liked(self, obj):
        # 요청에서 사용자가 있을 경우만 좋아요 확인
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.liked_users.filter(id=request.user.id).exists()
        return False

### 감정
class EmotionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Emotion
        fields = ['id', 'name', 'description']

### 영화-감정 연결
class MovieEmotionSerializer(serializers.ModelSerializer):
    emotion = EmotionSerializer(read_only=True)
    movie = EmotionMovieSerializer(read_only=True)
    
    class Meta:
        model = MovieEmotion
        fields = ['id', 'movie', 'emotion', 'score']

### 감정과 그에 관련된 영화들
class EmotionWithMoviesSerializer(serializers.ModelSerializer):
    movies = serializers.SerializerMethodField()
    
    class Meta:
        model = Emotion
        fields = ['id', 'name', 'description', 'movies']
    
    def get_movies(self, obj):
        # 해당 감정과 연결된 영화들을 점수 높은 순으로 가져오기
        movie_emotions = obj.movie_connections.all()
        movies = [me.movie for me in movie_emotions]
        # context를 통해 request 전달
        serializer = EmotionMovieSerializer(movies, many=True, context=self.context)
        return serializer.data