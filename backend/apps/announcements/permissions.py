from rest_framework.permissions import BasePermission
from apps.classrooms.models import Enrollment

class IsTeacher(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role == "teacher"
        )

class IsEnrolledOrTeacher(BasePermission):
    def has_permission(self, request, view):
        classroom_id = view.kwargs.get("classroom_id")

        if not request.user.is_authenticated:
            return False

        if request.user.role == "teacher":
            return True

        return Enrollment.objects.filter(
            classroom_id=classroom_id,
            student=request.user
        ).exists()

class IsAuthor(BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.author == request.user

class IsAuthorOrTeacher(BasePermission):
    def has_object_permission(self, request, view, obj):
        if obj.author == request.user:
            return True
        return request.user.is_authenticated and request.user.role == "teacher"
