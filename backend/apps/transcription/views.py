import os
import tempfile
from urllib.parse import urlparse
from django.conf import settings
from django.http import FileResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status

# --- NEW IMPORTS ---
from apps.classrooms.models import Comment
from apps.classrooms.serializers.comment import CommentSerializer
# -------------------

from apps.transcription.services.sign_to_text_character import SignToTextService
from .services.whisper_service import transcribe_video

# Initialize service once at the top level to keep models in memory
service = SignToTextService()

class GenerateTranscriptView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        video_url = request.data.get("video_url")
        if not video_url:
            return Response({"error": "Video URL is required"}, status=status.HTTP_400_BAD_REQUEST)

        parsed = urlparse(video_url)
        relative_path = parsed.path.replace(settings.MEDIA_URL, "")
        video_path = os.path.join(settings.MEDIA_ROOT, relative_path)

        if not os.path.exists(video_path):
            return Response({"error": "Video not found"}, status=status.HTTP_404_NOT_FOUND)

        try:
            result = transcribe_video(video_path)
            transcript_filename = os.path.basename(result["file_path"])
            download_url = (
                f"/api/transcription/download/"
                f"?file={transcript_filename}"
                f"&folder={os.path.dirname(relative_path).replace(os.sep, '/')}"
            )

            return Response({
                "transcription": result["text"],
                "sentences": result["sentences"],
                "download_url": download_url,
            }, status=status.HTTP_200_OK)

        except Exception as e:
            print("Transcription error:", str(e))
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class DownloadTranscriptView(APIView):
    permission_classes = []

    def get(self, request):
        filename = request.GET.get("file")
        folder = request.GET.get("folder", "")

        if not filename:
            return Response({"error": "Filename is required"}, status=status.HTTP_400_BAD_REQUEST)

        transcript_path = os.path.join(settings.MEDIA_ROOT, folder, filename)

        if not os.path.exists(transcript_path):
            return Response({"error": "Transcript file not found"}, status=status.HTTP_404_NOT_FOUND)

        return FileResponse(open(transcript_path, "rb"), as_attachment=True, filename=filename)

class CharacterInferenceView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [] 

    def post(self, request):
        video_file = request.FILES.get('video')
        if not video_file:
            return Response({"error": "No video file provided"}, status=status.HTTP_400_BAD_REQUEST)

        temp_path = None
        try:
            with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as temp_video:
                for chunk in video_file.chunks():
                    temp_video.write(chunk)
                temp_path = temp_video.name

            final_text = service.process_video_file(temp_path)
            
            return Response({
                "prediction": final_text, 
                "status": "success"
            }, status=status.HTTP_200_OK)

        except Exception as e:
            print("Video Processing Error:", str(e))
            return Response({"error": "AI processing failed"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        finally:
            if temp_path and os.path.exists(temp_path):
                try:
                    os.remove(temp_path)
                except PermissionError:
                    pass 

class CommentCreateView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser] # Added parsers to handle the video upload

    def post(self, request, announcement_id):
        video_file = request.FILES.get('video')
        # comment_text is the text from the Student's input box
        comment_text = request.data.get('text', '') 
        # extracted_ai_text is the hidden AI result sent for the teacher's benefit
        extracted_ai_text = request.data.get('ai_text', '') 

        try:
            comment = Comment.objects.create(
                user=request.user,
                announcement_id=announcement_id,
                video=video_file,
                text=comment_text,       
                ai_text=extracted_ai_text 
            )

            # We pass the context to the serializer so it can build absolute URLs for the video
            serializer = CommentSerializer(comment, context={'request': request})
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            print("Error creating comment:", str(e))
            return Response({"error": "Failed to save comment"}, status=status.HTTP_400_BAD_REQUEST)

class CommentReplyView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, comment_id):
        try:
            comment = Comment.objects.get(id=comment_id)
            # React is sending { reply: text }
            reply_text = request.data.get('reply')
            
            comment.reply = reply_text
            comment.save()
            
            # Use context so the serializer can build full URLs for the video if needed
            serializer = CommentSerializer(comment, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Comment.DoesNotExist:
            return Response({"error": "Comment not found"}, status=status.HTTP_404_NOT_FOUND)
        
class CameraInferenceView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        image_file = request.FILES.get('image')
        if not image_file:
            return Response({"error": "No frame provided"}, status=400)

        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_img:
            for chunk in image_file.chunks():
                temp_img.write(chunk)
            temp_path = temp_img.name

        try:
            # This calls the service we updated above
            prediction = service.process_single_frame(temp_path)
            
            # Map special characters for the frontend
            if prediction:
                low = prediction.lower()
                if low == 'space': prediction = ' '
                elif low == 'nothing': prediction = None
                elif low == 'del': prediction = 'BACKSPACE' # Frontend can handle this

            return Response({"prediction": prediction}, status=200)
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)

class CommentDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, comment_id):
        try:
            # We use .filter().first() to avoid the "DoesNotExists" crash
            comment = Comment.objects.filter(id=comment_id).first()
            
            if not comment:
                return Response({"error": "Comment not found"}, status=status.HTTP_404_NOT_FOUND)

            # Check if this user is allowed to delete it
            if comment.user != request.user:
                return Response({"error": "You cannot delete someone else's comment"}, status=status.HTTP_403_FORBIDDEN)

            comment.delete()
            return Response({"message": "Deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
            
        except Exception as e:
            # This prints the REAL error in your terminal
            print(f"CRASH ERROR: {str(e)}") 
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)