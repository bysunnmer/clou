from rest_framework import serializers
from .models import Movie, Review, ReviewReply

class ReviewReplySerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = ReviewReply
        fields = '__all__'
        read_only_fields = ('user', 'review', 'created_at')

class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    replies = ReviewReplySerializer(many=True, read_only=True)
    like_count = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = '__all__'
        read_only_fields = ('user', 'movie', 'likes', 'created_at')

    # 리뷰를 직렬화할 때, 좋아요 수를 계산해서 'like_count' 필드에 넣어 달라는 뜻
    def get_like_count(self, obj):
        return obj.likes.count()

class MovieListSerializer(serializers.ModelSerializer):
    external_rating = serializers.FloatField()
    is_liked = serializers.SerializerMethodField()
    
    class Meta:
        model = Movie
        fields = ['id', 'tmdb_id', 'title', 'poster_path', 'vote_average', 'is_liked']
    
    def get_is_liked(self, obj):
        user = self.context.get('request').user
        return user.is_authenticated and obj.liked_users.filter(id=user.id).exists()

class MovieDetailSerializer(serializers.ModelSerializer):
    reviews = ReviewSerializer(many=True, read_only=True)
    external_rating = serializers.FloatField()
    is_liked = serializers.SerializerMethodField()
    
    class Meta:
        model = Movie
        fields = '__all__'
    
    def get_is_liked(self, obj):
        user = self.context.get('request').user
        return user.is_authenticated and obj.liked_users.filter(id=user.id).exists()