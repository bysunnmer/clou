from django.db import models

# Create your models here.
class Emotion(models.Model):
    name = models.CharField(max_length=50, unique=True)  # 예: 슬픔, 고독, 따뜻함
    description = models.TextField(blank=True)  # 감정 설명 (선택)

    def __str__(self):
        return self.name