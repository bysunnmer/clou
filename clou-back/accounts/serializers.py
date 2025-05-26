# accounts/serializers.py
from dj_rest_auth.registration.serializers import RegisterSerializer
from dj_rest_auth.serializers import LoginSerializer
from rest_framework import serializers
from .models import User
from django.conf import settings
from django.contrib.auth import authenticate, get_user_model
from django.utils.translation import gettext as _
from movies.models import Movie
from movies.serializers import MovieDetailSerializer  # 이미 정의된 디테일용 사용


# 이메일 로그인을 위한 커스텀 로그인 시리얼라이저
class CustomLoginSerializer(LoginSerializer):
    username = None  # username 필드 비활성화
    email = serializers.EmailField(required=True)  # 이메일 필드 필수
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            # 이메일로 사용자 검색
            try:
                user = User.objects.get(email=email)
                # authenticate 함수는 username 필드를 사용하므로 이메일로 검색한 사용자의 username 전달
                user = authenticate(request=self.context.get('request'),
                                   username=user.username,
                                   password=password)
            except User.DoesNotExist:
                user = None
            
            if not user:
                msg = _('이메일 또는 비밀번호가 잘못되었습니다.')
                raise serializers.ValidationError(msg, code='authorization')
        else:
            msg = _('이메일과 비밀번호를 모두 입력해야 합니다.')
            raise serializers.ValidationError(msg, code='authorization')
        
        attrs['user'] = user
        return attrs

class CustomRegisterSerializer(RegisterSerializer):
    nickname = serializers.CharField()
    
    def validate_nickname(self, nickname):
        # 닉네임 중복 확인
        user = User.objects.filter(nickname=nickname)
        if user.exists():
            raise serializers.ValidationError(
                '이미 사용 중인 닉네임입니다. 다른 닉네임을 사용해주세요.'
            )
        return nickname
    
    def validate_email(self, email):
        # 이메일 중복 확인 (기본 검사 강화)
        user = User.objects.filter(email=email)
        if user.exists():
            raise serializers.ValidationError(
                '이미 사용 중인 이메일입니다. 다른 이메일을 사용해주세요.'
            )
        return email
        
    def validate_username(self, username):
        # 사용자 이름 중복 확인 (기본 검사 강화)
        user = User.objects.filter(username=username)
        if user.exists():
            raise serializers.ValidationError(
                '이미 사용 중인 사용자 이름입니다. 다른 사용자 이름을 사용해주세요.'
            )
        return username

    def get_cleaned_data(self):
        data = super().get_cleaned_data()
        data['nickname'] = self.validated_data.get('nickname', '')
        return data
        
    def save(self, request):
        user = super().save(request)
        
        # 닉네임 처리
        nickname = self.validated_data.get('nickname', '').strip()
        
        # 닉네임이 없으면 사용자 이름 사용
        if not nickname:
            nickname = user.username
            
        # 닉네임 중복 처리
        base_nickname = nickname
        counter = 1
        
        # 중복 해결 로직
        while User.objects.filter(nickname=nickname).exists():
            nickname = f"{base_nickname}{counter}"
            counter += 1
            
        user.nickname = nickname
        user.save()
        return user


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