from rest_framework.views import APIView
from rest_framework import status
from ..serializers.login import LoginSerializer
from ...utils.response import api_response

class LoginView(APIView):
    permission_classes = []  

    def post(self, request):
        serializer = LoginSerializer(data=request.data)

        if not serializer.is_valid():
            return api_response(
                message="Invalid login data",
                success=False,
                errors=serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )
        data = serializer.validated_data

        return api_response(
            message="Login successful",
            data=data,
            success=True,
            status=status.HTTP_200_OK
        )
