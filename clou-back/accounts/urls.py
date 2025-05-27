from django.urls import path
from .views import mypage_view, check_username_exists, check_email_exists, check_nickname_exists, CustomRegisterView

urlpatterns = [
    # 계정 관리 URL
    path('mypage/', mypage_view, name='mypage'),
    # 중복 검사 API URL
    path('check-username/', check_username_exists, name='check_username'),
    path('check-email/', check_email_exists, name='check_email'),
    path('check-nickname/', check_nickname_exists, name='check_nickname'),
]
