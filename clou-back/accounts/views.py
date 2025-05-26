from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from dj_rest_auth.registration.views import RegisterView
from allauth.account.utils import complete_signup
from allauth.account import app_settings as allauth_settings

from .models import User
from .serializers import UserSerializer, CustomRegisterSerializer

# Create your views here.

# 커스텀 회원가입 뷰
class CustomRegisterView(RegisterView):
    serializer_class = CustomRegisterSerializer
    
    def create(self, request, *args, **kwargs):
        # 디버깅을 위해 요청 데이터 출력
        print("\n[DEBUG] Registration request data:", request.data)
        print("\n[DEBUG] Nickname from request:", request.data.get('nickname'))
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # serializer.save()에서 이미 닉네임을 저장하므로 여기서는 중복 저장하지 않음
        user = self.perform_create(serializer)
        
        # 디버깅을 위해 유저 정보 출력
        print("\n[DEBUG] User created with ID:", user.id)
        print("\n[DEBUG] User nickname after creation:", user.nickname)
        
        headers = self.get_success_headers(serializer.data)
        data = self.get_response_data(user)
        
        return Response(
            data,
            status=status.HTTP_201_CREATED,
            headers=headers
        )

@api_view(['POST'])
def check_username_exists(request):
    username = request.data.get('username')
    if not username:
        return Response({'error': '사용자 이름을 입력해주세요'}, status=status.HTTP_400_BAD_REQUEST)
    
    exists = User.objects.filter(username=username).exists()
    return Response({'exists': exists})

@api_view(['POST'])
def check_email_exists(request):
    email = request.data.get('email')
    if not email:
        return Response({'error': '이메일을 입력해주세요'}, status=status.HTTP_400_BAD_REQUEST)
    
    exists = User.objects.filter(email=email).exists()
    return Response({'exists': exists})

@api_view(['POST'])
def check_nickname_exists(request):
    nickname = request.data.get('nickname')
    if not nickname:
        return Response({'error': '닉네임을 입력해주세요'}, status=status.HTTP_400_BAD_REQUEST)
    
    exists = User.objects.filter(nickname=nickname).exists()
    return Response({'exists': exists})

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def mypage_view(request):
    user = request.user

    if request.method == 'GET':
        serializer = UserSerializer(user)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
