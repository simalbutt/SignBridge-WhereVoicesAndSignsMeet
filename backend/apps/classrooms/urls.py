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
from apps.classrooms.views.comment import *

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

    path('comments/<int:announcement_id>/', CommentListView.as_view()),
    path('comments/create/<int:announcement_id>/', CommentCreateView.as_view()),
    path('comments/update/<int:comment_id>/', CommentUpdateView.as_view()),
    path('comments/delete/<int:comment_id>/', CommentDeleteView.as_view()),
    path('comments/reply/<int:comment_id>/', CommentReplyView.as_view()),
    path('comments/reply/update/<int:comment_id>/', CommentReplyUpdateView.as_view()),
    path('comments/reply/delete/<int:comment_id>/', CommentReplyDeleteView.as_view()),
]
