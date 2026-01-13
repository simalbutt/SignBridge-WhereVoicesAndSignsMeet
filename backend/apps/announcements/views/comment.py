from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from apps.announcements.models import Comment, Announcement
from apps.announcements.serializers.comment import CommentSerializer
from apps.announcements.permissions import IsEnrolledOrTeacher, IsAuthorOrTeacher


class CommentListCreateView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated, IsEnrolledOrTeacher]

    def get_queryset(self):
        announcement = Announcement.objects.get(id=self.kwargs["announcement_id"])
        return Comment.objects.filter(announcement=announcement)

    def perform_create(self, serializer):
        announcement = Announcement.objects.get(id=self.kwargs["announcement_id"])
        serializer.save(
            announcement=announcement,
            author=self.request.user
        )


class CommentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated, IsAuthorOrTeacher]  

