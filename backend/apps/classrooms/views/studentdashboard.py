from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from ..models.classroom import Classroom
from ..models.classroom import Enrollment
from ..serializers.student import (
    StudentClassSerializer,
    EnrollClassSerializer,
)


class StudentClassListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        classrooms = Classroom.objects.filter(
            enrollments__student=request.user
        )

        serializer = StudentClassSerializer(classrooms, many=True)
        return Response({
            "success": True,
            "data": serializer.data
        })
class EnrollInClassView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = EnrollClassSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        title = serializer.validated_data["title"]
        code = serializer.validated_data["code"]

        try:
            classroom = Classroom.objects.get(title=title, code=code)
        except Classroom.DoesNotExist:
            return Response({
                "success": False,
                "message": "Invalid class name or code"
            }, status=status.HTTP_404_NOT_FOUND)

        enrollment, created = Enrollment.objects.get_or_create(
            classroom=classroom,
            student=request.user
        )

        if not created:
            return Response({
                "success": False,
                "message": "Already enrolled in this class"
            }, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            "success": True,
            "message": "Successfully enrolled in class"
        })
class UnenrollClassView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, classroom_id):
        try:
            enrollment = Enrollment.objects.get(
                classroom_id=classroom_id,
                student=request.user
            )
        except Enrollment.DoesNotExist:
            return Response({
                "success": False,
                "message": "Enrollment not found"
            }, status=status.HTTP_404_NOT_FOUND)

        enrollment.delete()
        return Response({
            "success": True,
            "message": "Unenrolled successfully"
        })
