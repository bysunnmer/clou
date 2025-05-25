from django.urls import path
from .views import mypage_view

urlpatterns = [
    path('mypage/', mypage_view, name='mypage'),
]
