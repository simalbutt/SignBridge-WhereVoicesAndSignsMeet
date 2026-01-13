from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from apps.announcements.models import Announcement, AnnouncementFile
from apps.classrooms.models import Classroom
from apps.announcements.serializers.announcement import AnnouncementSerializer
from apps.announcements.permissions import IsTeacher, IsAuthor, IsEnrolledOrTeacher

class ClassroomAnnouncementListCreateView(generics.ListCreateAPIView):
    serializer_class = AnnouncementSerializer
    permission_classes = [IsAuthenticated, IsEnrolledOrTeacher]

    def get_queryset(self):
        return Announcement.objects.filter(classroom_id=self.kwargs["classroom_id"])

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAuthenticated(), IsTeacher()]
        return super().get_permissions()

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request  
        return context

    def perform_create(self, serializer):
        classroom = Classroom.objects.get(id=self.kwargs["classroom_id"])
        announcement = serializer.save(classroom=classroom, author=self.request.user)
        for file in self.request.FILES.getlist("files"):
            AnnouncementFile.objects.create(announcement=announcement, file=file)


class AnnouncementDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Announcement.objects.all()
    serializer_class = AnnouncementSerializer

    def get_permissions(self):
        if self.request.method in ["PUT", "PATCH", "DELETE"]:
            return [IsAuthenticated(), IsAuthor()]
        return [IsAuthenticated()]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context
