from rest_framework.views import APIView
from rest_framework import status
from ..serializers.signup import SignupSerializer
from ...utils.response import api_response

class SignupView(APIView):
    permission_classes = []  
    

    def post(self, request):
        print(request.data)
        serializer = SignupSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()

            data = {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "role": user.role
            }

            return api_response(
                message="Signup successful! You can now login.",
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
