from django.urls import path
from . import views

urlpatterns = [
    path('', views.diary_list, name='diary-list'),
    path('<int:entry_pk>/', views.diary_detail, name='diary-detail'),
]
