from django.urls import path
from .views import GenerateTranscriptView ,DownloadTranscriptView

urlpatterns = [
    path("generate/", GenerateTranscriptView.as_view(), name="generate-transcript"),
    path("download/", DownloadTranscriptView.as_view(), name="download-transcript"),
]
