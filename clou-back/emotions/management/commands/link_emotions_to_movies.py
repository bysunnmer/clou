from django.core.management.base import BaseCommand
from movies.models import Movie
from emotions.models import Emotion, MovieEmotion
import random

class Command(BaseCommand):
    help = '영화와 감정을 연결하는 스크립트'

    def handle(self, *args, **options):
        # 기존 연결 데이터 확인
        existing_count = MovieEmotion.objects.count()
        self.stdout.write(f'기존 영화-감정 연결 수: {existing_count}')
        
        # 모든 영화와 감정 가져오기
        movies = Movie.objects.all()
        emotions = Emotion.objects.all()
        
        if not movies.exists():
            self.stdout.write(self.style.ERROR('영화 데이터가 없습니다. 먼저 영화 데이터를 추가해주세요.'))
            return
            
        if not emotions.exists():
            self.stdout.write(self.style.ERROR('감정 데이터가 없습니다. 먼저 감정 데이터를 추가해주세요.'))
            return
            
        # 생성된 연결 수 카운트
        created_count = 0
        
        # 각 영화마다 2-4개의 감정을 랜덤으로 연결
        for i, movie in enumerate(movies):
            # 이미 분석된 영화는 건너뛰기
            if MovieEmotion.objects.filter(movie=movie).exists():
                self.stdout.write(f"[{i+1}/{len(movies)}] '{movie.title}' - 이미 분석됨")
                continue
                
            # 이 영화에 연결할 감정 수 (2-4개)
            num_emotions = random.randint(2, 4)
            
            # 랜덤하게 감정 선택
            random_emotions = random.sample(list(emotions), min(num_emotions, len(emotions)))
            
            for emotion in random_emotions:
                # 이미 연결이 있는지 확인
                if not MovieEmotion.objects.filter(movie=movie, emotion=emotion).exists():
                    # 랜덤 점수 생성 (0.5-1.0)
                    score = random.uniform(0.5, 1.0)
                    
                    # 영화-감정 연결 생성
                    MovieEmotion.objects.create(
                        movie=movie,
                        emotion=emotion,
                        score=score
                    )
                    created_count += 1
            
            self.stdout.write(f"[{i+1}/{len(movies)}] '{movie.title}' 분석 완료")
        
        self.stdout.write(self.style.SUCCESS(f'총 {created_count}개의 영화-감정 연결이 생성되었습니다.'))
