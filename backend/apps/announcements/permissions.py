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
    """
    Permission to check if the user is the author of the object.
    Works for Announcement (author field) and Comment (user field).
    """
    
    def has_object_permission(self, request, view, obj):
        # Check if the object has an 'author' field (for Announcement)
        if hasattr(obj, 'author'):
            return obj.author == request.user
        # Check if the object has a 'user' field (for Comment)
        elif hasattr(obj, 'user'):
            return obj.user == request.user
        return False


class IsAuthorOrTeacher(BasePermission):
    """
    Permission that allows access if user is the author OR a teacher.
    Works for both Announcement (author) and Comment (user) objects.
    """
    
    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
            
        # Check if user is the author (handles both author and user fields)
        is_author = False
        if hasattr(obj, 'author'):
            is_author = obj.author == request.user
        elif hasattr(obj, 'user'):
            is_author = obj.user == request.user
            
        if is_author:
            return True
            
        # Check if user is a teacher
        return request.user.role == "teacher"