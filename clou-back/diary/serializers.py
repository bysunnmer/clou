from rest_framework import serializers
from .models import DiaryEntry
from movies.serializers import MovieListSerializer
from emotions.serializers import EmotionSerializer

class DiaryEntrySerializer(serializers.ModelSerializer):
    # 읽기 전용 중첩 필드 (상세 조회 시 사용)
    movie_detail = MovieListSerializer(source='movie', read_only=True)
    emotion_detail = EmotionSerializer(source='emotion', read_only=True)
    username = serializers.ReadOnlyField(source='user.username')
    nickname = serializers.ReadOnlyField(source='user.nickname')
    
    class Meta:
        model = DiaryEntry
        fields = ['id', 'user', 'username', 'nickname', 'movie', 'movie_detail', 
                 'emotion', 'emotion_detail', 'date', 'note', 'created_at']
        read_only_fields = ['id', 'user', 'username', 'nickname', 'created_at']
