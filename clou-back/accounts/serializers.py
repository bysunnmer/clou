# accounts/serializers.py
from dj_rest_auth.registration.serializers import RegisterSerializer
from rest_framework import serializers
from .models import User
from movies.models import Movie
from movies.serializers import MovieDetailSerializer  # 이미 정의된 디테일용 사용

class CustomRegisterSerializer(RegisterSerializer):
    nickname = serializers.CharField()

    def get_cleaned_data(self):
        data = super().get_cleaned_data()
        data['nickname'] = self.validated_data.get('nickname', '')
        return data


class UserSerializer(serializers.ModelSerializer):
    favorite_movie = serializers.PrimaryKeyRelatedField(
        queryset=Movie.objects.all(),
        required=False,
        write_only=True
    )
    favorite_movie_detail = MovieDetailSerializer(source='favorite_movie', read_only=True)

    class Meta:
        model = User
        fields = (
            'id', 'username', 'nickname', 'bio', 'profile_image',
            'favorite_movie',         # 쓰기용 (ID만)
            'favorite_movie_detail',  # 보기용 (제목, 평점 등)
        )