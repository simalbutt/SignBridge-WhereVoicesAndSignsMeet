from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from apps.announcements.models import Announcement
from apps.classrooms.models import Comment
from apps.announcements.serializers.comment import CommentSerializer
from apps.announcements.permissions import IsEnrolledOrTeacher, IsAuthorOrTeacher

from rest_framework.parsers import MultiPartParser, FormParser

class CommentListCreateView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated, IsEnrolledOrTeacher]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        announcement = Announcement.objects.get(id=self.kwargs["announcement_id"])
        return Comment.objects.filter(announcement=announcement).order_by("created_at")

    def perform_create(self, serializer):
        announcement = Announcement.objects.get(id=self.kwargs["announcement_id"])
        serializer.save(
            announcement=announcement,
            author=self.request.user
        )

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context
class CommentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated, IsAuthorOrTeacher]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context
