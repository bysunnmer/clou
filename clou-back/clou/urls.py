"""
URL configuration for clou project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from accounts.views import CustomRegisterView

urlpatterns = [
    path('admin/', admin.site.urls),
    # 커스텀 회원가입 URL - 가장 먼저 정의하여 우선순위 부여
    path('accounts/signup/', CustomRegisterView.as_view(), name='rest_register'),
    # 중복 검사 API와 계정 관리 URL
    path('accounts/', include('accounts.urls')),
    # 로그인, 로그아웃 등 기본 인증 URL
    path('accounts/', include('dj_rest_auth.urls')),
    # dj-rest-auth 회원가입 URL은 사용하지 않음 (커스텀 URL 사용)
    # path('accounts/signup/', include('dj_rest_auth.registration.urls')),
    # 기타 API 엔드포인트
    path('api/v1/diary/', include('diary.urls')),
    path('api/v1/movies/', include('movies.urls')),
    path('api/v1/emotions/', include('emotions.urls')),
]
