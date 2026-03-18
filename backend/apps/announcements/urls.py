from django.urls import path
from .views.announcement import ClassroomAnnouncementListCreateView, AnnouncementDetailView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("classrooms/<int:classroom_id>/announcements/", ClassroomAnnouncementListCreateView.as_view()),
    path("announcements/<int:pk>/", AnnouncementDetailView.as_view()),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
