from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.
class User(AbstractUser):
  # 기본: username, email, password는 AbstractUser가 가짐

  nickname = models.CharField(max_length=20, unique=True)
  bio = models.TextField(blank=True)
  profile_image = models.ImageField(upload_to='profiles/', blank=True, null=True)

  # 좋아요한 영화 중 인생 영화 하나 선택 가능
  # favorite_movie = models.ForeignKey(
  #   'movies.Movie',
  #   on_delete=models.SET_NULL,
  #   blank=True,
  #   null=True,
  #   related_name='favored_by_users'
  # )

  def __str__(self):
      return self.nickname or self.username