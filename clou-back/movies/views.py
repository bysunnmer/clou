from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Movie, Review, ReviewReply
####임시 코드
from rest_framework.permissions import AllowAny
from rest_framework.decorators import permission_classes
####임시 코드
from osts.spotify_utils import search_movie_ost
from .serializers import (
    MovieListSerializer,
    MovieDetailSerializer,
    ReviewSerializer,
    ReviewReplySerializer
)
####임시 코드
from django.contrib.auth import get_user_model
####임시 코드

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
####임시 코드
@permission_classes([AllowAny])
####임시 코드
# def toggle_movie_like(request, tmdb_id):
#     movie = get_object_or_404(Movie, tmdb_id=tmdb_id)
#     user = request.user
#     if movie.liked_users.filter(id=user.id).exists():
#         movie.liked_users.remove(user)
#         liked = False
#     else:
#         movie.liked_users.add(user)
#         liked = True
#     return Response({'liked': liked, 'like_count': movie.liked_users.count()})
def toggle_movie_like(request, tmdb_id):
    from django.contrib.auth import get_user_model
    User = get_user_model()
    user = User.objects.first()  # 인증 없이 첫 유저 사용

    movie = get_object_or_404(Movie, tmdb_id=tmdb_id)

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
####임시 코드
@permission_classes([AllowAny])
####임시 코드
def review_list_create(request, tmdb_id):
    movie = get_object_or_404(Movie, tmdb_id=tmdb_id)
    if request.method == 'GET':
        reviews = movie.reviews.all().order_by('-created_at')
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data)
    # elif request.method == 'POST':
    #     serializer = ReviewSerializer(data=request.data)
    #     if serializer.is_valid():
    #         serializer.save(user=request.user, movie=movie)
    #         return Response(serializer.data, status=201)
    #     return Response(serializer.errors, status=400)
    ####임시 코드
    elif request.method == 'POST':
        from django.contrib.auth import get_user_model
        User = get_user_model()
        dummy_user = User.objects.first()  # 첫 번째 유저를 기본 유저로

        serializer = ReviewSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=dummy_user, movie=movie)  # 여기서 user 지정
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
    ####임시 코드
    
# ✅ 리뷰 수정 및 삭제
@api_view(['PUT', 'DELETE'])
def review_detail(request, review_id):
    review = get_object_or_404(Review, pk=review_id)
    # if review.user != request.user:
    #     return Response({'error': '권한이 없습니다.'}, status=403)

    ####임시 코드
    User = get_user_model()
    dummy_user = User.objects.first()
    if review.user != dummy_user:
        return Response({'error': '권한이 없습니다.'}, status=403)
    ####임시 코드
    
    if request.method == 'PUT':
        serializer = ReviewSerializer(review, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    elif request.method == 'DELETE':
        review.delete()
        return Response(status=204)


# ✅ 리뷰 좋아요 기능
@api_view(['POST'])
@permission_classes([AllowAny])
def toggle_review_like(request, review_id):
    review = get_object_or_404(Review, pk=review_id)
    # user = request.user
    # if review.likes.filter(id=user.id).exists():
    #     review.likes.remove(user)
    #     liked = False
    # else:
    #     review.likes.add(user)
    #     liked = True
    # return Response({'liked': liked, 'like_count': review.likes.count()})
    ####임시 코드
    
    User = get_user_model()
    dummy_user = User.objects.first()

    if review.likes.filter(id=dummy_user.id).exists():
        review.likes.remove(dummy_user)
        liked = False
    else:
        review.likes.add(dummy_user)
        liked = True

    return Response({'liked': liked, 'like_count': review.likes.count()})
    ####임시 코드
    
    
# ✅ 리뷰 답글 조회 및 생성
# @api_view(['GET', 'POST'])  
# def review_reply_list_create(request, review_id):
#     review = get_object_or_404(Review, pk=review_id)
#     if request.method == 'GET':
#         replies = review.replies.all().order_by('created_at')
#         serializer = ReviewReplySerializer(replies, many=True)
#         return Response(serializer.data)
#     elif request.method == 'POST':
#         serializer = ReviewReplySerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save(user=request.user, review=review)
#             return Response(serializer.data, status=201)
#         return Response(serializer.errors, status=400)
####임시 코드
@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def review_reply_list_create(request, review_id):
    review = get_object_or_404(Review, pk=review_id)

    if request.method == 'POST':
        from django.contrib.auth import get_user_model
        User = get_user_model()
        dummy_user = User.objects.first()

        serializer = ReviewReplySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=dummy_user, review=review)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
####임시 코드


# ✅ 리뷰 답글 수정 및 삭제
@api_view(['PUT', 'DELETE'])
def review_reply_detail(request, reply_id):
    reply = get_object_or_404(ReviewReply, pk=reply_id)
    # if reply.user != request.user:
    #     return Response({'error': '권한이 없습니다.'}, status=403)
    ####임시 코드
    User = get_user_model()
    dummy_user = User.objects.first()
    if reply.user != dummy_user:
        return Response({'error': '권한이 없습니다.'}, status=403)
    ####임시 코드
    
    if request.method == 'PUT':
        serializer = ReviewReplySerializer(reply, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    elif request.method == 'DELETE':
        reply.delete()
        return Response(status=204)