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
        """
        Transcribe video and return transcription text + download URL.
        The download URL points to a Django endpoint that streams the file.
        """
        video_url = request.data.get("video_url")
        if not video_url:
            return Response(
                {"error": "Video URL is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        parsed_url = urlparse(video_url)
        media_relative_path = parsed_url.path.replace(settings.MEDIA_URL, "")
        video_path = os.path.join(settings.MEDIA_ROOT, media_relative_path)

        if not os.path.exists(video_path):
            return Response(
                {"error": "Video file not found", "expected_path": video_path},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            result = transcribe_video(video_path)
            transcript_path = result["file_path"] 
            transcript_filename = os.path.basename(transcript_path)
            download_url = f"/api/transcription/download/?file={transcript_filename}&folder={os.path.dirname(media_relative_path).replace(os.sep, '/')}"

            return Response({
                "transcription": result["text"],
                "download_url": download_url
            })

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class DownloadTranscriptView(APIView):
    permission_classes = []

    def get(self, request):
        """
        Streams transcript file as a download.
        Example URL:
        /api/transcription/download/?file=shorts_transcript.txt&folder=announcements/files
        """
        filename = request.GET.get("file")
        folder = request.GET.get("folder", "")

        if not filename:
            return Response({"error": "Filename is required"}, status=status.HTTP_400_BAD_REQUEST)

        transcript_path = os.path.join(settings.MEDIA_ROOT, folder, filename)

        if not os.path.exists(transcript_path):
            return Response({"error": "Transcript file not found"}, status=status.HTTP_404_NOT_FOUND)

        response = FileResponse(open(transcript_path, 'rb'), as_attachment=True)
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response
