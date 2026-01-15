from django.urls import path
from .views.classroom import (
    ClassroomListCreateView,
    ClassroomRetrieveDeleteView,
)
from .views.studentdashboard import (
    StudentClassListView,
    EnrollInClassView,
    UnenrollClassView,
)

from .views.student import ClassroomStudentsView, AddStudentView, RemoveStudentView

urlpatterns = [
     path("classes/", ClassroomListCreateView.as_view(), name="classroom-list-create"),
    path("classes/<int:pk>/", ClassroomRetrieveDeleteView.as_view(), name="classroom-retrieve-delete"),

    path("<int:classroom_id>/students/", ClassroomStudentsView.as_view()),
    path("<int:classroom_id>/students/add/", AddStudentView.as_view()),
    path("<int:classroom_id>/students/<int:student_id>/remove/", RemoveStudentView.as_view()),

    path("student/classes/", StudentClassListView.as_view()),
    path("student/enroll/", EnrollInClassView.as_view()),
    path("student/unenroll/<int:classroom_id>/", UnenrollClassView.as_view()),
]
