from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db.models import Q
import datetime
from .models import DiaryEntry
from .serializers import DiaryEntrySerializer
from accounts.models import User

# 사용자의 모든 다이어리 항목 조회 및 생성
@api_view(['GET', 'POST'])
# @permission_classes([IsAuthenticated])
def diary_list(request):
    # 개발 중 임시 코드 - 인증 없이 첫 번째 사용자로 테스트
    user = request.user
    if not user.is_authenticated:
        user = User.objects.first()
        
    if request.method == 'GET':
        entries = DiaryEntry.objects.filter(user=user)
        serializer = DiaryEntrySerializer(entries, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = DiaryEntrySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# 월별 다이어리 항목 조회
@api_view(['GET'])
# @permission_classes([IsAuthenticated])
def monthly_diary(request, year, month):
    # 개발 중 임시 코드 - 인증 없이 첫 번째 사용자로 테스트
    user = request.user
    if not user.is_authenticated:
        user = User.objects.first()
    
    try:
        # 해당 월의 첫날과 마지막 날 계산
        year = int(year)
        month = int(month)
        
        # 유효한 년월인지 검증
        if not (1 <= month <= 12 and 1900 <= year <= 2100):
            return Response({"error": "유효하지 않은 년월입니다."}, status=status.HTTP_400_BAD_REQUEST)
            
        start_date = datetime.date(year, month, 1)
        
        # 다음 달의 첫날 - 1일 = 이번 달의 마지막 날
        if month == 12:
            end_date = datetime.date(year + 1, 1, 1) - datetime.timedelta(days=1)
        else:
            end_date = datetime.date(year, month + 1, 1) - datetime.timedelta(days=1)
        
        # 해당 월에 속하는 다이어리 항목 조회
        entries = DiaryEntry.objects.filter(
            user=user,
            date__gte=start_date,
            date__lte=end_date
        ).order_by('date')
        
        serializer = DiaryEntrySerializer(entries, many=True)
        return Response(serializer.data)
        
    except ValueError:
        return Response({"error": "유효하지 않은 년월 형식입니다."}, status=status.HTTP_400_BAD_REQUEST)

# 특정 다이어리 항목 상세 조회, 수정, 삭제
@api_view(['GET', 'PUT', 'DELETE'])
# @permission_classes([IsAuthenticated])
def diary_detail(request, entry_id):
    # 개발 중 임시 코드 - 인증 없이 첫 번째 사용자로 테스트
    user = request.user
    if not user.is_authenticated:
        user = User.objects.first()
        
    entry = get_object_or_404(DiaryEntry, pk=entry_id, user=user)

    if request.method == 'GET':
        serializer = DiaryEntrySerializer(entry)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = DiaryEntrySerializer(entry, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        entry.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)