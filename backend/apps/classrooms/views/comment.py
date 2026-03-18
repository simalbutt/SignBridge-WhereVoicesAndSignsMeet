from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status

from apps.classrooms.models import Comment
from apps.classrooms.serializers.comment import CommentSerializer
from apps.announcements.models import Announcement
from apps.announcements.permissions import (
    IsEnrolledOrTeacher,
    IsAuthorOrTeacher,
    IsTeacher
)
from apps.utils.response import api_response   

class CommentListView(APIView):
    permission_classes = [IsAuthenticated, IsEnrolledOrTeacher]

    def get(self, request, announcement_id):
        comments = Comment.objects.filter(
            announcement_id=announcement_id
        ).order_by("created_at")

        serializer = CommentSerializer(
            comments, many=True, context={'request': request}
        )

        return api_response(
            message="Comments fetched successfully",
            data=serializer.data,
            status=status.HTTP_200_OK
        )


class CommentCreateView(APIView):
    permission_classes = [IsAuthenticated, IsEnrolledOrTeacher]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, announcement_id):
        video_file = request.FILES.get('video')
        text = request.data.get('text', '')
        ai_text = request.data.get('ai_text', '')

        try:
            announcement = Announcement.objects.filter(id=announcement_id).first()
            if not announcement:
                return api_response(
                    message="Announcement not found",
                    success=False,
                    status=status.HTTP_404_NOT_FOUND
                )

            comment = Comment.objects.create(
                user=request.user,
                announcement=announcement,
                video=video_file,
                text=text,
                ai_text=ai_text
            )

            serializer = CommentSerializer(comment, context={'request': request})

            return api_response(
                message="Comment created successfully",
                data=serializer.data,
                status=status.HTTP_201_CREATED
            )

        except Exception as e:
            print("Create Comment Error:", str(e))
            return api_response(
                message="Failed to create comment",
                success=False,
                status=status.HTTP_400_BAD_REQUEST
            )


class CommentUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, comment_id):
        comment = Comment.objects.filter(id=comment_id).first()

        if not comment:
            return api_response(
                message="Comment not found",
                success=False,
                status=status.HTTP_404_NOT_FOUND
            )

        permission = IsAuthorOrTeacher()
        if not permission.has_object_permission(request, self, comment):
            return api_response(
                message="Not allowed",
                success=False,
                status=status.HTTP_403_FORBIDDEN
            )

        comment.text = request.data.get("text", comment.text)
        comment.save()

        serializer = CommentSerializer(comment, context={'request': request})

        return api_response(
            message="Comment updated successfully",
            data=serializer.data
        )


class CommentDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, comment_id):
        comment = Comment.objects.filter(id=comment_id).first()

        if not comment:
            return api_response(
                message="Comment not found",
                success=False,
                status=status.HTTP_404_NOT_FOUND
            )

        permission = IsAuthorOrTeacher()
        if not permission.has_object_permission(request, self, comment):
            return api_response(
                message="Not allowed",
                success=False,
                status=status.HTTP_403_FORBIDDEN
            )

        comment.delete()

        return api_response(
            message="Comment deleted successfully",
            status=status.HTTP_204_NO_CONTENT
        )

class CommentReplyView(APIView):
    permission_classes = [IsAuthenticated, IsTeacher]

    def post(self, request, comment_id):
        comment = Comment.objects.filter(id=comment_id).first()

        if not comment:
            return api_response(
                message="Comment not found",
                success=False,
                status=status.HTTP_404_NOT_FOUND
            )

        reply_text = request.data.get('reply')

        if not reply_text:
            return api_response(
                message="Reply text is required",
                success=False,
                status=status.HTTP_400_BAD_REQUEST
            )

        comment.reply = reply_text
        comment.save()

        serializer = CommentSerializer(comment, context={'request': request})

        return api_response(
            message="Reply added successfully",
            data=serializer.data
        )
class CommentReplyUpdateView(APIView):
    permission_classes = [IsAuthenticated, IsTeacher]

    def put(self, request, comment_id):
        comment = Comment.objects.filter(id=comment_id).first()

        if not comment:
            return api_response(
                message="Comment not found",
                success=False,
                status=status.HTTP_404_NOT_FOUND
            )

        reply_text = request.data.get('reply')

        if not reply_text:
            return api_response(
                message="Reply text is required",
                success=False,
                status=status.HTTP_400_BAD_REQUEST
            )

        comment.reply = reply_text
        comment.save()

        serializer = CommentSerializer(comment, context={'request': request})

        return api_response(
            message="Reply updated successfully",
            data=serializer.data
        )
class CommentReplyDeleteView(APIView):
    permission_classes = [IsAuthenticated, IsTeacher]

    def delete(self, request, comment_id):
        comment = Comment.objects.filter(id=comment_id).first()

        if not comment:
            return api_response(
                message="Comment not found",
                success=False,
                status=status.HTTP_404_NOT_FOUND
            )

        if not comment.reply:
            return api_response(
                message="No reply to delete",
                success=False,
                status=status.HTTP_400_BAD_REQUEST
            )

        comment.reply = None
        comment.save()

        serializer = CommentSerializer(comment, context={'request': request})

        return api_response(
            message="Reply deleted successfully",
            data=serializer.data
        )