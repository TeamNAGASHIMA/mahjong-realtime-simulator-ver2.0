from django.urls import path, include
from .views import mahjong_render, main, tiles_save
from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('mahjong_render/', mahjong_render, name='mahjong_render'), # アクセス用URL
    path('main/', main, name='main'), # 計算実行のエンドポイント
    path('tiles_save/', tiles_save, name='tiles_save'), # 牌譜記録のエンドポイント
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)