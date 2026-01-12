from django.urls import path
from .views.classroom import ClassroomListCreateView, ClassroomDeleteView
from .views.student import (
    ClassroomStudentsView,
    AddStudentView,
    RemoveStudentView,
)
urlpatterns = [
    path("classes/", ClassroomListCreateView.as_view(), name="classroom-list-create"),
    path("classes/<int:pk>/", ClassroomDeleteView.as_view(), name="classroom-delete"),
    path("<int:classroom_id>/students/", ClassroomStudentsView.as_view()),
    path("<int:classroom_id>/students/add/", AddStudentView.as_view()),
    path("<int:classroom_id>/students/<int:student_id>/remove/", RemoveStudentView.as_view()),
]
