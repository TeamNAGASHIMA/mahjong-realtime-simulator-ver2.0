from django.urls import path, include
from .views import mahjong_render, main
from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('mahjong_render/', mahjong_render, name='mahjong_render'),
    path('main/', main, name='main'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)