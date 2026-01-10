from django.urls import path
from .views import ClassroomListCreateView, ClassroomDeleteView

urlpatterns = [
    path("classes/", ClassroomListCreateView.as_view(), name="classroom-list-create"),
    path("classes/<int:pk>/", ClassroomDeleteView.as_view(), name="classroom-delete"),
]
