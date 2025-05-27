from django.urls import path
from . import views

app_name = 'movies'

urlpatterns = [
    # 영화
    path('', views.movie_list, name='movie_list'),  # GET: 전체 영화 리스트
    path('<int:tmdb_id>/', views.movie_detail, name='movie_detail'),  # GET: 영화 상세
    path('<int:tmdb_id>/like/', views.toggle_movie_like, name='movie_like'),  # POST: 영화 찜 토글

    # 리뷰
    path('<int:tmdb_id>/reviews/', views.review_list_create, name='review_list_create'),  # GET, POST
    path('reviews/<int:review_id>/', views.review_detail, name='review_detail'),  # PUT, DELETE
    path('reviews/<int:review_id>/like/', views.toggle_review_like, name='review_like'),  # POST
    
    # 사용자별 리뷰 조회
    path('user/reviews/', views.user_reviews, name='user_reviews'),  # GET: 현재 사용자의 리뷰
    path('user/<str:username>/reviews/', views.user_reviews, name='user_reviews_by_username'),  # GET: 특정 사용자의 리뷰

    # 대댓글
    path('reviews/<int:review_id>/replies/', views.review_reply_list_create, name='review_reply_list_create'),  # GET, POST
    path('replies/<int:reply_id>/', views.review_reply_detail, name='review_reply_detail'),  # PUT, DELETE
]