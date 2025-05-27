from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Movie, Review, ReviewReply
from osts.spotify_utils import search_movie_ost
from .serializers import (
    MovieListSerializer,
    MovieDetailSerializer,
    ReviewSerializer,
    ReviewReplySerializer
)

# Create your views here.
@api_view(['GET'])
def movie_list(request):
    movies = Movie.objects.all()
    serializer = MovieListSerializer(movies, many=True, context={'request': request})
    return Response(serializer.data)


# ✅ 영화 상세 조회 (tmdb_id 기반 + OST 포함)
@api_view(['GET'])
def movie_detail(request, tmdb_id):
    movie = get_object_or_404(Movie, tmdb_id=tmdb_id)
    serializer = MovieDetailSerializer(movie, context={'request': request})
    data = serializer.data
    data['osts'] = search_movie_ost(movie.title)
    return Response(data)


# ✅ 영화 찜 기능
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_movie_like(request, tmdb_id):
    movie = get_object_or_404(Movie, tmdb_id=tmdb_id)
    user = request.user
    
    if movie.liked_users.filter(id=user.id).exists():
        movie.liked_users.remove(user)
        liked = False
    else:
        movie.liked_users.add(user)
        liked = True
        
    return Response({
        'liked': liked,
        'like_count': movie.liked_users.count()
    })

# ✅ 리뷰 목록 조회 및 생성
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticatedOrReadOnly])
def review_list_create(request, tmdb_id):
    movie = get_object_or_404(Movie, tmdb_id=tmdb_id)
    if request.method == 'GET':
        reviews = movie.reviews.all().order_by('-created_at')
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = ReviewSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user, movie=movie)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
# ✅ 리뷰 수정 및 삭제
@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def review_detail(request, review_id):
    review = get_object_or_404(Review, pk=review_id)
    
    # 리뷰 작성자만 수정/삭제 가능
    if review.user != request.user:
        return Response({'error': '권한이 없습니다.'}, status=status.HTTP_403_FORBIDDEN)
    
    if request.method == 'PUT':
        serializer = ReviewSerializer(review, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        review.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ✅ 리뷰 좋아요 기능
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_review_like(request, review_id):
    review = get_object_or_404(Review, pk=review_id)
    user = request.user
    
    if review.likes.filter(id=user.id).exists():
        review.likes.remove(user)
        liked = False
    else:
        review.likes.add(user)
        liked = True
        
    return Response({
        'liked': liked, 
        'like_count': review.likes.count()
    })
    
    
# ✅ 리뷰 답글 조회 및 생성
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticatedOrReadOnly])
def review_reply_list_create(request, review_id):
    review = get_object_or_404(Review, pk=review_id)
    
    if request.method == 'GET':
        replies = review.replies.all().order_by('created_at')
        serializer = ReviewReplySerializer(replies, many=True)
        return Response(serializer.data)
        
    elif request.method == 'POST':
        serializer = ReviewReplySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user, review=review)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ✅ 리뷰 답글 수정 및 삭제
@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def review_reply_detail(request, reply_id):
    reply = get_object_or_404(ReviewReply, pk=reply_id)
    
    # 답글 작성자만 수정/삭제 가능
    if reply.user != request.user:
        return Response({'error': '권한이 없습니다.'}, status=status.HTTP_403_FORBIDDEN)
    
    if request.method == 'PUT':
        serializer = ReviewReplySerializer(reply, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        reply.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)