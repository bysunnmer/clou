import re
from django.core.management.base import BaseCommand
from movies.models import Movie
from emotions.models import Emotion, MovieEmotion

class Command(BaseCommand):
    help = '영화 데이터를 분석하여 감정 태그를 생성합니다'
    
    # 키워드와 감정을 연결하는 매핑 사전
    KEYWORD_TO_EMOTION = {
        # 행복 관련 키워드
        'comedy': '행복', 'funny': '행복', 'humor': '행복', 'laughter': '행복',
        '코미디': '행복', '코믹': '행복', '유머': '행복', '웃음': '행복', '재밌': '행복',
        'fun': '행복', 'joyful': '행복', 'happy': '행복', 'happiness': '행복',
        
        # 슬픔 관련 키워드
        'sad': '슬픔', 'tragedy': '슬픔', 'grief': '슬픔', 'tear': '슬픔',
        '슬픔': '슬픔', '슬픈': '슬픔', '눈물': '슬픔', '비극': '슬픔', '상실': '슬픔',
        'melancholy': '슬픔', 'sorrow': '슬픔', 'depressing': '슬픔',
        
        # 공포 관련 키워드
        'horror': '공포', 'scary': '공포', 'terror': '공포', 'ghost': '공포',
        '공포': '공포', '무서운': '공포', '괴물': '공포', '귀신': '공포', '좀비': '공포',
        'creature': '공포', 'monster': '공포', 'zombie': '공포', 'nightmare': '공포',
        'supernatural horror': '공포',
        
        # 분노 관련 키워드
        'anger': '분노', 'rage': '분노', 'revenge': '분노', 'vengeance': '분노',
        '분노': '분노', '복수': '분노', '화': '분노', '격분': '분노', '증오': '분노',
        'fury': '분노', 'wrath': '분노', 'hate': '분노',
        
        # 사랑 관련 키워드
        'love': '사랑', 'romance': '사랑', 'romantic': '사랑', 'relationship': '사랑',
        '사랑': '사랑', '로맨스': '사랑', '연애': '사랑', '로맨틱': '사랑', '커플': '사랑',
        'passion': '사랑', 'affection': '사랑', 'kiss': '사랑',
        
        # 놀라움 관련 키워드
        'surprise': '놀라움', 'twist': '놀라움', 'unexpected': '놀라움', 'shocking': '놀라움',
        '놀라움': '놀라움', '반전': '놀라움', '충격': '놀라움', '예상치 못한': '놀라움',
        'revelation': '놀라움', 'plot twist': '놀라움', 'amazing': '놀라움',
        
        # 평온 관련 키워드
        'calm': '평온', 'peaceful': '평온', 'serene': '평온', 'tranquil': '평온',
        '평온': '평온', '차분': '평온', '평화': '평온', '안정': '평온', '고요': '평온',
        'harmony': '평온', 'relaxing': '평온',
        
        # 긴장 관련 키워드
        'tense': '긴장', 'suspense': '긴장', 'thriller': '긴장', 'anxiety': '긴장',
        '긴장': '긴장', '스릴러': '긴장', '서스펜스': '긴장', '불안': '긴장',
        'intense': '긴장', 'tension': '긴장', 'nerve-wracking': '긴장',
        
        # 감동 관련 키워드
        'moving': '감동', 'touching': '감동', 'emotional': '감동', 'heartwarming': '감동',
        '감동': '감동', '울컥': '감동', '감성': '감동', '마음이 따뜻해지는': '감동',
        'heartfelt': '감동', 'inspirational': '감동', 'poignant': '감동',
        
        # 희망 관련 키워드
        'hope': '희망', 'inspiring': '희망', 'uplifting': '희망', 'dream': '희망',
        '희망': '희망', '꿈': '희망', '도전': '희망', '극복': '희망', '용기': '희망',
        'optimistic': '희망', 'courage': '희망', 'faith': '희망'
    }
    
    # 장르와 감정을 연결하는 매핑 사전
    GENRE_TO_EMOTION = {
        '코미디': '행복',
        '로맨스': '사랑',
        '로맨틱 코미디': '사랑',
        '드라마': '감동',
        '공포': '공포',
        '호러': '공포',
        '스릴러': '긴장',
        '액션': '긴장',
        '모험': '희망',
        '판타지': '평온',
        '가족': '행복',
        '애니메이션': '행복',
        '멜로': '슬픔',
        '범죄': '분노',
        '다큐멘터리': '평온',
        '음악': '평온',
        '미스터리': '놀라움',
        '전쟁': '슬픔',
        '역사': '감동',
        '스포츠': '희망',
        '서부': '평온',
        '뮤지컬': '행복',
        
        # 영어 장르
        'comedy': '행복',
        'romance': '사랑',
        'romantic comedy': '사랑',
        'drama': '감동',
        'horror': '공포',
        'thriller': '긴장',
        'action': '긴장',
        'adventure': '희망',
        'fantasy': '평온',
        'family': '행복',
        'animation': '행복',
        'crime': '분노',
        'documentary': '평온',
        'music': '평온',
        'mystery': '놀라움',
        'war': '슬픔',
        'history': '감동',
        'sport': '희망',
        'western': '평온',
        'musical': '행복',
        'sci-fi': '놀라움',
        'science fiction': '놀라움'
    }
    
    def handle(self, *args, **options):
        self.stdout.write('영화 감정 태깅을 시작합니다...')
        
        # 데이터베이스에 Emotion이 없으면 먼저 로드
        if Emotion.objects.count() == 0:
            self.stdout.write('감정 데이터를 로드합니다...')
            from django.core.management import call_command
            call_command('loaddata', 'emotions')
        
        # 모든 영화에 감정 태그 지정
        movies = Movie.objects.all()
        total_movies = movies.count()
        processed = 0
        
        for movie in movies:
            self.tag_movie_with_emotions(movie)
            processed += 1
            if processed % 10 == 0:
                self.stdout.write(f'{processed}/{total_movies} 영화 처리 완료...')
        
        self.stdout.write(self.style.SUCCESS(f'총 {total_movies}개 영화에 감정 태깅을 완료했습니다!'))
    
    def tag_movie_with_emotions(self, movie):
        """영화의 장르, 키워드, 줄거리를 분석하여 감정 태그 생성"""
        
        # 기존 감정 연결 제거
        MovieEmotion.objects.filter(movie=movie).delete()
        
        # 분석할 텍스트 모음
        texts = []
        
        # 키워드 분석
        if movie.keywords:
            keywords = movie.keywords.lower().split(', ')
            texts.extend(keywords)
        
        # 장르 분석
        if movie.genres:
            genres = movie.genres.lower().split(', ')
            texts.extend(genres)
        
        # 줄거리 분석 (간단한 형태로)
        if movie.overview:
            # 개요에서 간단히 키워드 추출
            overview_words = re.findall(r'\b\w+\b', movie.overview.lower())
            texts.extend(overview_words)
        
        # 감정 점수 딕셔너리 초기화
        emotion_scores = {}
        
        # 텍스트 기반 점수 계산
        for text in texts:
            # 키워드 매칭
            if text in self.KEYWORD_TO_EMOTION:
                emotion_name = self.KEYWORD_TO_EMOTION[text]
                emotion_scores[emotion_name] = emotion_scores.get(emotion_name, 0) + 0.2
            
            # 장르 매칭
            if text in self.GENRE_TO_EMOTION:
                emotion_name = self.GENRE_TO_EMOTION[text]
                emotion_scores[emotion_name] = emotion_scores.get(emotion_name, 0) + 0.3
        
        # 영화 제목에 특정 키워드가 있는지 확인
        title_lower = movie.title.lower()
        for keyword, emotion in self.KEYWORD_TO_EMOTION.items():
            if keyword in title_lower:
                emotion_scores[emotion] = emotion_scores.get(emotion, 0) + 0.4
        
        # 최소 2개 이상의 감정을 보장하기 위한 처리
        if len(emotion_scores) < 2:
            # 기본 감정 할당
            if '공포' in movie.genres.lower() or 'horror' in movie.genres.lower():
                emotion_scores['공포'] = emotion_scores.get('공포', 0) + 0.5
                emotion_scores['긴장'] = emotion_scores.get('긴장', 0) + 0.3
            elif '코미디' in movie.genres.lower() or 'comedy' in movie.genres.lower():
                emotion_scores['행복'] = emotion_scores.get('행복', 0) + 0.5
                emotion_scores['놀라움'] = emotion_scores.get('놀라움', 0) + 0.2
            elif '로맨스' in movie.genres.lower() or 'romance' in movie.genres.lower():
                emotion_scores['사랑'] = emotion_scores.get('사랑', 0) + 0.5
                emotion_scores['감동'] = emotion_scores.get('감동', 0) + 0.2
            else:
                # 기본값으로 임의 감정 할당
                emotion_scores['평온'] = emotion_scores.get('평온', 0) + 0.3
                emotion_scores['희망'] = emotion_scores.get('희망', 0) + 0.2
        
        # 점수 정규화 (최대 1.0)
        for emotion_name in emotion_scores:
            emotion_scores[emotion_name] = min(emotion_scores[emotion_name], 1.0)
        
        # 점수가 0.2 이상인 감정만 선택 (최대 5개)
        top_emotions = sorted(
            [(e, s) for e, s in emotion_scores.items() if s >= 0.2],
            key=lambda x: x[1],
            reverse=True
        )[:5]
        
        # 감정-영화 연결 저장
        for emotion_name, score in top_emotions:
            try:
                emotion = Emotion.objects.get(name=emotion_name)
                MovieEmotion.objects.create(
                    movie=movie,
                    emotion=emotion,
                    score=score
                )
                self.stdout.write(f'  - {movie.title}: {emotion_name} ({score:.2f})')
            except Emotion.DoesNotExist:
                self.stdout.write(self.style.ERROR(f'오류: 감정 "{emotion_name}"이(가) 데이터베이스에 없습니다.'))
