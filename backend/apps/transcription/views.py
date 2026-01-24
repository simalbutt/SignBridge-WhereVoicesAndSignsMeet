from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.http import FileResponse
from django.conf import settings
from urllib.parse import urlparse
import os

from .services.whisper_service import transcribe_video


class GenerateTranscriptView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        video_url = request.data.get("video_url")
        if not video_url:
            return Response(
                {"error": "Video URL is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        parsed = urlparse(video_url)
        relative_path = parsed.path.replace(settings.MEDIA_URL, "")
        video_path = os.path.join(settings.MEDIA_ROOT, relative_path)

        if not os.path.exists(video_path):
            return Response(
                {"error": "Video not found"},
                status=status.HTTP_404_NOT_FOUND
            )

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
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class DownloadTranscriptView(APIView):
    permission_classes = []

    def get(self, request):
        filename = request.GET.get("file")
        folder = request.GET.get("folder", "")

        if not filename:
            return Response(
                {"error": "Filename is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        transcript_path = os.path.join(settings.MEDIA_ROOT, folder, filename)

        if not os.path.exists(transcript_path):
            return Response(
                {"error": "Transcript file not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        response = FileResponse(
            open(transcript_path, "rb"),
            as_attachment=True,
            filename=filename
        )
        return response
