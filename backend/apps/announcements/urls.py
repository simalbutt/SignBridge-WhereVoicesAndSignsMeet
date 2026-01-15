from django.urls import path
from .views.announcement import ClassroomAnnouncementListCreateView, AnnouncementDetailView
from .views.comment import CommentListCreateView, CommentDetailView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("classrooms/<int:classroom_id>/announcements/", ClassroomAnnouncementListCreateView.as_view()),
    path("announcements/<int:pk>/", AnnouncementDetailView.as_view()),
    path("announcements/<int:announcement_id>/comments/", CommentListCreateView.as_view()),
    path("comments/<int:pk>/", CommentDetailView.as_view()),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
