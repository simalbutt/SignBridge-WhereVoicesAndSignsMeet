from django.urls import path
from .views import (
    CommentDeleteView,
    GenerateTranscriptView, 
    DownloadTranscriptView, 
    CharacterInferenceView,
    CameraInferenceView, 
    CommentCreateView,
    CommentReplyView
)

urlpatterns = [
    # --- AI & Transcription Logic ---
    path("generate/", GenerateTranscriptView.as_view(), name="generate-transcript"),
    path("download/", DownloadTranscriptView.as_view(), name="download-transcript"),
    path('predict-character/', CharacterInferenceView.as_view(), name='predict_character'),
    path('predict-camera/', CameraInferenceView.as_view(), name='predict_camera'),
    
    # --- Classroom Communication Logic ---
    path('announcements/<int:announcement_id>/comments/', CommentCreateView.as_view(), name='create-comment'),
    path('comments/<int:comment_id>/reply/', CommentReplyView.as_view(), name='comment-reply'),
    path('comments/<int:comment_id>/delete/', CommentDeleteView.as_view(), name='delete-comment'),
]