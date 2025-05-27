from django.db import models
import datetime
from accounts.models import User
from movies.models import Movie
from emotions.models import Emotion

class DiaryEntry(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    movie = models.ForeignKey(Movie, on_delete=models.SET_NULL, null=True, blank=True, related_name='diary_entries')
    emotion = models.ForeignKey(Emotion, on_delete=models.SET_NULL, null=True, blank=True, related_name='diary_entries')
    date = models.DateField(default=datetime.date.today)
    note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date', '-created_at']
        # unique_together = ('user', 'date') # 하루에 하나의 다이어리만 작성 가능하게 할 경우 활성화

    def __str__(self):
        emotion_str = self.emotion.name if self.emotion else '감정 없음'
        return f"{self.user.nickname}의 {self.date} 다이어리 ({emotion_str})"