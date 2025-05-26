from django.db import models
from django.conf import settings

# Create your models here.
class Movie(models.Model):
    # 받아 올 id 저장
    tmdb_id = models.IntegerField(unique=True)
    title = models.CharField(max_length=200)
    overview = models.TextField(blank=True)
    tagline = models.CharField(max_length=255, blank=True)
    genres = models.CharField(max_length=255, blank=True)
    production_countries = models.CharField(max_length=255, blank=True)
    vote_average = models.FloatField(null=True, blank=True)
    runtime = models.FloatField(null=True, blank=True)
    original_language = models.CharField(max_length=10, blank=True)
    director = models.CharField(max_length=100, blank=True)
    cast = models.TextField(blank=True)
    keywords = models.CharField(max_length=255, blank=True)
    poster_path = models.CharField(max_length=255)
    release_date = models.DateField(null=True, blank=True)

    liked_users = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='liked_movies', blank=True)
    source_type = models.CharField(max_length=50, blank=True)
    emotions = models.ManyToManyField('emotions.Emotion', related_name='movies', blank=True)

    def __str__(self):
        return self.title # 이거 있으면 디버깅하기 좋다고 하는데 일단 모르겠음

# 영화 리뷰
class Review(models.Model):
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    # 좋아요 기능
    likes = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='liked_reviews', blank=True)

# 영화 리뷰에 대한 답글 (따로 있어야함, 데이터를 따로 관리해야 하기 때문에)
class ReviewReply(models.Model):
    review = models.ForeignKey(Review, on_delete=models.CASCADE, related_name='replies')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)