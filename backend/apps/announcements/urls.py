from django.urls import path
from .views.announcement import ClassroomAnnouncementListCreateView, AnnouncementDetailView
from .views.comment import CommentListCreateView, CommentDetailView

urlpatterns = [
    path(
        "classrooms/<int:classroom_id>/announcements/",
        ClassroomAnnouncementListCreateView.as_view(),
    ),
    path(
        "announcements/<int:pk>/",
        AnnouncementDetailView.as_view(),
    ),
    path(
        "announcements/<int:announcement_id>/comments/",
        CommentListCreateView.as_view(),
    ),
    path(
        "comments/<int:pk>/",
        CommentDetailView.as_view(),
    ),
]
