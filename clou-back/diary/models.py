from django.db import models
from accounts.models import User
# from movies.models import Movie

# Create your models here.
class DiaryEntry(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    # movie = models.ForeignKey(Movie, on_delete=models.CASCADE) # movie 연동
    # feeling = models.CharField(max_length=20) # 다이어리에 감정필드가 필요할까?
    note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        # unique_together = ('user', 'movie') ← 나중에 중복 방지하려면 사용

    # def __str__(self):
    #     return f"{self.user.nickname}의 감정 기록 ({self.feeling})"