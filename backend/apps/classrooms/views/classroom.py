from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from ..models.classroom import Classroom
from ..serializers.classroom import ClassroomSerializer

class ClassroomListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """List all classrooms of the logged-in teacher"""
        user = request.user
        if user.role != "teacher":
            return Response(
                {"success": False, "message": "Only teachers can view their classes."},
                status=status.HTTP_403_FORBIDDEN,
            )

        classrooms = Classroom.objects.filter(teacher=user)
        serializer = ClassroomSerializer(classrooms, many=True)
        return Response({"success": True, "data": serializer.data})

    def post(self, request):
        """Create a new classroom"""
        user = request.user
        if user.role != "teacher":
            return Response(
                {"success": False, "message": "Only teachers can create classes."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = ClassroomSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(teacher=user)
            return Response({"success": True, "data": serializer.data}, status=status.HTTP_201_CREATED)

        return Response({"success": False, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


class ClassroomDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        """Delete a classroom"""
        user = request.user
        try:
            classroom = Classroom.objects.get(pk=pk)
        except Classroom.DoesNotExist:
            return Response(
                {"success": False, "message": "Classroom not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if classroom.teacher != user:
            return Response(
                {"success": False, "message": "You do not have permission to delete this class."},
                status=status.HTTP_403_FORBIDDEN,
            )

        classroom.delete()
        return Response({"success": True, "message": "Classroom deleted successfully."})
