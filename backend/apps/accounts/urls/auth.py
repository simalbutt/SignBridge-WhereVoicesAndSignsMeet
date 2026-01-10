from django.urls import path
from ..views.signup import SignupView
from ..views.login import LoginView
from ..views.logout import LogoutView

urlpatterns = [
    path('signup/', SignupView.as_view()),
    path('login/', LoginView.as_view()),
    path("logout/", LogoutView.as_view(), name="logout"),
]
