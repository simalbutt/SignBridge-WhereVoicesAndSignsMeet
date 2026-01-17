from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from ...utils.response import api_response

class DeleteAccountView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        user = request.user
        user.delete()
        return api_response(
            message="Account deleted successfully.",
            success=True,
            status=status.HTTP_200_OK
        )
