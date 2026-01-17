from django.urls import path
from ..views.signup import SignupView
from ..views.login import LoginView
from ..views.logout import LogoutView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from ..views.delete_account import DeleteAccountView

urlpatterns = [
    path('signup/', SignupView.as_view()),
    path('login/', LoginView.as_view()),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("delete-account/", DeleteAccountView.as_view(), name="delete-account"),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
