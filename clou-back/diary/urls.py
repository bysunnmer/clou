from django.urls import path
from . import views

urlpatterns = [
    path('', views.diary_list, name='diary-list'),
    path('monthly/<int:year>/<int:month>/', views.monthly_diary, name='diary-monthly'),
    path('<int:entry_id>/', views.diary_detail, name='diary-detail'),
]
