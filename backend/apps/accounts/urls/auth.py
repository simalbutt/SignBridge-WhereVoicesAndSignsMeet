from django.urls import path
from ..views.signup import SignupView
from ..views.login import LoginView

urlpatterns = [
    path('signup/', SignupView.as_view()),
    path('login/', LoginView.as_view()),
]
