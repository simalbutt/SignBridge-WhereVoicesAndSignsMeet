from django.urls import path
from .views import TextToGlossView, BatchTextToGlossView

urlpatterns = [
    path('convert/', TextToGlossView.as_view(), name='text-to-gloss'),
    path('batch-convert/', BatchTextToGlossView.as_view(), name='batch-text-to-gloss'),
]