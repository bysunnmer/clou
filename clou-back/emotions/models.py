from django.db import models

# Create your models here.
class Emotion(models.Model):
    name = models.CharField(max_length=50, unique=True)  # 예: 슬픔, 고독, 따뜻함
    description = models.TextField(blank=True)  # 감정 설명 (선택)

    def __str__(self):
        return self.name


class MovieEmotion(models.Model):
    """영화와 감정을 연결하는 모델"""
    movie = models.ForeignKey('movies.Movie', on_delete=models.CASCADE, related_name='emotion_connections')
    emotion = models.ForeignKey(Emotion, on_delete=models.CASCADE, related_name='movie_connections')
    score = models.FloatField(default=0.0)  # 감정 관련성 점수 (0.0 ~ 1.0)
    
    class Meta:
        unique_together = ('movie', 'emotion')
        ordering = ['-score']  # 점수 높은 순으로 정렬
    
    def __str__(self):
        return f"{self.movie.title} - {self.emotion.name} ({self.score:.2f})"