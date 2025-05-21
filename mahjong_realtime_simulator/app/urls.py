from django.urls import path
from .views import cra_page_view, cra_page_loader_view

urlpatterns = [
    path('cra-demo/', cra_page_view, name='cra_demo'),
    path('cra-demo2/', cra_page_loader_view, name='cra_demo2'),
]