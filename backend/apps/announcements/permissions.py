from rest_framework.permissions import BasePermission
from apps.classrooms.models import Enrollment
from apps.announcements.models import Announcement


class IsTeacher(BasePermission):
    """
    Permission for teacher-only access.
    """

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role == "teacher"
        )


class IsEnrolledOrTeacher(BasePermission):
    """
    Allow teachers always.
    Allow students only if enrolled in the classroom.
    Works for comment list/create and classroom views.
    """

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if request.user.role == "teacher":
            return True
        classroom_id = view.kwargs.get("classroom_id")
        announcement_id = view.kwargs.get("announcement_id")

        if classroom_id:
            return Enrollment.objects.filter(
                classroom_id=classroom_id,
                student=request.user
            ).exists()
        elif announcement_id:
            try:
                announcement = Announcement.objects.get(id=announcement_id)
            except Announcement.DoesNotExist:
                return False
            return Enrollment.objects.filter(
                classroom=announcement.classroom,
                student=request.user
            ).exists()

        return False  


class IsAuthor(BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.user == request.user

class IsAuthorOrTeacher(BasePermission):
    def has_object_permission(self, request, view, obj):
        if obj.user == request.user:
            return True
        return request.user.is_authenticated and request.user.role == "teacher"