from rest_framework.views import APIView
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from ..serializers.signup import SignupSerializer
from ...utils.response import api_response

class SignupView(APIView):
    permission_classes = []

    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()

            refresh = RefreshToken.for_user(user)
            data = {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "role": user.role,
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            }

            return api_response(
                message="Signup successful!",
                data=data,
                success=True,
                status=status.HTTP_201_CREATED
            )

        return api_response(
            message="Signup failed. Check the errors.",
            errors=serializer.errors,
            success=False,
            status=status.HTTP_400_BAD_REQUEST
        )
