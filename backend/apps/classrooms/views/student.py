from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from django.shortcuts import get_object_or_404

from apps.accounts.models import User
from ..models.classroom import Classroom, Enrollment
from ..models.invite import StudentInvite
from ..serializers.enrollment import EnrollmentSerializer
from ..serializers.add_student import AddStudentSerializer
from ...utils.response import api_response


class ClassroomStudentsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, classroom_id):
        classroom = get_object_or_404(Classroom, id=classroom_id)

        if classroom.teacher != request.user:
            return api_response("Unauthorized", success=False, status=403)

        enrollments = Enrollment.objects.filter(classroom=classroom)
        serializer = EnrollmentSerializer(enrollments, many=True)

        return api_response(
            message="Students fetched successfully",
            data=serializer.data,
            success=True
        )


class AddStudentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, classroom_id):
        serializer = AddStudentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]
        classroom = get_object_or_404(Classroom, id=classroom_id)

        if classroom.teacher != request.user:
            return api_response("Unauthorized", success=False, status=403)
        try:
            student = User.objects.get(email=email, role="student")
            Enrollment.objects.get_or_create(classroom=classroom, student=student)

            return api_response(
                message=f"{student.name} added to classroom",
                success=True
            )

        except User.DoesNotExist:
            invite = StudentInvite.objects.create(email=email, classroom=classroom)

            frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:3000")
            invite_link = f"{frontend_url}/signup?invite={invite.token}"

            subject = f"Invitation to join '{classroom.title}' on SignBridge"
            text_content = (
                f"Hello,\n\n"
                f"You have been invited to join the classroom '{classroom.title}' on SignBridge.\n"
                f"Sign up using this link: {invite_link}\n\n"
                "If you did not expect this email, please ignore it.\n\n"
                "Thanks!"
            )
            html_content = f"""
            <p>Hello,</p>
            <p>You have been invited to join the classroom '<strong>{classroom.title}</strong>' on SignBridge.</p>
            <p>Sign up using this link: <a href="{invite_link}">{invite_link}</a></p>
            <p>If you did not expect this email, please ignore it.</p>
            <p>Thanks!</p>
            """

            email_message = EmailMultiAlternatives(
                subject=subject,
                body=text_content,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[email]
            )
            email_message.attach_alternative(html_content, "text/html")
            email_message.send(fail_silently=False)

            return api_response(
                message="Invitation email sent",
                success=True
            )


class RemoveStudentView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, classroom_id, student_id):
        classroom = get_object_or_404(Classroom, id=classroom_id)

        if classroom.teacher != request.user:
            return api_response("Unauthorized", success=False, status=403)

        deleted, _ = Enrollment.objects.filter(
            classroom=classroom,
            student_id=student_id
        ).delete()

        if deleted:
            return api_response(
                message="Student removed successfully",
                success=True
            )
        else:
            return api_response(
                message="Student not found in this classroom",
                success=False,
                status=404
            )
