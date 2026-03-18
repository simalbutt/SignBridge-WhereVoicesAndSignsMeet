from django.urls import path
from .views import (
    GenerateTranscriptView, 
    DownloadTranscriptView, 
    CharacterInferenceView,
    CameraInferenceView, 
)

urlpatterns = [
    path("generate/", GenerateTranscriptView.as_view(), name="generate-transcript"),
    path("download/", DownloadTranscriptView.as_view(), name="download-transcript"),
    path('predict-character/', CharacterInferenceView.as_view(), name='predict_character'),
    path('predict-camera/', CameraInferenceView.as_view(), name='predict_camera'),
]